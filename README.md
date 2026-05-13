# SchoolHub

AI-powered adaptive study scheduling for Singapore students K2–P6. Parents build MOE-aligned study plans; students learn through bite-size lessons with personalised pacing, SEN-aware adaptations, gamification, and real-time exam-countdown visibility.

**Target launch:** June 2026 (Beta) · Singapore market

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite (PWA) |
| Backend | Node.js + Express + TypeScript |
| Database | Supabase (PostgreSQL + Auth) — Singapore region |
| AI Engine | Claude Sonnet (`claude-sonnet-4-6`) |
| Notifications | Telegram Bot API |
| Hosting | Vercel (frontend) + Railway (backend) |

---

## Monorepo Structure

```
schoolhub/
├── apps/
│   ├── web/          # React 18 PWA — landing page + parent & student dashboards
│   └── api/          # Express API server
├── packages/
│   ├── ai/           # Claude Sonnet wrappers (scheduling, bite generation, parsing)
│   ├── parsers/      # .csv / .xlsx / .ics / .pdf ingestion
│   ├── types/        # Shared TypeScript interfaces
│   └── ui/           # Shared component library (TierCard, SENOverlay, etc.)
├── scripts/
│   ├── curriculum-sync/  # Weekly GitHub Actions cron — MOE syllabus ingestion
│   └── weekly-card/      # Sunday progress card generation (1080×1350px)
└── supabase/
    └── migrations/        # PostgreSQL schema migrations
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- A [Supabase](https://supabase.com) project (Singapore region for PDPA compliance)
- An [Anthropic](https://console.anthropic.com) API key

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in `.env` with your credentials:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Claude AI
CLAUDE_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-6

# Telegram notifications
TELEGRAM_BOT_TOKEN=your-bot-token

# CORS (set to your Vercel URL in production)
ALLOWED_ORIGIN=https://your-app.vercel.app

# Internal cron auth
INTERNAL_API_KEY=generate-a-random-secret
```

### 3. Run the database migration

In your Supabase dashboard → SQL Editor, run:

```
supabase/migrations/0001_initial_schema.sql
```

### 4. Start development servers

```bash
pnpm dev
```

This starts both the web app (Vite, default `http://localhost:5173`) and the API server (default `http://localhost:3001`) in parallel.

---

## Available Scripts

Run from the monorepo root:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in parallel (web + api) |
| `pnpm build` | Build all packages and apps |
| `pnpm typecheck` | TypeScript type-check across the entire monorepo |
| `pnpm lint` | ESLint across all workspaces |
| `pnpm format` | Prettier format all source files |

---

## Deployment

### Frontend → Vercel

The `vercel.json` at the repo root is pre-configured. Connect your GitHub repo in the Vercel dashboard — it will auto-detect the settings.

Required Vercel environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (your Railway API URL)

### Backend → Railway

The `railway.toml` is pre-configured. Connect the repo in Railway and add all server-side environment variables from `.env.example`.

---

## Key Features

- **AI Adaptive Scheduling** — Weekly plans that auto-regenerate based on completion rates and exam proximity
- **MOE Curriculum Aligned** — Singapore P1–P6 syllabi synced weekly via GitHub Actions
- **SEN Support** — ADHD (5-min bite cap, focus mode) and Autism Spectrum (48-hour schedule notice) profiles
- **Gamification** — Streaks, XP, and Bronze/Silver/Gold badges per subject; XP awarded within 2 seconds via WebSocket
- **Wellbeing Guardrails** — Rule-based mental health monitoring (no AI involved); parent always overrides
- **Exam Countdown** — PSLE, SA1, SA2 countdowns on every screen, colour-coded by urgency
- **File Upload** — Drag-and-drop `.ics`, `.pdf`, `.csv`, `.xlsx` parsing for school calendars and spelling lists

## Pricing Tiers

| | Free Trial | Scholar ($18/mo) | Scholar Pro ($35/mo) |
|-|:---------:|:---------------:|:-------------------:|
| Children | 1 | 2 | 4 |
| Subjects | 1 | All | All |
| Gamification | — | ✓ | ✓ |
| SEN profiles | — | 1 child | All children |
| Wellbeing dashboard | — | — | ✓ |
| Offline PWA | — | — | ✓ |

---

## Environment Notes

- Supabase **must** be on the Singapore region (`ap-southeast-1`) for PDPA compliance — no student data outside Supabase
- Claude is used for 5 tasks only: curriculum parsing, file upload parsing, schedule generation, bite generation, and adaptive feedback tone. All Claude outputs are Zod-validated before writing to the database
- Mental health guardrails are **rule-based only** — Claude is not involved in wellbeing classification
