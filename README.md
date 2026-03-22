# Answer Engine Tracker

MVP app built with Next.js + Prisma + Neon Postgres to compare/store model responses from OpenAI and Gemini.

## 1) Prerequisites

- Node.js 20+
- npm 10+
- A Neon Postgres database URL
- OpenAI and/or Gemini API key

## 2) Setup

```bash
npm install
cp .env.example .env
```

Fill `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require"
OPENAI_API_KEY="..."
OPENAI_MODEL="gpt-4.1-mini"
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-2.0-flash"
```

Initialize Prisma:

```bash
npm run prisma:generate
npm run prisma:push
```

## 3) Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## 4) Deploy (Vercel + Neon)

1. Push this repo to GitHub (already done).
2. In Vercel, import the repository and keep framework as Next.js.
3. In Vercel project settings, add environment variables:
   - `DATABASE_URL`
   - `OPENAI_API_KEY` (optional if using Gemini only)
   - `OPENAI_MODEL` (optional)
   - `GEMINI_API_KEY` (optional if using OpenAI only)
   - `GEMINI_MODEL` (optional)
4. Trigger deploy.

`postinstall` runs `prisma generate` automatically on Vercel.

## Healthcheck

- `GET /api/health`
- Returns app status, DB connectivity, provider key presence, timestamp, and latency.

## API Endpoints

- `POST /api/query` body: `{ prompt, provider?: "openai" | "gemini", model?: string }`
- `GET /api/queries` returns latest 20 query logs
- `GET /api/health` returns deployment/runtime health status

## Project Structure

- `prisma/schema.prisma`: Query log data model
- `src/lib/providers/*`: OpenAI/Gemini adapters
- `src/app/api/query/route.ts`: provider call + persistence
- `src/app/api/health/route.ts`: healthcheck
- `src/app/page.tsx`: MVP dashboard
