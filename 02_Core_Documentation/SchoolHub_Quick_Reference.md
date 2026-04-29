# SchoolHub Quick Reference

Aligned to **PRD v3.0 (April 2026)**. Scope: Singapore K2 → P6. Launch: June 2026 Beta.

## What is SchoolHub

AI-driven adaptive study scheduling for Singapore parents and students aged 6–12. Parents build curriculum-aligned study plans; students learn through bite-size lessons with personalised pacing, gamification, SEN-aware adaptations, and mental-health guardrails.

Core differentiator: AI-driven adaptive scheduling + SEN behavioural frameworks + mental-health guardrails — answering "are we on track and is my child okay?" in real time.

## Scope Snapshot

| | Scope |
|---|---|
| Market | Singapore |
| Grades | K2 → P6 (ages 6–12) |
| Platform | Web-only responsive PWA |
| Languages | English + Chinese (Simplified) |
| Content format | Text + diagrams (video Phase 2) |

Secondary (Sec 1–4) and Preschool (3–5) are **out of scope** in v3.

## Grade Bands

| Band | Grades | UI | TTS | Tap | Readability |
|------|--------|----|-----|-----|-------------|
| K2 | K2 | Visual-first (readiness tracks) | Auto | 56×56 | FK ≤ 2 |
| Lower Primary | P1–P3 | Guided visual | Auto (P1–P2) | 56×56 | FK ≤ 3 |
| Upper Primary | P4–P6 (PSLE focus at P6) | Transitional | Opt-in | 44×44 | FK ≤ 6 |

## 15 MVP Features (PRD v3 §6)

Critical: Gamification · Chinese · Tiered pricing + free trial · Data input (manual + file upload) · SEN support · Mental-health guardrails.
High: 3-min onboarding · Sibling timeline dashboard · One-tap schedule regeneration · Configurable notifications.
Medium: Shareable progress report · Exam countdown · Weak-topic explanations.
Low: Dark mode · Offline PWA.

## SEN Profiles

| Profile | Framework | Key adaptations |
|---------|-----------|-----------------|
| ADHD | ABA + CBT | 5-min bite cap · focus mode · high-frequency reminders · reduced clutter · leaderboard hidden |
| Autism Spectrum | Structured routines + social story | No surprise changes · 48h advance notice on any change · predictable cadence · motion disabled |
| Other SEN | Vygotsky ZPD | Scaffolded hints · extended response time · parent frustration alert |

SEN profile is optional; flag is per-child; does not change content, only pacing, structure, reward cadence, and notifications. Psychologist review required pre-beta.

## Mental Health Guardrails

Rule-based, not AI-classified. Suggestions only — parent always overrides.

| Signal | Trigger |
|--------|---------|
| Overload risk | Study hours > 2× weekly default |
| Burnout risk | Streak drop 3+ consecutive days |
| Comprehension plateau | Same topic failed 3+ bites |
| Activity imbalance | 7+ consecutive study days, no break logged |
| Exam anxiety | < 14 days to exam + completion rate drop |

Wellbeing dashboard gated to Scholar Pro.

## Tech Stack

```
React 18 + TS + Tailwind + shadcn (PWA, Workbox)
Node.js + Express + TS
Supabase (PostgreSQL + Auth)
Claude Sonnet (claude-sonnet-4-6) — 5 use cases
Telegram Bot API (primary) + Twilio SMS (fallback)
Canvas / Puppeteer (1080×1350 WhatsApp cards)
Vercel · Railway · Supabase · GitHub Actions (curriculum cron)
```

## Claude Sonnet Use Cases

1. Curriculum parsing (MOE P1–P6 PDFs → parsed_topics)
2. Upload parsing (non-iCal PDFs: school calendars, assessment dates)
3. Schedule generation (SEN- and calendar-aware)
4. Bite generation (grade-band + SEN + duration cap)
5. Weak-topic explanation + adaptive feedback tone

All outputs zod-validated before DB write.

## Pricing

| Tier | Price | Children | Key inclusions |
|------|-------|----------|----------------|
| Free (7-day trial) | $0 | 1 | 1 subject, basic schedule. No CC. |
| Scholar | $18 / mo | 2 | All subjects, full gamification, reports, dark mode, SEN (1 child) |
| Scholar Pro | $35 / mo | 4 | All above + offline PWA, priority support, exam packs, SEN (all children), wellbeing dashboard |

Annual plan = 2 months free.

## Performance Targets

| Metric | Target |
|--------|--------|
| Onboarding | < 3 min |
| Grade-band UI switch | < 300 ms |
| XP payout | < 2 s (WebSocket) |
| Curriculum parse | ≥ 90% accuracy |
| ADHD bite cap | ≤ 5 min |
| ASD schedule-change notice | ≥ 48 h |
| Progress card | 1080×1350 px |

## Data Input — File Formats

| Input | Methods |
|-------|---------|
| Spelling list | .csv / .txt / .xlsx / manual |
| Assessment dates | .ics / .pdf / calendar picker (SG presets pre-filled) |
| School calendar | .ics / .pdf / manual |
| MOE syllabus | .pdf / pre-loaded templates (P1–P6 only) |
| K2 readiness | Parent track selection; no upload |

## Exam Countdown

Persistent nav chip. Green > 60 d, Yellow 30–60 d, Red < 30 d. Multi-exam carousel. At K2 renders "P1 in N days". Student can hide; parent cannot.

## Success Metrics (Year 1)

- 500 active users by Month 6
- Trial-to-paid: 8–12%
- Monthly retention: 60%+
- DAU/MAU: 40%+
- Bite completion: 70%+
- SEN parent satisfaction (beta): 80%+ positive
- MRR: SGD $5,000 by Month 12

## Top Risks

| Risk | Level | Mitigation |
|------|-------|-----------|
| Chinese content quality | HIGH | MOE-trained educator review before launch |
| SEN content accuracy | HIGH | Psychologist review; not a clinical tool |
| Mental-health false positives | MED | Suggestions only; parent override |
| PWA iOS Safari | MED | Dedicated iOS test suite; Phase 2 native |
| Low trial-to-paid | MED | 7-day full trial + shareable report card |
| Gamification stress | MED | Per-child opt-out + guardrail auto-flags |

## Reading Order

1. This file (5 min) — orient.
2. `SchoolHub_PRD_v3.md` (45 min) — authoritative.
3. `SchoolHub_API_Reference.md` — endpoints + schema.
4. `03_Skills_Framework/` — pick role-specific skill.
5. `04_Curriculum_Sync/SchoolHub_Curriculum_Sync_Technical_Guide.md` — MOE cron.
6. `05_Features/SchoolHub_Parent_Notifications_Implementation.md` — Telegram + SMS.

## Status

**Approved for MVP Development.** Phase 1 target: 500 users, validate retention + SEN parent satisfaction.
