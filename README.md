# EduVoyage

An AI-powered course generator and learning workspace built with Next.js (App Router), Clerk authentication, Drizzle ORM on Neon Postgres, and Google Gemini for content generation. Learners can generate structured courses from a prompt, auto-fetch related YouTube videos, enroll, and track progress.

## Features

- **AI course generation**: Uses Google Gemini to generate course layout (chapters, topics, durations, banner prompt) and rich HTML topic content.
- **Media enrichment**: Fetches related YouTube videos for each chapter via YouTube Data API v3.
- **Authentication**: User auth and route protection via Clerk.
- **Database**: Neon Postgres with Drizzle ORM.
- **Enrollments & progress**: Track enrolled courses and completed chapters.
- **Modern UI**: Next.js App Router, Tailwind CSS v4, Radix UI primitives, Sonner toasts, theme support.

## Tech Stack

- Next.js 15 (App Router)
- React 18
- Clerk (`@clerk/nextjs`) for auth and middleware protection
- Drizzle ORM + Neon (`@neondatabase/serverless`)
- Google Gemini (`@google/genai`) for text generation
- Axios for HTTP
- Tailwind CSS v4 + `tailwind-merge`, Radix UI components, Sonner

## Monorepo/Structure

Key folders:

- `app/` – App Router pages, layouts, API routes
  - `app/api/generate-course-layout/route.jsx` – Gemini layout generation
  - `app/api/generate-course-content/route.jsx` – Per-topic content + YouTube fetch
  - `app/api/courses/route.jsx` – List, get, and user’s courses
  - `app/api/enroll-course/route.jsx` – Enrollments and progress
  - `app/api/user/route.jsx` – Create or fetch user profile
  - `app/layout.js` – Root layout with `ClerkProvider` and global `Toaster`
  - `app/provider.jsx` – App context provider for user detail and selected chapter index
- `config/schema.js` – Drizzle schema for `users`, `courses`, `enrollCourse`
- `config/db.jsx` – Drizzle Neon connection
- `drizzle/` – Migrations and snapshot
- `middleware.ts` – Clerk route protection
- `@/components/ui` – UI primitives

## Database Schema (Drizzle)

Tables (see `config/schema.js`):

- `users`: `id`, `name`, `email (unique)`, `subscriptionId`
- `courses`: `id`, `cid (unique)`, `name`, `description`, `noOfChapters`, `includeVideo`, `level`, `catagory`, `courseJson`, `bannerImageUrl`, `courseContent`, `userEmail → users.email`
- `enrollCourse`: `id`, `cid → courses.cid`, `userEmail → users.email`, `completedChapters`

## Environment Variables

Create a `.env` file in the project root with:

```
# Next.js
NODE_ENV=development

# Database (Neon)
DATABASE_URL=postgres://<user>:<password>@<host>/<db>?sslmode=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Google Gemini
GEMINI_API_KEY=...

# YouTube Data API v3
YOUTUBE_API_KEY=...

# Image generation (AIGuruLab)
AI_GURU_LAB_API_KEY=...
```

Notes:

- Neon Postgres requires SSL; keep `sslmode=require` in `DATABASE_URL`.
- Clerk keys should match your Clerk application; the middleware relies on Clerk for protected routes.

## Getting Started

1. Install dependencies

```
npm install
```

2. Generate/verify database (optional)

- Configure `.env` `DATABASE_URL`
- Explore schema with Drizzle Studio:

```
npx drizzle-kit studio
```

3. Run the dev server

```
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev` – Start Next.js in development
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lint` – Lint
- `npm run studio` – Open Drizzle Studio

## API Overview

All routes are under App Router API (`app/api/*`). Authenticated routes are protected by `middleware.ts` and Clerk.

### POST /api/generate-course-layout

Input (JSON): course settings (e.g., topic, level, includeVideo, noOfChapters, etc.) and `courseId`.

- Calls Gemini with structured prompt to produce a layout JSON including chapters, topics, durations, and a banner image prompt.
- Generates a banner image via AIGuruLab and saves a new `courses` row.
- Response: `{ courseId }`.

Env required: `GEMINI_API_KEY`, `AI_GURU_LAB_API_KEY`.

### POST /api/generate-course-content

Input: `{ courseJson, courseTitle, courseId }`

- For each chapter, calls Gemini to produce topic-level HTML content.
- Queries YouTube API for related videos per chapter.
- Updates `courses.courseContent` with aggregated content.
- Response: `{ courseName, CourseContent }`.

Env required: `GEMINI_API_KEY`, `YOUTUBE_API_KEY`.

### GET /api/courses

- `?courseId=<cid>`: returns a specific course
- `?courseId=0`: returns all courses that have non-empty `courseContent`
- no param: returns current user’s courses (requires auth)

### POST /api/enroll-course

Body: `{ courseId }` – enroll the current user in a course (idempotent).

### GET /api/enroll-course

- Returns enrolled courses for the current user; with `?courseId=<cid>` returns a specific enrollment join view.

### PUT /api/enroll-course

Body: `{ completedChapter, courseId }` – update completed chapters for the current user in that course.

### POST /api/user

Body: `{ name, email }` – creates a user record if not exists; returns user.

## Auth & Route Protection

- `middleware.ts` uses Clerk and allows public access to `/`, `/sign-in`, `/sign-up`, and `/workspace/profile(.*)`.
- Other routes require auth.

## Images

- Remote image domain allowed: `firebasestorage.googleapis.com` (see `next.config.mjs`).

## UI/UX

- Tailwind CSS v4 setup
- Radix primitives: Accordion, Dialog, Progress, Select, Separator, Switch, Tooltip
- `sonner` for toasts
- `next-themes` for theming

## Important Implementation Notes

- `app/layout.js` wraps the app with `ClerkProvider` and a custom provider. Ensure the provider component is used as a React component (capitalized import/export) in the tree.
- The code expects valid API keys; generation routes will fail without them.
- Drizzle schema references emails as foreign keys; ensure Clerk emails exist before inserts.

## Known Issues/Todos

- `app/api/generate-course-layout/route.jsx`: Typo `courssTable` is referenced but not defined; should be `coursesTable` in the pre-limit check.
- `app/layout.js`: `<provider>` is used as a lowercase intrinsic element. It should import and render the exported component from `app/provider.jsx` as `<Provider />` (or rename the component to `Provider`) so React treats it as a component.
- Review error handling and input validation across API routes; add zod or similar for robustness.

## Testing

- Playwright is included in devDependencies; test setup/scripts are not configured in `package.json`. Add tests and scripts as needed.

## License

MIT (update if different).
