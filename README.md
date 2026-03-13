## LectureQuiz AI

LectureQuiz AI is a modern AI-powered educational platform that automatically generates quizzes from lecture videos using Speech-to-Text and NLP.

This repository is structured as a small monorepo with a `frontend` (Next.js 14 App Router) and a `backend` (Node.js, Express, PostgreSQL, Prisma, JWT auth).

### Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui-inspired components, Framer Motion, React Hook Form, Zod
- **Backend**: Node.js, Express, PostgreSQL, Prisma ORM, JWT authentication, bcrypt

### Structure

- `frontend/` – Next.js application (landing page, auth, dashboards, quiz views)
- `backend/` – Express API (auth, lectures, quizzes, quiz results, AI integration hooks)

### Getting Started

1. **Install dependencies**
   - Frontend:
     - `cd frontend`
     - `npm install`
   - Backend:
     - `cd backend`
     - `npm install`

2. **Environment variables**

   Create `.env` files in `frontend` and `backend` (see `env.example` files in each folder once generated) and configure:

   - PostgreSQL connection URL
   - JWT secret
   - Backend API URL (for the frontend)

3. **Database**

   From `backend`:

   - `npx prisma migrate dev`

4. **Run apps**

   - Frontend (in `frontend`): `npm run dev`
   - Backend (in `backend`): `npm run dev`

### AI Quiz Generation

The initial foundation includes clear hooks where you can integrate:

- **Speech-to-Text (Whisper)** to transcribe lecture videos.
- **NLP Question Generation (GPT / T5)** to generate quizzes from transcripts.

These integration points are documented in the backend quiz service layer and can later call your AI providers.

