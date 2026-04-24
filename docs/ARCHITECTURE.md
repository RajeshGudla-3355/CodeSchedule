# CodeSchedule — Architecture

## 1. Monorepo Structure

```
codeschedule/
├── apps/
│   ├── client/                 React + Vite + TypeScript SPA
│   │   └── src/
│   │       ├── components/     Reusable UI components
│   │       ├── pages/          Route-level components
│   │       ├── hooks/          Custom React hooks
│   │       ├── lib/            API client, utilities
│   │       └── types/          TypeScript types shared with server responses
│   │
│   └── server/                 Node.js + Express API
│       ├── routes/             Express route handlers
│       ├── models/             Mongoose models
│       ├── services/           Business logic (email, scheduler, auth)
│       ├── middleware/         Express middleware (auth, error, validation)
│       └── scripts/            One-off maintenance scripts (seed, migrate)
│
├── packages/
│   └── topics/                 Shared topic JSON files
│       ├── javascript.json
│       ├── python.json
│       ├── typescript.json
│       └── ...
│
├── agents/                     Claude subagent orchestration system
├── docs/                       Project documentation (this folder)
├── scripts/                    Pipeline and ops scripts
├── .github/workflows/          CI/CD
├── .env.example
├── CLAUDE.md                   Instructions for Claude agents
├── package.json                Root workspace config
└── README.md
```

**Why monorepo:** shared TypeScript types for API request/response bodies,
a single `npm install` for contributors, and a single CI pipeline. npm
workspaces avoid Turbo/Nx overhead at this scale.

---

## 2. Frontend Architecture

**Stack:** React 18 + Vite 5 + TypeScript 5 (strict mode).

### Routing
React Router v6. Routes:
- `/` — marketing landing page
- `/register`, `/login` — auth
- `/dashboard` — authed shell, lists subscriptions
- `/subscriptions/new` — create subscription flow
- `/subscriptions/:id` — edit / pause / delete a subscription
- `/settings` — profile and password
- `/unsubscribe/:token` — one-click unsubscribe (unauthed)

### State
- **Server state:** React Query (TanStack Query) — handles caching,
  refetching, and optimistic updates for subscription CRUD.
- **Auth state:** React Context wrapping a JWT in `localStorage`.
- **Form state:** React Hook Form + Zod.
- **No Redux.** Component-local `useState` for everything else.

### Styling
Plain CSS modules. No Tailwind, no styled-components — keeps the bundle
small and contributions easy.

### API client
A single `apps/client/src/lib/api.ts` wraps `fetch` with:
- base URL from `VITE_API_URL`
- automatic `Authorization: Bearer <jwt>` header
- typed response envelopes (`ApiResponse<T>`)

---

## 3. Backend Architecture

**Stack:** Node.js 20 + Express 4 + TypeScript + Mongoose 8.

### Layered structure
```
routes/       HTTP layer — parse request, call service, format response
  ↓
services/     Business logic — auth, scheduling, email composition
  ↓
models/       Mongoose schemas — persistence
```

Routes never touch Mongoose directly. Services never touch `req`/`res`.
This keeps the scheduler (which has no HTTP context) able to call the same
service code the routes use.

### Key services
- `services/authService.ts` — registration, login, password hashing (bcrypt),
  JWT issuance and verification.
- `services/scheduleService.ts` — subscription CRUD, timezone math, "next
  topic index" computation.
- `services/emailService.ts` — HTML template rendering, Nodemailer transport,
  retry + failure logging.
- `services/topicService.ts` — loads `packages/topics/*.json` at boot,
  provides `getTopicByIndex(tech, i)`.

### Middleware
- `middleware/auth.ts` — verifies JWT, attaches `req.user`.
- `middleware/error.ts` — centralized error formatter, returns
  `{ error: { code, message } }`.
- `middleware/validate.ts` — Zod-based body/query validation.

---

## 4. Email Scheduling Architecture

### Why node-cron (and not BullMQ/Redis)
At MVP scale (≤ 500 active daily subscriptions), a single Render instance
with an in-process cron beats an external queue. We revisit this if we
cross 5,000 daily sends or need multi-instance deployment.

### How it works

```
Render container boot
    │
    ▼
┌──────────────────────────────────────┐
│ scheduler.start()                    │
│   cron.schedule('* * * * *', tick)   │ ← every minute
└──────────────┬───────────────────────┘
               │
               ▼
         tick() every minute
               │
               ▼
┌──────────────────────────────────────┐
│ Query MongoDB:                       │
│   find active subscriptions whose    │
│   next delivery time ≤ now (UTC),    │
│   respecting each user's timezone    │
└──────────────┬───────────────────────┘
               │
               ▼
         For each due subscription:
               │
      ┌────────┴─────────┐
      ▼                  ▼
  Load next topic    Render HTML template
      │                  │
      └────────┬─────────┘
               ▼
         Nodemailer send
               │
      ┌────────┴─────────┐
      ▼                  ▼
    success            failure
      │                  │
      ▼                  ▼
  advance index    log + flag retry
  update lastSentAt
```

### Timezone handling
Each subscription stores `timezone` (IANA, e.g. `America/New_York`) and
`deliveryTimes` (array of `HH:MM` strings). The tick loop computes
"is now ≥ today's delivery time for this subscription's timezone, and
haven't we already sent today" using `date-fns-tz`.

### Idempotency
Each subscription has `lastSentAt`. A send only proceeds if
`lastSentAt < startOfCurrentLocalDay`. This survives process restarts —
if we crash mid-send we'll retry next tick, and we won't double-send
because `lastSentAt` is updated transactionally with the index bump.

---

## 5. Data Flow — "User receives tomorrow's lesson"

```
┌─────────────┐      1. register/login      ┌─────────────┐
│   Browser   │ ───────────────────────────▶│  Express    │
│  (client)   │                              │  API        │
└─────────────┘◀─── 2. JWT ──────────────────└──────┬──────┘
                                                    │
                                             3. create
                                             subscription
                                                    │
                                                    ▼
                                             ┌─────────────┐
                                             │  MongoDB    │
                                             │  Atlas      │
                                             └──────┬──────┘
                                                    │
                                                    │
                                              ┌─────┴──────┐
                                              │ scheduler  │
                                              │ (node-cron │
                                              │ every min) │
                                              └─────┬──────┘
                                                    │
                                             4. poll due subs
                                                    │
                                                    ▼
                                             ┌─────────────┐
                                             │ topicService│
                                             │ loads JSON  │
                                             └──────┬──────┘
                                                    │
                                                    ▼
                                             ┌─────────────┐
                                             │ emailService│
                                             │ Nodemailer  │ ──▶ Gmail SMTP ──▶ User inbox
                                             └─────────────┘
```

---

## 6. Deployment Architecture

```
                       ┌───────────────────────┐
                       │   Vercel (static)     │
                       │   apps/client build   │
                       │   codeschedule.app    │
                       └───────────┬───────────┘
                                   │ HTTPS
                                   │ VITE_API_URL
                                   ▼
                       ┌───────────────────────┐
                       │   Render (node)       │
                       │   apps/server         │
                       │   api.codeschedule... │
                       │   node-cron in-proc   │
                       └───────────┬───────────┘
                                   │
                       ┌───────────┴───────────┐
                       ▼                       ▼
              ┌────────────────┐      ┌────────────────┐
              │ MongoDB Atlas  │      │  Gmail SMTP    │
              │ free M0 tier   │      │  app password  │
              └────────────────┘      └────────────────┘
```

### Environments
| Env | Client URL | API URL | DB |
|---|---|---|---|
| Development | `http://localhost:5173` | `http://localhost:4000` | Local Mongo or dev Atlas cluster |
| Production | `codeschedule.app` | `api.codeschedule.app` | Atlas M0 prod cluster |

### CI/CD
- **Client**: Vercel auto-deploys from `main`.
- **Server**: Render auto-deploys from `main` after GitHub Actions runs
  typecheck + tests.
- **Preview**: Vercel builds a preview URL for every PR. Server has no
  preview env at MVP — PRs run tests but don't deploy.
