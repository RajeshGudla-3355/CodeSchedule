# CodeSchedule

Learn any technology, one topic at a time — delivered to your inbox on your schedule.

CodeSchedule is a free, open-source developer learning platform that delivers
bite-sized programming lessons directly to your inbox — on your schedule.

Pick any technology (JavaScript, Python, TypeScript, React, CSS), choose up
to 3 delivery times per day, and receive one focused topic per email — from
beginner to advanced, in the right order, every day.

No subscriptions. No paywalls. Just consistent, structured learning
delivered to you automatically.

## Monorepo Structure

```
codeschedule/
├── apps/
│   ├── client/        ← React + TypeScript frontend (Vite)
│   └── server/        ← Node.js + Express backend
├── packages/
│   └── topics/        ← Shared topic JSON files (5 languages × 60 topics)
├── .env.example
├── .gitignore
├── package.json       ← npm workspaces root
└── README.md
```

## Tech Stack

| Layer     | Stack |
|-----------|-------|
| Frontend  | React 18, TypeScript, Vite, React Router, Axios |
| Backend   | Node.js, Express, Mongoose, JWT, bcryptjs |
| Database  | MongoDB (local or Atlas) |
| Email     | Nodemailer (Gmail SMTP) |
| Scheduler | node-cron (runs every minute, compares IST time) |

## Available Courses

Each course ships 60 topics in beginner → advanced order:

- **JavaScript** — variables, closures, arrays, DOM, promises, async/await, event loop, generators, and more
- **Python** — data types, comprehensions, OOP, decorators, generators, file I/O, regex, type hints, and more
- **TypeScript** — types, generics, narrowing, utility types, mapped/conditional types, and more
- **React** — JSX, hooks, context, performance, routing, forms, Suspense, server components, and more
- **CSS** — box model, Flexbox, Grid, custom properties, container queries, modern layout, and more

## 1. Install all dependencies

This is an npm workspaces monorepo. A single install at the root pulls everything in.

```bash
git clone <your-repo-url>
cd CodeSchedule

# installs root, apps/server, and apps/client in one shot
npm install
```

## 2. Configure environment variables

Copy the templates and fill them in:

```bash
cp .env.example .env
cp apps/client/.env.example apps/client/.env
```

Edit `.env` (backend — loaded from the repo root):

```
MONGODB_URI=mongodb://localhost:27017/codeschedule
PORT=5000
JWT_SECRET=replace-with-a-long-random-string
GMAIL_USER=your.email@gmail.com
GMAIL_PASS=your-gmail-app-password
CLIENT_URL=http://localhost:5173
```

Edit `apps/client/.env`:

```
VITE_API_URL=http://localhost:5000
```

**Gmail setup:** In your Google account, enable 2-factor auth, then create an
[App Password](https://myaccount.google.com/apppasswords) and use it as
`GMAIL_PASS`. Your regular password will not work.

**MongoDB:** Either run MongoDB locally (`brew install mongodb-community` on
macOS, or Docker: `docker run -d -p 27017:27017 mongo`), or use a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster and paste its URI.

## 3. Run frontend and backend together

From the repo root:

```bash
npm run dev
```

This runs both workspaces in parallel with colored prefixes:

- API: http://localhost:5000  (health check at `/health`)
- Web: http://localhost:5173

You can also run them separately in two terminals:

```bash
# terminal 1 — backend
npm run dev:server

# terminal 2 — frontend
npm run dev:client
```

Once the server is up you will see:

```
[db] Connected to MongoDB
[server] Listening on http://localhost:5000
[scheduler] starting cron every minute
```

Register a new account at http://localhost:5173/register, add a language on
the dashboard, and set a schedule time (in IST). The scheduler ticks every
minute and sends the next topic when the current IST time matches one of
your schedule slots.

## 4. Send a test email manually

There's a ready-made CLI script for this.

```bash
# Usage: node scripts/sendTestEmail.js <email> [language] [topicIndex]
#   language   one of: javascript, python, typescript, react, css  (default javascript)
#   topicIndex zero-based index into the topic array               (default 0)

cd apps/server

# send JavaScript topic #1 to yourself
node scripts/sendTestEmail.js you@example.com

# send Python topic #5 (index 4)
node scripts/sendTestEmail.js you@example.com python 4

# send React topic #10
node scripts/sendTestEmail.js you@example.com react 9
```

The script loads the same `.env` as the server, uses the real
`emailService` + `buildEmailTemplate`, and prints the Nodemailer
`messageId` on success. If `GMAIL_USER` / `GMAIL_PASS` are not configured,
it logs a warning and skips sending, so you can still exercise the flow.

## Backend API

All routes are JSON. Protected routes require `Authorization: Bearer <token>`.

| Method | Path                       | Auth | Purpose                                    |
|--------|----------------------------|------|--------------------------------------------|
| POST   | `/api/auth/register`       | no   | Create account, returns JWT                |
| POST   | `/api/auth/login`          | no   | Log in, returns JWT                        |
| GET    | `/api/users/me`            | yes  | Current user profile                       |
| PUT    | `/api/users/schedule`      | yes  | Replace the schedules array (max 3 times)  |
| PUT    | `/api/users/subscriptions` | yes  | Add or remove a language subscription      |
| GET    | `/api/schedule/languages`  | yes  | List available languages + topic counts    |
| GET    | `/api/schedule/progress`   | yes  | Per-subscription progress                  |

## How the scheduler works

- A `node-cron` job fires every minute: `* * * * *`
- It computes the current time in `Asia/Kolkata` (HH:MM)
- Queries MongoDB for active users whose `schedules.time` matches
- For each active subscription on each user:
  - Reads the next topic from `packages/topics/{language}.json`
  - Sends it via `emailService.sendEmail` with a styled HTML template
  - Increments `currentTopicIndex`
  - When all 60 topics are delivered, sends a completion email and
    deactivates the subscription

All activity is timestamped and logged to stdout.

## Adding a new language

1. Create `packages/topics/<language>.json` with an array of 60 topics
   (`{ id, title, subject, body, codeExample }`)
2. Add a pretty name in `apps/server/routes/schedule.js` and
   `apps/server/services/schedulerService.js` (the `PRETTY_NAMES` map)
3. Optionally add it to the landing page grid in `apps/client/src/pages/Landing.tsx`

## Contributing

Open source. Add topics, new languages, fix bugs, polish UI — PRs welcome.

## License

MIT.
