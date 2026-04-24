---
task_id: task-001
title: Build the complete CodeSchedule backend
status: READY
created: 2026-04-22
owner: human
---

# Task 001 — Build the complete CodeSchedule backend

## Goal

Implement the end-to-end backend for CodeSchedule so that a user can
register, log in, create a subscription, and receive scheduled topic
emails. This is the first task to flow through the five-stage agent
pipeline.

No frontend work in this task — only `apps/server/**` and any shared
code in `packages/**` it depends on.

## In scope

1. **User authentication**
   - Register with email, password, name.
   - Log in with email + password.
   - Passwords hashed with bcrypt (cost 12).
   - JWT-based auth with configurable expiration
     (`JWT_EXPIRES_IN`, default `7d`).
   - Current-user endpoint (`GET /api/auth/me`).
   - Logout endpoint (stateless no-op for MVP).

2. **User model**
   - Mongoose schema matching [docs/DATABASE.md §1](../../docs/DATABASE.md#1-users).
   - Email unique index, lowercased & trimmed.
   - Timestamps enabled.
   - `passwordHash` never serialized in API responses.

3. **Subscription model and endpoints**
   - Mongoose schema matching [docs/DATABASE.md §2](../../docs/DATABASE.md#2-subscriptions).
   - All CRUD endpoints from [docs/API.md §3](../../docs/API.md#3-subscriptions-schedules),
     including pause/resume/reset convenience endpoints.
   - Validation via Zod matching the rules in both docs.
   - `(userId, technology)` unique — cannot subscribe twice to the
     same technology.

4. **Topic service**
   - Load `packages/topics/*.json` at boot.
   - Expose `getTopicByIndex(technology, index)` and
     `getTopicCount(technology)`.
   - Public read-only endpoints from [docs/API.md §4](../../docs/API.md#4-topics-read-only-catalog).

5. **Email scheduler**
   - `node-cron` tick every minute inside the server process.
   - Query due subscriptions using `status`, `nextSendDueAt`, and
     timezone math.
   - Advance `currentTopicIndex` and update `lastSentAt` and
     `nextSendDueAt` atomically per subscription.
   - Idempotent: process crash mid-tick must not double-send.

6. **Email service**
   - Nodemailer transport configured from env
     (`SMTP_*`, `EMAIL_FROM`).
   - HTML template for a daily lesson email, with plain-text fallback.
   - Signed one-click unsubscribe link using `UNSUBSCRIBE_SECRET`.
   - Failures logged to `emailLogs` with `status: "failed"`.

7. **Unsubscribe endpoint**
   - Token-based, public, matches [docs/API.md §5](../../docs/API.md#5-unsubscribe-public-token-based).
   - Sets the subscription to `paused`.

8. **Email logs & unsubscribe tokens models**
   - Per [docs/DATABASE.md §§3–4](../../docs/DATABASE.md#3-emaillogs).

9. **Health endpoint** — per [docs/API.md §6](../../docs/API.md#6-health).

10. **MongoDB Atlas connection**
    - Single connection via `MONGODB_URI`.
    - Connection retry with backoff.
    - Graceful shutdown on SIGTERM.

11. **Middleware**
    - `auth` — verifies JWT, attaches `req.user`.
    - `error` — centralized error formatter using the `AppError`
      contract from [docs/API.md](../../docs/API.md#response-envelope).
    - `validate` — Zod-based body/query validation.

12. **Env & docs**
    - Any new env var added to `.env.example` in the same change.

## Out of scope

- Frontend (`apps/client/**`) is not touched in this task.
- Admin endpoints.
- Email open/bounce tracking.
- OAuth / social login.
- Payment or plan logic.
- Actually populating `packages/topics/*.json` with real content —
  one minimal sample file is fine.

## Acceptance criteria

1. `POST /api/auth/register` with a valid body returns `201` and a
   JWT whose payload includes the user id.
2. Registering with an existing email returns `409`
   `{ error: { code: "CONFLICT", ... } }`.
3. `POST /api/auth/login` with wrong password returns `401`
   `INVALID_CREDENTIALS`.
4. `GET /api/auth/me` without a token returns `401 UNAUTHORIZED`;
   with a valid token returns the user, **without** `passwordHash`.
5. `POST /api/subscriptions` with a valid body returns `201`, and the
   created subscription has `currentTopicIndex: 0`,
   `status: "active"`, `lastSentAt: null`.
6. Attempting two subscriptions to the same technology for the same
   user returns `409 CONFLICT`.
7. `PATCH /api/subscriptions/:id` on another user's subscription
   returns `403 FORBIDDEN`.
8. The scheduler, when given a subscription whose
   `nextSendDueAt <= now` and `status: "active"`, sends exactly one
   email, advances `currentTopicIndex` by 1, and updates
   `lastSentAt` + `nextSendDueAt`.
9. If the email transport throws, the scheduler writes an
   `emailLogs` entry with `status: "failed"` and
   **does not** advance `currentTopicIndex`.
10. `GET /api/unsubscribe/:token` with a valid token marks the
    subscription `paused` and returns `200`.
11. `GET /api/health` returns `200` with `status: "ok"` and a live
    DB check.
12. All new env vars are documented in `.env.example`.

## Handoff

This task is the input for the **Analyst**. The Orchestrator will
set `agents/status/analyst-status.md` to `IN_PROGRESS` with
`current_task: task-001` and `input_artifact:
agents/tasks/task-001.md`.
