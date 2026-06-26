# BoardRoom — Job Board

A full-stack job board where employers post openings and candidates search and apply.
Built with **React (Vite)**, **Supabase** (PostgreSQL + Auth + Storage), and **Tailwind CSS**.

## Features

- **Home page** with search, stats, and featured listings
- **Job listings page** with live search + filters (type, location)
- **Job detail page** with full description and an apply flow (resume upload + cover note)
- **Employer dashboard** — manage listings, view applicant counts, close/reopen/delete jobs
- **Post a job** form
- **Applications view** — employers can review applicants and update status (submitted → reviewed → shortlisted/rejected/hired)
- **Candidate dashboard** — edit profile, upload/replace resume, track all applications and their status
- **Notifications** — auto-generated when a candidate applies (employer notified) and when application status changes (candidate notified), via Postgres triggers
- **Auth** — email/password signup & login, separate employer/candidate roles, row-level security
- **Mobile responsive** throughout

## 1. Set up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account + new project.
2. Once the project is ready, go to **SQL Editor** → New query.
3. Paste the entire contents of `supabase_schema.sql` (in this folder) and click **Run**.
   This creates all tables, row-level security policies, triggers, and the `resumes` storage bucket.
4. Go to **Project Settings → API**. Copy:
   - **Project URL**
   - **anon public** key

## 2. Configure the app

In the project folder:

```bash
cp .env.example .env
```

Open `.env` and paste your values:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

Try it out:
- Sign up as an **Employer** → post a job from the dashboard.
- Sign up (in a different browser/incognito) as a **Job Seeker** → search the board, apply with a resume.
- Switch back to the employer account → see the application, update its status.
- Check the bell icon on each account → notifications fire automatically.

## 4. Build for production

```bash
npm run build
```

This outputs static files to `dist/`.

## 5. Deploy

### Option A — Netlify (recommended, easiest)
1. Push this project to a GitHub repo.
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import an existing project" → connect your repo.
3. Build command: `npm run build`  ·  Publish directory: `dist`
4. Under **Site settings → Environment variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Deploy.

### Option B — GitHub Pages
1. `npm install -D gh-pages`
2. Add to `package.json` scripts: `"deploy": "gh-pages -d dist"`
3. Set `base: '/your-repo-name/'` in `vite.config.js`.
4. `npm run build && npm run deploy`
5. Note: GitHub Pages doesn't support env vars at build time the same way — you'll need to hardcode the Supabase URL/anon key in `src/lib/supabase.js` before building (the anon key is safe to expose publicly; that's what row-level security is for).

### Option C — Vercel
1. Push to GitHub, import the repo at [vercel.com](https://vercel.com).
2. Add the same two environment variables in the Vercel dashboard.
3. Deploy — Vercel auto-detects Vite.

## Project structure

```
src/
  lib/supabase.js          → Supabase client
  contexts/AuthContext.jsx → auth state, signup/login/logout
  components/              → Navbar, JobStubCard, ProtectedRoute
  pages/
    Home.jsx
    JobListings.jsx
    JobDetail.jsx
    Notifications.jsx
    auth/Login.jsx, Signup.jsx
    employer/EmployerDashboard.jsx, PostJob.jsx, ApplicationsView.jsx
    candidate/CandidateDashboard.jsx
supabase_schema.sql         → run once in Supabase SQL editor
```

## Notes for your internship submission

- The database (PostgreSQL via Supabase) satisfies the task's database requirement.
- Authentication, RLS policies, and storage are all real and production-grade, not mocked.
- Email notifications: the current implementation creates **in-app notifications** (visible via the bell icon), driven by database triggers. If your task strictly requires actual **emails**, Supabase supports this via Edge Functions + an email provider (e.g. Resend) — ask if you'd like that added.
