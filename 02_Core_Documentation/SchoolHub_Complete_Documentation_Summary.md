# SchoolHub — Complete Documentation Summary

Aligned to **PRD v3.0 (April 2026)**. Scope: Singapore K2 → P6. Launch: June 2026 Beta.

## Package Status

**Approved for MVP Development.** Authoritative spec: `SchoolHub_PRD_v3.md`. PRDs v1.0 and v2.0 moved to `archive/` and should be treated as historical only.

## What's New in v3.0 (2026-04-24)

- **Scope narrowed to K2 → P6.** Preschool (3–5) and Secondary (Sec 1–4) removed.
- **K2 readiness mode** replaces MOE syllabus at that age. Three pre-built tracks (English, Math, Chinese Foundations). Countdown becomes "P1 in N days".
- **SEN Support Framework** — ADHD, Autism Spectrum, Other SEN. Overlay on the grade-band variant. Psychologist review required pre-beta.
- **Mental-Health Guardrails** — rule-based, not AI-classified. Suggestions only; parent always overrides; no clinical claims. Wellbeing dashboard gated to Scholar Pro.
- **Data Input feature** — parents upload spelling lists, school calendars, assessment dates (.csv / .xlsx / .txt / .ics / .pdf). Manual entry everywhere.
- **Sibling Timeline Dashboard** — home screen for multi-child accounts.
- **Gamification per-child opt-out + guardrail auto-pause** — prevents pressure on overloaded students.
- **Claude Sonnet** (`claude-sonnet-4-6`) — five use cases. All outputs zod-validated before DB write.

## File Inventory

### 01_Start_Here/

| File | Purpose |
|---|---|
| `START_HERE.md` | Role-based onboarding entry point |
| `DELIVERY_SUMMARY.txt` | High-level package summary |

### 02_Core_Documentation/

| File | Purpose | Audience |
|---|---|---|
| `SchoolHub_PRD_v3.md` | Authoritative PRD | Everyone |
| `SchoolHub_API_Reference.md` | API endpoints + DB schema + rate limits | Engineering |
| `SchoolHub_Quick_Reference.md` | One-page cheat sheet | Everyone |
| `SchoolHub_Documentation_Index.md` | Navigation hub | Everyone |
| `SchoolHub_Complete_Documentation_Summary.md` | This file | PM / exec |
| `archive/` | Superseded PRDs (v1, v2) | — |

### 03_Skills_Framework/

| File | Purpose |
|---|---|
| `SchoolHub_Skills_Framework.md` | Role learning paths + cross-functional sprints |
| `schoolhub-fullstack-dev-skill.md` | Full-stack engineering skill |
| `schoolhub-product-design-skill.md` | Product design / UX skill |
| `schoolhub-ai-curriculum-skill.md` | AI / curriculum skill |

### 04_Curriculum_Sync/

| File | Purpose |
|---|---|
| `SchoolHub_Curriculum_Sync_Summary.md` | MOE sync overview |
| `SchoolHub_Curriculum_Sync_Technical_Guide.md` | MOE sync implementation |

### 05_Features/

| File | Purpose |
|---|---|
| `SchoolHub_Parent_Notifications_Implementation.md` | Telegram + Twilio notification spec |

## Scope Snapshot

| | |
|---|---|
| Market | Singapore |
| Grades | K2 → P6 (ages 6–12) |
| Platform | Web-only responsive PWA |
| Languages | English + Chinese (Simplified) |
| Content format | Text + diagrams (video in Phase 2) |
| Launch | June 2026 Beta |

## Grade Bands

| Band | Grades | UI | TTS | Tap target | Readability |
|------|--------|----|-----|------------|-------------|
| K2 | K2 | Visual-first (readiness tracks) | Auto | 56×56 px | FK ≤ 2 |
| Lower Primary | P1–P3 | Guided visual | Auto (P1–P2) | 56×56 px | FK ≤ 3 |
| Upper Primary | P4–P6 (PSLE focus at P6) | Transitional | Opt-in | 44×44 px | FK ≤ 6 |

## SEN Profiles

| Profile | Framework | Key adaptations |
|---------|-----------|-----------------|
| ADHD | ABA + CBT | 5-min bite cap · focus mode · high-frequency reminders · reduced clutter · leaderboard hidden |
| Autism Spectrum | Structured routines + social story | No surprise changes · 48 h advance notice · predictable cadence · motion disabled |
| Other SEN | Vygotsky ZPD | Scaffolded hints · extended response time · parent frustration alert |

SEN profile is optional, per-child, and overlays on the grade-band variant. Does not change content — only pacing, structure, reward cadence, and notifications.

## Mental-Health Guardrails

| Signal | Trigger |
|--------|---------|
| Overload risk | Study hours > 2× weekly default |
| Burnout risk | Streak drop 3+ consecutive days |
| Comprehension plateau | Same topic failed 3+ bites |
| Activity imbalance | 7+ consecutive study days, no break logged |
| Exam anxiety | < 14 days to exam + completion rate drop |

Rule-based (not AI-classified). Suggestions only — parent overrides. Wellbeing dashboard gated to Scholar Pro.

## 15 MVP Features (PRD v3 §6)

**Critical:** Gamification · Chinese · Tiered pricing + free trial · Data input · SEN support · Mental-health guardrails.

**High:** 3-min onboarding · Sibling timeline dashboard · One-tap schedule regeneration · Configurable notifications.

**Medium:** Shareable progress report · Exam countdown · Weak-topic explanations.

**Low:** Dark mode · Offline PWA.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind + shadcn/ui (PWA, Workbox) |
| Backend | Node.js + Express + TypeScript |
| Database | Supabase (PostgreSQL + Auth) — Singapore region |
| AI | Claude Sonnet (`claude-sonnet-4-6`) — 5 use cases |
| Notifications | Telegram Bot API (primary) + Twilio SMS (fallback) |
| Offline | Service Worker + Workbox |
| Images | Canvas / Puppeteer (1080×1350 WhatsApp cards) |
| Hosting | Vercel · Railway · Supabase |
| Cron | GitHub Actions (weekly MOE sync) |

## Claude Sonnet — Five Use Cases

1. Curriculum parsing (MOE P1–P6 PDFs → `parsed_topics`)
2. Upload parsing (non-iCal PDFs: school calendars, assessment dates)
3. Schedule generation (SEN- and calendar-aware)
4. Bite generation (grade-band + SEN + duration cap)
5. Weak-topic explanation + adaptive feedback tone

All outputs zod-validated before DB write. Deterministic fallback scheduler available for Claude failures.

## Pricing

| Tier | Price | Children | Key inclusions |
|------|-------|----------|----------------|
| Free (7-day trial) | $0 | 1 | 1 subject, basic schedule. No CC. |
| Scholar | $18 / mo | 2 | All subjects, full gamification, reports, dark mode, SEN (1 child) |
| Scholar Pro | $35 / mo | 4 | All above + offline PWA, priority support, exam packs, SEN (all children), wellbeing dashboard |

Annual = 2 months free.

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
| Data residency | Supabase Singapore — PDPA |

## Data Input Formats

| Input | Methods |
|-------|---------|
| Spelling list | .csv / .txt / .xlsx / manual |
| Assessment dates | .ics / .pdf / calendar picker (SG presets pre-filled) |
| School calendar | .ics / .pdf / manual |
| MOE syllabus | .pdf / pre-loaded templates (P1–P6 only) |
| K2 readiness | Parent track selection; no upload |

## Role-Based Reading Paths

**Product manager (~1 h):** Quick Reference → PRD v3 → Complete Documentation Summary.

**Full-stack engineer (~90 min):** Quick Reference → PRD v3 → API Reference → fullstack skill → curriculum sync guide.

**Product designer (~2 h):** Quick Reference → PRD v3 (§4, §6, §7) → design skill → Figma variants.

**AI / curriculum engineer (~2 h):** Quick Reference → PRD v3 §7–§8 → AI skill → curriculum sync guide.

## Cross-Functional Sprint Plan

| Week | Theme | Outcome |
|------|-------|---------|
| 1 | Onboarding + Data Upload | Parent setup in < 3 min, file uploads working |
| 2 | Schedule + SEN | SEN-aware schedule generation, delta preview |
| 3 | Gamification + Wellbeing + Sibling Dashboard | Daily loop, wellbeing signals, sibling view |
| 4 | Notifications + Progress Card + PWA | Telegram + Twilio, Sunday card, iOS offline |

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
| Gamification stress | MED | Per-child opt-out + guardrail auto-pause |

## Launch Readiness Checklist (pre-beta)

- [ ] All 15 features from PRD v3 §6 shipped.
- [ ] Psychologist review of SEN framework complete.
- [ ] MOE-trained Chinese educator review of Chinese content complete.
- [ ] Curriculum parse accuracy sampled ≥ 5% and measured ≥ 90%.
- [ ] Performance targets met (onboarding < 3 min, XP < 2 s, UI switch < 300 ms).
- [ ] PWA iOS Safari test suite passing.
- [ ] Beta cohort of 20 families onboarded.
- [ ] Privacy: PDPA review complete; no sensitive student data outside Supabase.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-22 | Initial release (automated MOE curriculum sync) |
| 2.0 | 2026-04-23 | MVP Improvements Update |
| **3.0** | **2026-04-24** | SEN & Mental Health Update. Scope narrowed to K2–P6. 4 new features (Data Input, SEN Support, Mental-Health Guardrails, Sibling Dashboard). Preschool + Secondary removed. |

## Next Steps

1. Read `SchoolHub_PRD_v3.md` end to end.
2. Pick a role-specific skill in `03_Skills_Framework/`.
3. Begin Sprint 1 (Onboarding + Data Upload) per `SchoolHub_Skills_Framework.md`.
4. Schedule psychologist review + MOE-trained Chinese educator review for the SEN and Chinese content streams.
