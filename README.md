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

## API Endpoints

- `POST /api/query` body: `{ prompt, provider?: "openai" | "gemini", model?: string }`
- `GET /api/queries` returns latest 20 query logs

## Project Structure

- `prisma/schema.prisma`: Query log data model
- `src/lib/providers/*`: OpenAI/Gemini adapters
- `src/app/api/query/route.ts`: provider call + persistence
- `src/app/page.tsx`: MVP dashboard
