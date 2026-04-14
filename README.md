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

### AI pipeline (Whisper + Claude)

- **Transcription**: OpenAI `whisper-1` when `WHISPER_BACKEND=openai` and `OPENAI_API_KEY` is set, or **local** OpenAI Whisper (`pip install openai-whisper`) when `WHISPER_BACKEND=local`. Audio is extracted with **FFmpeg** (`FFMPEG_PATH` on Windows if needed).
- **Bullets + quiz JSON**: **Anthropic Claude** (`ANTHROPIC_API_KEY`, optional `CLAUDE_MODEL`) builds bullet summaries and multiple-choice questions from the transcript.

**Backend `.env`** (see `backend/.env.example`): `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN`, `API_PUBLIC_URL`, `UPLOAD_DIR`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, Whisper/FFmpeg variables as needed.

**Frontend `.env`**: `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:4000`).

**Professor flow**: register/login as professor → dashboard → upload video → **Whisper only** (transcribe) → optional **Bullets only** (needs transcript + Claude) → **Full quiz** (transcribe + Claude + save quiz).

