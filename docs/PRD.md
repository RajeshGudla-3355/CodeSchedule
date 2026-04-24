# CodeSchedule — Product Requirements Document

## 1. Project Overview

**CodeSchedule** is a free, open-source developer learning platform that
delivers bite-sized programming lessons directly to a user's inbox, on a
schedule the user controls.

Users pick any technology (JavaScript, Python, TypeScript, React, CSS, etc.),
choose their preferred delivery times, and receive one focused topic per email
— from beginner to advanced, in the right order, every day.

### Vision
Make consistent, structured learning as passive and reliable as a newsletter,
but as ordered and progressive as a textbook.

### Core principles
- **Free forever** — no subscriptions, no paywalls, no ads.
- **Open source** — anyone can contribute topic files or UI improvements.
- **Low friction** — signup to first lesson in under a minute.
- **Inbox-first** — learning happens in email, not in a dashboard the user
  has to remember to open.

---

## 2. Target Users

### Primary persona — "The Self-Taught Developer"
- 1–5 years of programming experience.
- Wants to fill gaps (e.g. a JS dev learning Python, a frontend dev learning
  system design).
- Has good intentions but loses momentum with courses and tutorials.
- Spends 15–30 minutes a day on learning, usually over morning coffee.

### Secondary persona — "The Career Switcher"
- 0–1 years of programming experience.
- Needs structure more than content — struggles to decide *what to learn next*.
- Wants progression from beginner to advanced without choosing a roadmap.

### Tertiary persona — "The Senior Refresher"
- 5+ years of experience.
- Uses it to brush up on a stack before a project or interview.
- Values quality and conciseness over hand-holding.

---

## 3. Core Features (MVP)

| # | Feature | Description |
|---|---|---|
| F1 | User registration & login | Email + password with JWT authentication |
| F2 | Technology selection | User picks one or more technologies from a catalog |
| F3 | Schedule configuration | User sets delivery time(s) and timezone per subscription |
| F4 | Email delivery | One topic per email, HTML formatted, plain-text fallback |
| F5 | Progress tracking | Server tracks which topic index each subscription is on |
| F6 | Pause / resume | User can pause a subscription without losing progress |
| F7 | Unsubscribe | One-click unsubscribe link in every email |

### MVP Non-goals
- No social features (no comments, sharing, leaderboards).
- No quizzes or interactive exercises.
- No mobile app — web + email only.
- No payment system.

---

## 4. Future Features

### V2 — Engagement
- Daily "streak" tracking visible on the dashboard.
- Reply-to-email Q&A (user asks a follow-up, LLM answers from topic context).
- Code playground links (CodeSandbox / StackBlitz embeds).
- Weekly recap email summarizing the week's topics.

### V3 — Personalization & Scale
- Adaptive pacing — skip topics the user already knows via a short quiz.
- Multiple tracks per technology (e.g. "React for backend devs").
- Community-contributed tracks with moderation.
- OAuth login (Google, GitHub).
- Internationalization (topics translated into multiple languages).

---

## 5. Tech Stack Decisions

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **React + Vite + TypeScript** | Industry standard, fast DX, strong typing prevents schedule/timezone bugs |
| Backend | **Node.js + Express** | Shares JS with frontend, simplifies hiring and contributions |
| Database | **MongoDB Atlas** | Flexible schema fits evolving topic/schedule models; free tier fits MVP |
| Email | **Nodemailer + Gmail SMTP** | Zero cost for MVP scale; easy to swap for SES/Postmark later |
| Scheduler | **node-cron** | In-process, no external job queue needed at MVP volume |
| Hosting (client) | **Vercel** | Free tier, Git-based deploys, zero-config for Vite |
| Hosting (server) | **Render** | Free tier for small node services, persistent process for cron |
| Monorepo | **npm workspaces** | Built-in, no extra tooling (no turbo/nx overhead) |
| Topic storage | **JSON files in packages/topics** | Versioned in git, no DB round-trip, easy PRs |

### Explicit non-choices
- **Not** Next.js — backend lives on Render, client on Vercel. A static Vite
  SPA is simpler and faster to deploy.
- **Not** PostgreSQL — subscription and schedule data are document-shaped,
  and topic progression is naturally a counter on a nested document.
- **Not** BullMQ / external queue — node-cron inside the server process is
  sufficient until we outgrow a single node.
- **Not** SendGrid / paid email — Gmail SMTP (500/day) covers MVP.

---

## 6. Success Metrics

### North-star
- **7-day email open rate ≥ 35%** (benchmark: newsletters ~21%, EdTech ~25%).

### Supporting metrics
| Metric | Target (90 days post-launch) |
|---|---|
| Registered users | 1,000 |
| Active subscriptions (not paused, emails sent in last 7 days) | 500 |
| Day-7 retention (% still receiving after 7 days) | 50% |
| Day-30 retention | 25% |
| Median topics completed per active user | 20 |
| Unsubscribe rate per email | < 1% |
| Open-source contributors | 10 |
| New topic files contributed by community | 5 |

### Qualitative goals
- At least one user publicly shares that they completed a full track.
- At least one new language/track added entirely by a community contributor.
