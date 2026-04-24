# CLAUDE.md — Instructions for Claude agents working on CodeSchedule

> Read this file first. Then read [docs/PRD.md](./docs/PRD.md) and
> [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) before changing any code.

---

## 1. Project overview (for agents)

CodeSchedule is an open-source platform that emails one programming topic
per day to subscribed users, on a schedule of their choice. Users pick a
technology (JavaScript, Python, React, …), set delivery time(s) and
timezone, and receive bite-sized lessons from beginner to advanced.

- **Client:** React + Vite + TypeScript SPA (deployed to Vercel).
- **Server:** Node.js + Express + MongoDB + node-cron (deployed to Render).
- **Email:** Nodemailer via Gmail SMTP.
- **Topics:** JSON files in `packages/topics/`, versioned in git.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full picture.

---

## 2. Monorepo structure

```
apps/client/        React + Vite + TypeScript SPA
apps/server/        Express API + node-cron scheduler
packages/topics/    Shared topic JSON files
docs/               Project documentation (read these first)
agents/             Subagent orchestration system
  ├── <role>.md     Agent contracts (orchestrator, analyst, architect, …)
  ├── status/       Live pipeline state
  ├── tasks/        Task specs that flow through the pipeline
  └── artifacts/    Output documents produced by each agent
scripts/            Pipeline and ops scripts
```

Workspaces use npm workspaces (see root `package.json`). No Turbo/Nx.

---

## 3. Coding conventions (authoritative summary)

Full version: [docs/WORKFLOWS.md](./docs/WORKFLOWS.md#4-coding-conventions).

- **TypeScript:** strict mode everywhere. No bare `any`.
- **Naming:**
  - `camelCase` for variables, functions, methods.
  - `PascalCase` for React components, classes, type/interface names.
  - `SCREAMING_SNAKE_CASE` for env vars.
  - `kebab-case` for non-component filenames.
- **File structure:**
  - One exported "thing" per file where practical.
  - Tests live beside source: `foo.ts` → `foo.test.ts`.
  - No cross-layer `index.ts` barrels.
- **Imports:** absolute aliases within an app (`@/services/...`). No
  cross-app imports except via `packages/`.
- **Error handling:** services throw typed `AppError` with a `code`. Only
  the Express error middleware and the scheduler tick loop translate
  errors into HTTP responses or logs.

---

## 4. Environment variables

Full table in [docs/WORKFLOWS.md](./docs/WORKFLOWS.md#5-environment-variables).

Quick reference:

| Server | Client |
|---|---|
| `NODE_ENV`, `PORT` | `VITE_API_URL` |
| `MONGODB_URI` | |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | |
| `UNSUBSCRIBE_SECRET` | |
| `CLIENT_ORIGIN` | |

`.env.example` is the single source of truth. Any new var must be added
there in the same PR that introduces it.

---

## 5. How to run the project

```bash
npm install                 # install all workspaces
npm run dev                 # run client + server together
npm run dev:client          # client only
npm run dev:server          # server only
npm run --workspace=apps/server seed   # seed demo data
```

Client dev: `http://localhost:5173`.
API: `http://localhost:4000/api`.

---

## 6. Agent roles — who owns what

This project is built by a strict five-stage agent pipeline. Do **not**
edit files outside your role's ownership.

| Agent | Owns | Must not touch |
|---|---|---|
| **Orchestrator** | `agents/status/*`, `agents/tasks/*`, `agents/orchestrator.md` | All source code in `apps/**`, `packages/**` |
| **Analyst** | `agents/artifacts/analyst/*.md` | Any code; architect/developer/tester artifacts |
| **Architect** | `agents/artifacts/architect/*.md` | Any code; analyst/developer/tester artifacts |
| **Developer** | `apps/**/*`, `packages/**/*` (except `*.test.*`) | Status files, agent artifacts, test files |
| **Tester** | `apps/**/*.test.ts`, `apps/**/__tests__/**`, `agents/artifacts/tester/*.md` | Non-test source files |
| **Reporter** | `agents/artifacts/reporter/*.md` | All source, tests, and other artifacts |

If you are running as a specific role, read `agents/<role>.md` for your
full contract (inputs, outputs, completion criteria, handoff rules).

---

## 7. Pipeline rules (every agent must obey)

1. **Read the status files first.** Your starting point is
   `agents/status/*.md`. Do not begin work unless the previous stage is
   `COMPLETE`.
2. **Write your status at the start.** Set your own status file to
   `IN_PROGRESS` with the current ISO date and the task id you're on.
3. **Produce a named artifact.** Every completed stage produces a file in
   `agents/artifacts/<role>/<task-id>.md` that the next stage will read.
4. **Update status at the end.** `COMPLETE` with an `output_artifact:`
   pointer, or `FAILED` with a `blockers:` paragraph describing what's
   wrong and what input you need.
5. **No skipping, no overlapping.** Don't start the next stage yourself —
   control returns to the orchestrator, which starts the next agent.

---

## 8. Testing conventions

- Unit tests: Vitest. Fast, isolated, no I/O.
- Integration tests (server): Vitest + `mongodb-memory-server`. No
  mocked DB — use a real one.
- E2E: Playwright for the signup → create subscription flow.

Naming: `<name>.test.ts` (unit), `<name>.integration.test.ts` (integration),
`apps/client/e2e/<flow>.spec.ts` (E2E).

Rules: clean up in `afterEach`; no `.only`/`.skip` in commits.

Full version: [docs/WORKFLOWS.md](./docs/WORKFLOWS.md#7-testing-conventions).

---

## 9. Git commit message format

Conventional Commits.

```
<type>: <imperative subject, ≤72 chars>

<optional body explaining *why*>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.

Examples:
- `feat: add pause/resume endpoints for subscriptions`
- `fix: prevent double-send when scheduler tick overlaps`

Full version: [docs/WORKFLOWS.md](./docs/WORKFLOWS.md#2-commit-message-format).

---

## 10. If you're unsure

- Re-read the role file in `agents/<role>.md`.
- Re-read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
- If still unsure, set your status to `FAILED` with a clear
  `blockers:` paragraph. Do **not** invent conventions or edit files
  outside your ownership to "get unblocked".
