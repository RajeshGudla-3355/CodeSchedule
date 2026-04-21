# CodeSchedule

Learn any technology, one topic at a time — delivered to your inbox on your schedule.

CodeSchedule is a free, open-source developer learning platform that delivers 
bite-sized programming lessons directly to your inbox — on your schedule.

Pick any technology (JavaScript, Python, TypeScript, React, CSS and more), 
choose your preferred delivery times, and receive one focused topic per email 
— from beginner to advanced, in the right order, every day.

No subscriptions. No paywalls. Just consistent, structured learning 
delivered to you automatically.

## Monorepo Structure

This project follows a monorepo architecture — both frontend and backend 
live in a single repository for easier development, shared tooling, 
and streamlined deployments.

codeschedule/
├── apps/
│   ├── client/        ← React + TypeScript frontend (Vite)
│   └── server/        ← Node.js + Express backend
├── packages/
│   └── topics/        ← Shared topic JSON files (JS, Python, React etc.)
├── .github/
│   └── workflows/     ← CI/CD pipelines
├── .env.example
└── README.md

## Tech Stack

Frontend   → React.js, TypeScript, Vite
Backend    → Node.js, Express.js
Database   → MongoDB Atlas
Email      → Nodemailer (Gmail SMTP)
Scheduler  → node-cron
Hosting    → Vercel (frontend) + Render (backend)

## Getting Started

# Clone the repo
git clone https://github.com/yourusername/codeschedule.git
cd codeschedule

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run frontend
cd apps/client && npm run dev

# Run backend
cd apps/server && npm run dev

## Contributing

CodeSchedule is open source and welcomes contributions.
Add a new language topic file, fix a bug, or improve the UI — all PRs welcome!

## License

MIT License — free to use, modify, and distribute.
