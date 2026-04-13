# Academic Orbit Live Portal

Academic Orbit is a full redesign of the Stitch references into a production-ready Next.js + MongoDB platform.

The app now includes working authentication, role-protected routes, and live server actions across student, college, and admin workflows.

## What Works Dynamically

- Role login and secure session cookies
- Protected route segments (`student`, `college`, `admin`, `operations`, `campus`)
- Student attendance marking (updates timeline and operation logs)
- Community posting and event registration
- Resource upload and download counter tracking
- Utilities actions (study-buddy request post + lost item reporting)
- College batch upload history updates
- Admin incident logging + incident resolution
- CSV exports for college schedule and admin audit logs

## Module Coverage

- Landing and role-based login
- Student dashboard, attendance, resources, community, utilities
- Smart attendance operations
- Campus navigation and events
- College administration dashboard
- Admin control center

## Tech Stack

- Next.js App Router (TypeScript)
- Tailwind CSS 4
- MongoDB + Mongoose
- Server Actions for write workflows
- Lucide icons

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment variables:

```bash
copy .env.example .env.local
```

3. Update `.env.local`:

- `MONGODB_URI`
- `MONGODB_DB`
- `SESSION_SECRET` (long random string)

4. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Login Accounts

- Student: `student@academicorbit.app` / `Student@123`
- College: `college@academicorbit.app` / `College@123`
- Admin: `admin@academicorbit.app` / `Admin@123`

These accounts are auto-seeded when MongoDB is available.

## Protected API Notes

- `GET /api/auth/me`: current authenticated user
- `POST /api/auth/login`: login
- `POST /api/auth/logout`: logout
- `GET /api/content`: authenticated users only
- `GET/POST /api/seed`: admin only
- `GET /api/exports/college-schedule`: college/admin only
- `GET /api/exports/admin-audit`: admin only

## Notes

- If `MONGODB_URI` is not configured, the app still runs with an in-memory fallback for local development.
- With MongoDB configured, reads and writes persist through the shared content store.
- In production, always set a strong `SESSION_SECRET`.
