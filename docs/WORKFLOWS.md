# CodeSchedule — Development Workflows & Conventions

## 1. Branching

- `main` — always deployable. Vercel and Render auto-deploy from it.
- Feature branches: `feat/<short-kebab>` (e.g. `feat/pause-endpoint`).
- Bugfix branches: `fix/<short-kebab>`.
- Chore/docs: `chore/<short-kebab>`, `docs/<short-kebab>`.

No long-lived `dev`/`staging` branches — preview URLs on Vercel cover
that need.

---

## 2. Commit message format

Conventional Commits. Lowercase type, no scope unless helpful.

```
<type>: <imperative subject, ≤72 chars>

<optional body explaining *why*, wrapped at 80 chars>

<optional footers (BREAKING CHANGE:, Refs: #123)>
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.

Good:
- `feat: add pause/resume endpoints for subscriptions`
- `fix: prevent double-send when scheduler tick overlaps`
- `refactor: extract topic loader into its own service`

Bad:
- `updates` *(type missing, not imperative)*
- `feat: fixed the bug where sometimes it doesn't work` *(wrong type, vague)*

---

## 3. Pull request checklist

Every PR description must include:

1. **What** — one paragraph on what changed.
2. **Why** — link to the task/issue, or the motivating user behavior.
3. **How to verify** — explicit steps for the reviewer (commands, URLs,
   expected output).
4. **Screenshots** — for any UI change.
5. **Migration notes** — if schemas or env vars changed.

CI must be green before merge. Squash-merge is the default.

---

## 4. Coding conventions

### TypeScript (both client and server)
- `"strict": true` everywhere. No `any` without a `// eslint-disable-next-line`
  and a one-line comment explaining why.
- Prefer `type` for unions and aliases, `interface` for object shapes that
  other code may extend.
- Export *types*, not Mongoose models, across the client/server boundary.

### Naming
- `camelCase` — variables, functions, methods.
- `PascalCase` — React components, classes, type/interface names.
- `SCREAMING_SNAKE_CASE` — env vars and top-level constants.
- `kebab-case` — file names for non-component modules (e.g.
  `schedule-service.ts`).
- React component files match the component name (`SubscriptionCard.tsx`).

### File structure
- One exported "thing" per file where practical. Small helpers can cohabit.
- Tests live next to the code: `foo.ts` → `foo.test.ts`.
- No `index.ts` barrels across layers — they hide dependencies.

### Imports
- Absolute imports via TS path aliases (`@/services/...`) inside each app.
- No cross-app imports except via the `packages/` workspace.

### Error handling
- Services throw typed errors (`AppError` with a `code`).
- Only the Express error middleware and the scheduler tick loop convert
  errors to HTTP responses or log entries.

---

## 5. Environment variables

| Var | Where | Example |
|---|---|---|
| `NODE_ENV` | server | `development` \| `production` |
| `PORT` | server | `4000` |
| `MONGODB_URI` | server | `mongodb+srv://...` |
| `JWT_SECRET` | server | 32-byte random string |
| `JWT_EXPIRES_IN` | server | `7d` |
| `SMTP_HOST` | server | `smtp.gmail.com` |
| `SMTP_PORT` | server | `465` |
| `SMTP_USER` | server | `codeschedule@gmail.com` |
| `SMTP_PASS` | server | Gmail app password |
| `EMAIL_FROM` | server | `CodeSchedule <codeschedule@gmail.com>` |
| `UNSUBSCRIBE_SECRET` | server | 32-byte random string (HMAC) |
| `CLIENT_ORIGIN` | server | `http://localhost:5173` |
| `VITE_API_URL` | client | `http://localhost:4000/api` |

`.env.example` is the source of truth. Any new var must be added there in
the same PR that introduces it.

---

## 6. Running the project

```bash
# Install everything once
npm install

# Run client + server together
npm run dev

# Run one at a time
npm run dev:client
npm run dev:server

# Seed demo data
npm run --workspace=apps/server seed
```

Client dev server: `http://localhost:5173`.
API: `http://localhost:4000/api`.

---

## 7. Testing conventions

- **Unit tests** — Vitest (client) and Vitest (server). Fast, isolated,
  no I/O.
- **Integration tests** (server) — Vitest with a real MongoDB instance
  (spin one up via `mongodb-memory-server`). No mocked DB.
- **E2E** — Playwright, runs against a locally started client+server.
  MVP: smoke tests for signup → create subscription → receive email.

Naming:
- Unit test files: `<name>.test.ts`.
- Integration: `<name>.integration.test.ts`.
- E2E: `apps/client/e2e/<flow>.spec.ts`.

Rules:
- Tests that modify global state must clean up in `afterEach`.
- No `.skip`/`.only` in committed code. CI fails on either.
- Snapshot tests are allowed only for email HTML templates.

---

## 8. Review workflow

1. Author opens a PR against `main`.
2. CI runs: typecheck, lint, unit + integration tests.
3. At least one reviewer approves. For first-time contributors, a
   maintainer reviews.
4. Author squash-merges. PR title becomes the commit message — it must
   follow the Conventional Commits format above.

---

## 9. Release and deploy

- Merge to `main` → Vercel deploys client, Render deploys server.
- Tag releases manually: `v0.Y.Z`, written in the GitHub release notes.
- Rollback: Render "Rollback" button or redeploy prior commit on Vercel.

---

## 10. When in doubt

- Prefer reading [ARCHITECTURE.md](./ARCHITECTURE.md) before guessing.
- Prefer editing existing files to creating new ones.
- If a convention is missing, pick a reasonable default, document it here
  in the same PR, and move on.
