# SchoolHub Skills Framework

Aligned to **PRD v3.0 (April 2026)**. Scope: Singapore K2 → P6. Launch: June 2026 Beta.

## Overview

Three role-specific skill guides sit alongside this file:

| Skill | File | Model |
|-------|------|-------|
| Full-Stack Development | `schoolhub-fullstack-dev-skill.md` | Claude Sonnet |
| Product Design & UX | `schoolhub-product-design-skill.md` | — |
| AI & Curriculum | `schoolhub-ai-curriculum-skill.md` | Claude Sonnet |

Each skill is independent but references `02_Core_Documentation/SchoolHub_PRD_v3.md` as the authoritative product source.

## Skill 1 — Full-Stack Development

Build the complete SchoolHub platform: React 18 PWA, Node + Express API, Supabase, Claude Sonnet, file upload ingestion, Telegram + Twilio notifications, WebSocket real-time XP, Workbox offline, Puppeteer progress cards.

Use for:

- Parent onboarding, sibling timeline dashboard, child profile switcher.
- Student daily goal and bite viewer (grade-band + SEN variants).
- API endpoints for uploads, schedules, SEN profiles, wellbeing, notifications, reports.
- Supabase schema including `children.sen_profile`, `uploads`, `wellbeing_signals`.
- Claude wrappers (5 use cases) with zod schema validation.
- PWA / offline caching (Scholar Pro) with iOS Safari validation.

## Skill 2 — Product Design & UX

Design SchoolHub's UX for Singapore parents and students aged 6–12.

Use for:

- Grade-band variants (K2 / Lower Primary / Upper Primary).
- SEN overlays (ADHD / Autism / Other SEN) composed over the grade-band variant.
- Sibling timeline dashboard and conflict-detection patterns.
- Schedule regen delta preview (immediate vs 48h-delayed for ASD).
- Mental-health wellbeing panel — suggestion-first, non-clinical tone.
- Exam countdown widget (green / yellow / red + K2 readiness variant).
- Shareable progress card (1080×1350 px WhatsApp + PDF).
- Pinyin toggle for P1–P2 Chinese bites.
- WCAG 2.1 AA accessibility; 56×56 px tap targets for K2 / Lower Primary.

## Skill 3 — AI & Curriculum

Five Claude Sonnet use cases with strict schema validation.

Use for:

- Curriculum parsing (MOE P1–P6 syllabus PDFs).
- Upload parsing (non-iCal PDFs: school calendars, assessment date sheets).
- Schedule generation (SEN- and school-calendar-aware, with spaced repetition).
- Bite generation (grade-band + SEN-calibrated, duration-capped).
- Weak-topic explanation (WHY + recommended remedial bite).

The mental-health guardrail engine is **rule-based** — Claude is not used to classify wellbeing. See PRD v3 §7.3 and the AI skill's Mental-Health Signals section.

## Role-Based Learning Paths

### Full-stack developer (~40 h)

1. Foundation (8 h) — read fullstack skill; review PRD v3 §6–§8; set up Supabase, Vercel, Railway, Anthropic key.
2. Schema + auth (6 h) — migrations include `sen_profile`, `uploads`, `wellbeing_signals` from day one.
3. Onboarding + upload pipeline (10 h) — K2 and P1–P6 paths; drag-drop + iCal/CSV/XLSX/PDF parsing.
4. Schedule + regen + delta preview (8 h) — including 48h-delay for ASD profile.
5. Gamification + WS XP payout < 2 s (4 h).
6. SEN profile picker + overlays (4 h).
7. Wellbeing engine cron + parent ack UX (4 h).
8. Sibling timeline + conflict suggestions (4 h).

### Product designer (~25 h)

1. Foundation (4 h) — design skill + PRD v3 §4–§7.
2. Grade-band variants + SEN overlays in Figma (8 h).
3. Onboarding wizard variants (K2 vs P1–P6 + upload step) (4 h).
4. Sibling timeline + conflict + load-balance states (4 h).
5. Wellbeing panel tone review (2 h) — non-clinical, suggestion-first.
6. Progress card template + Chinese pinyin styling (3 h).

### AI / curriculum engineer (~30 h)

1. Foundation (4 h) — AI skill + PRD v3 §7 + curriculum sync guide.
2. Curriculum parsing pipeline + retry + validation (8 h).
3. Upload parsing (PDF/iCal/CSV) (6 h).
4. Schedule generation incl. SEN rules + fallback deterministic scheduler (6 h).
5. Bite generation with tone presets + caching (4 h).
6. Weak-topic explanation + prompt versioning (2 h).

## Cross-Functional Sprints

### Sprint 1 — Onboarding + Data Upload (Week 1)

Designer: wizard variants + drop-zone states (3 h). AI: upload prompt + iCal parser (6 h). Dev: `POST /api/uploads`, polling UX, manual correction form (8 h). Outcome: parent can complete setup in < 3 min, with uploads.

### Sprint 2 — Schedule + SEN (Week 2)

Designer: delta preview + 48h-delay notice (3 h). AI: schedule generation with SEN rules + validator + fallback (10 h). Dev: regen endpoint + confirm flow + history (8 h). Outcome: SEN-aware schedules with parent-visible delta.

### Sprint 3 — Gamification + Wellbeing + Sibling Dashboard (Week 3)

Designer: sibling timeline + wellbeing card (4 h). Dev: streak / XP / badges with WS (6 h), wellbeing signal cron + ack UX (4 h), sibling timeline + conflict detection (6 h). Outcome: daily loop + parent-level wellbeing view.

### Sprint 4 — Notifications + Progress Card + PWA (Week 4)

Dev: Telegram + Twilio (4 h), progress card Puppeteer (4 h), Workbox offline caching (4 h, iOS Safari pass required). Designer: card template + notification copy review (3 h). Outcome: Sunday card + iOS offline ready.

## Environment Setup

```bash
# Required accounts
Vercel · Railway · Supabase · Anthropic · Telegram BotFather · Twilio (Singapore SMS)

# Env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
CLAUDE_API_KEY=
CLAUDE_MODEL=claude-sonnet-4-6
TELEGRAM_BOT_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SUPABASE_SERVICE_ROLE_KEY=       # backend only
```

## Competencies

Full-stack:

- Build React 18 + TS grade-band-aware components.
- Implement Supabase RLS that respects parent-child ownership.
- Wire Claude Sonnet with zod-validated outputs.
- Deliver XP payout within 2 s over WebSockets.
- Ship PWA offline caching that passes iOS Safari testing.

Design:

- Design grade-band variants + SEN overlays in parallel, not as afterthoughts.
- Write wellbeing copy that is supportive, not clinical.
- Produce sibling timeline states (empty, standard, conflict-detected).
- Validate WCAG 2.1 AA at handoff.

AI / Curriculum:

- Reach ≥ 90% MOE syllabus parse accuracy.
- Enforce ADHD ≤ 5 min and ASD 48h-delay in schedule output.
- Build a deterministic fallback scheduler for Claude failures.
- Version every prompt; keep regression fixtures.

## References

- `02_Core_Documentation/SchoolHub_PRD_v3.md` — authoritative
- `02_Core_Documentation/SchoolHub_API_Reference.md`
- `02_Core_Documentation/SchoolHub_Quick_Reference.md`
- `04_Curriculum_Sync/SchoolHub_Curriculum_Sync_Technical_Guide.md`
- `05_Features/SchoolHub_Parent_Notifications_Implementation.md`
