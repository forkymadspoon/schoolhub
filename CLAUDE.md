# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Authoritative PRD: `02_Core_Documentation/SchoolHub_PRD_v3.md` (v3.0 — SEN & Mental Health Update, April 2026).

## Repository Status

**Documentation-only. No code has been scaffolded yet.** There are no `apps/`, `packages/`, or `supabase/` directories — only planning documents. When starting implementation, create the monorepo from scratch using the layout below.

---

## Product Overview

SchoolHub is an AI-driven adaptive study scheduling platform for Singapore students aged 6–12 (K2 → Primary 6). Parents build curriculum-aligned study plans; students learn through bite-size lessons with personalised pacing, gamification, SEN-aware adaptations, mental-health guardrails, and real-time exam-countdown visibility.

**Core differentiator**: AI-driven adaptive scheduling + SEN behavioural frameworks + mental health guardrails — turning a parent's biggest anxiety ("are we on track and is my child okay?") into a real-time answer.

**Target launch**: June 2026 (Beta) · Singapore market · Web-only responsive PWA; mobile native in Phase 2.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS + shadcn/ui (PWA) |
| Backend | Node.js + Express + TypeScript |
| Database | Supabase (PostgreSQL + Auth) — **Singapore region** (PDPA requirement) |
| AI Engine | `claude-sonnet-4-6` — 5 use cases; all outputs Zod-validated before DB write |
| Notifications | Telegram Bot API (primary) + Twilio SMS (fallback) |
| Offline / PWA | Service Worker + Workbox (cache-first for assigned bites) + PWA manifest |
| File Ingestion | .csv, .txt, .xlsx, .ics, .pdf parsers (spelling lists, school calendars, assessment dates) |
| TTS | Web Speech API — K2 and Lower Primary only |
| Image Generation | canvas / Puppeteer (shareable progress cards — 1080×1350px) |
| Hosting | Vercel (frontend) + Railway (backend) + Supabase (database) |
| Curriculum Sync | GitHub Actions (weekly cron) |

---

## Monorepo Layout

```
schoolhub/
├── apps/
│   ├── web/               # React 18 + TypeScript PWA
│   └── api/               # Node.js + Express
├── packages/
│   ├── ui/                # shadcn/ui base + TierCard, TierFeedback, TierProgress + SENOverlay
│   ├── types/             # Shared TypeScript interfaces
│   ├── ai/                # claude-sonnet-4-6 wrappers (5 use cases)
│   └── parsers/           # .csv / .txt / .xlsx / .ics / .pdf ingestion
├── scripts/
│   └── curriculum-sync/   # GitHub Actions cron job
└── supabase/
    └── migrations/
```

---

## Component Hierarchy

```
apps/web/src/
├── components/
│   ├── parent/
│   │   ├── Dashboard.tsx                 # Sibling timeline entry point
│   │   ├── SiblingTimeline.tsx           # Weekly lanes + conflict flags
│   │   ├── ChildProfileSwitcher.tsx      # Always visible in top nav
│   │   ├── OnboardingWizard.tsx          # < 3 min; K2 and P1–P6 variants
│   │   ├── DataUpload.tsx                # Drag-drop: spelling/calendar/dates/syllabus
│   │   ├── ScheduleRegenModal.tsx        # Delta preview → confirm (48h delay for ASD)
│   │   ├── WellbeingPanel.tsx            # Mental-health signals (Scholar Pro only)
│   │   ├── NotificationSettings.tsx      # Telegram/SMS mode picker
│   │   └── SENProfilePicker.tsx          # Optional ADHD/Autism/Other setup
│   ├── student/
│   │   ├── DailyGoal.tsx
│   │   ├── BiteViewer.tsx                # SEN-aware; ADHD hard-cap 5 min
│   │   ├── BiteQuiz.tsx
│   │   ├── StreakBanner.tsx
│   │   └── FocusMode.tsx                 # Single-task view (ADHD)
│   ├── shared/
│   │   ├── ExamCountdownWidget.tsx       # Persistent every screen; green/yellow/red
│   │   ├── TierCard.tsx
│   │   ├── TierFeedback.tsx
│   │   ├── TierProgress.tsx
│   │   └── SENOverlay.tsx                # Wraps children with sen_profile
│   └── admin/
│       ├── CurriculumManager.tsx
│       └── WellbeingRuleEditor.tsx
├── pages/
│   ├── Onboarding.tsx
│   ├── ParentDashboard.tsx
│   ├── StudentHome.tsx
│   ├── Upgrade.tsx
│   └── Reports.tsx
├── services/
│   ├── api.ts
│   ├── supabase.ts
│   ├── realtime.ts        # WebSocket events: xp.awarded · badge.unlocked · wellbeing.signal
│   ├── telegram.ts
│   └── uploads.ts         # multipart upload + polling
└── hooks/
    ├── useGradeBand.ts
    ├── useSENProfile.ts
    ├── useSchedule.ts
    ├── useWellbeing.ts
    └── useSiblingTimeline.ts
```

---

## Core Architecture

### 1. Automated Curriculum Sync Pipeline

```
GitHub Actions (weekly cron)
  → Fetch MOE Singapore PDF syllabi
  → SHA-256 hash per PDF for change detection
  → Changed PDFs → claude-sonnet-4-6 vision API → structured JSON (parsed_topics: JSONB)
  → Upsert into curriculum_versions table
  → Notify parents when child's subject syllabus changes
```

Key tables: `curriculum_versions` (`parsed_topics: JSONB`, `source_hash`, `subject`, `level`), `parse_queue` (tracks in-progress jobs, retries).

### 2. Adaptive UI/UX Engine (CRITICAL)

UI reconfigures by grade band. Grade is assigned at profile creation and auto-promotes on the January academic-year rollover. Parent can override manually. SEN profile (optional) overlays further adaptations on top of the grade band.

| Grade Band | Age | Grade | UI Mode |
|------------|-----|-------|---------|
| K2 Readiness | 6 | K2 | Visual-First (pre-built P1 readiness) |
| Lower Primary | 7–9 | P1–P3 | Guided Visual |
| Upper Primary | 10–12 | P4–P6 | Transitional (PSLE focus at P6) |

**Implementation rules:**
- Grade band + SEN flag injected into every screen render via user profile state.
- Component library ships grade-band variants: `TierCard`, `TierFeedback`, `TierProgress`.
- TTS auto-plays only for K2 and Lower Primary; disabled by default at Upper Primary.
- K2 / Lower Primary: minimum 56×56px tap targets; image-first questions (no keyboard input required at K2).
- Profile switch must re-render full UI to correct grade band within **300ms**.
- Claude prompt layer receives `grade_band` + `sen_profile` as system context for tone/vocabulary calibration.
- Readability target: Flesch-Kincaid Grade ≤ 3 for Lower Primary bites; ≤ 6 for Upper Primary.
- Weak topic flags surface to parent for K2/Lower Primary; to student (simplified) + parent for Upper Primary.

### 3. SEN Support Framework (CRITICAL)

Optional per-child profile: **ADHD**, **Autism Spectrum**, or **Other SEN**. Does not alter content — alters pacing, structure, reward cadence, and notifications.

- ADHD: bite length hard-capped at 5 min regardless of grade; frequent micro-breaks; positive reinforcement every bite; focus mode (single task visible); reduced visual clutter.
- Autism Spectrum: no surprise schedule changes; 48-hour advance-notice alert on any schedule change; predictable reward cadence; reduced animated distractions.
- General SEN: adaptive difficulty calibrated to Vygotsky Zone of Proximal Development; scaffolded hints before answers; extended response time; leaderboard hidden by default.
- Frameworks informing the build: ABA, CBT, Vygotsky ZPD. **Not a clinical tool** — psychologist review required before beta launch.

### 4. Mental Health Guardrails (CRITICAL)

**Rule-based engine only — Claude is NOT used to classify wellbeing signals.** Surfaces suggestions only; parent always overrides.

| Signal | Trigger | Recommended Action |
|--------|---------|--------------------|
| Overload risk | Study hours > 2× weekly default | Suggest 20% bite reduction + 1 rest day |
| Burnout risk | Streak drop 3+ consecutive days | Pause gamification pressure; suggest 2-day break |
| Comprehension plateau | Same topic failed 3+ bites | Flag weak topic; recommend prerequisite bite |
| Activity imbalance | 7+ consecutive study days, no break logged | Prompt holistic activity (outdoor/family/creative) |
| Exam anxiety signal | Countdown < 14 days + completion rate drops | Reduce new topics; focus revision; suggest breathing exercise resource |

SEN children use adjusted thresholds. All recommendations framed as suggestions — never directives, never clinical claims.

### 5. Gamification System

- **Streak**: daily counter visible on home screen; 3-day grace restore.
- **XP**: per bite completed, per correct comprehension check, per streak milestone; bonus for ahead-of-schedule completion.
- **Badges**: Bronze (10 bites) / Silver (30 bites) / Gold (100 bites) per subject. K2 gets streaks + completion badges only.
- **Leaderboard**: opt-in, anonymous, internal only. Disabled by default for SEN profiles.
- XP awarded within **2 seconds** of bite completion via WebSocket (`xp.awarded` event).
- Parents can disable gamification entirely per child; auto-paused on burnout signal.

### 6. Data Input — Manual & File Upload (CRITICAL)

Parents input school-specific data via manual entry or file upload. Never force re-keying data that exists as a file.

| Input | Methods | Parsed By |
|-------|---------|-----------|
| Spelling lists | .csv / .txt / .xlsx / manual | Native parser → weekly spelling bites |
| Assessment dates | .ics / .pdf / calendar picker | Claude Sonnet (PDF) / ical parser |
| School calendars | .ics / .pdf / manual | Auto-insert holidays as study-free days |
| MOE syllabus (P1–P6) | .pdf / pre-loaded templates | Claude Sonnet vision (90%+ accuracy) |
| K2 readiness tracks | Parent selection | Pre-built static content |

All imports editable after ingest. Parsing errors shown inline with manual correction.

### 7. Shareable Progress Card Pipeline

- Generated Sunday night; available Monday morning.
- canvas / Puppeteer → 1080×1350px WhatsApp-native image + PDF version.
- Contents: subjects studied, bites completed, streak, badges, exam countdown, wellbeing status (green/amber/red).
- SchoolHub watermark + app link (organic growth mechanic).

### 8. Schedule Generation & Regeneration

- Inputs: exam dates + school calendar + weekly study hours + parsed curriculum topics + SEN profile.
- Output: week-by-week plan with spaced repetition and buffer weeks before exams.
- Auto-regeneration triggers: < 60% weekly bite completion, exam date change, school calendar change, manual tap.
- Regeneration UX: banner → [Regenerate] → modal with plain-language reason sentence + delta-highlighted preview → [Confirm]. Autism Spectrum profile forces 48-hour advance-notice alert before new schedule activates.
- Reason text surfaces above the delta in the modal: one sentence explaining *why* the schedule changed (e.g. "Aiden completed 45% of bites this week, so we've lightened next week's load"). Derived from trigger type + metric — not Claude-generated.
- All regenerations logged in dashboard history with reason text preserved.

### 9. Sibling Timeline Dashboard

- Weekly calendar view with colour-coded lanes per child.
- Conflict detection: flags overlapping high-intensity study or multiple assessments across siblings.
- Load-balancing suggestions when one child is overloaded relative to siblings.
- Profile switcher always visible in top nav. Scholar: 2 children. Scholar Pro: 4 children.
- One consolidated parent notification covers all children.

---

## Data Model (Key Tables)

Core entities (schema includes additional operational tables):

| Table | Key Columns |
|-------|-------------|
| `users` | id, email, role (parent/student) |
| `children` | id, parent_id, name, grade_level, grade_band (enum), sen_profile (enum nullable), gamification_enabled |
| `curriculum_versions` | id, subject, level, source_hash, parsed_topics (JSONB) |
| `study_schedules` | id, child_id, schedule_json (JSONB), generated_at, trigger_reason, activates_at, confirmed_by_parent |
| `bites` | id, topic_id, content_json (JSONB), duration_min, grade_band |
| `xp_events` | id, child_id, event_type, xp_delta, created_at |
| `badges` | id, child_id, subject, tier (bronze/silver/gold), unlocked_at |
| `parse_queue` | id, source_type, status, retries |
| `uploads` | id, parent_id, child_id, file_type, status, parsed_payload (JSONB) |
| `wellbeing_signals` | id, child_id, signal_type, triggered_at, resolved_at, recommended_action |

`schedule_json`, `content_json`, `parsed_payload` are JSONB — schemas defined by Claude / parser output contracts and Zod-validated before writing to DB.

Key TypeScript types:
```typescript
export type GradeLevel = 'K2' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
export type GradeBand = 'K2' | 'Lower_Primary' | 'Upper_Primary';
export type SENProfile = 'ADHD' | 'Autism_Spectrum' | 'Other_SEN' | null;
```

`children.sen_profile`, `uploads`, and `wellbeing_signals` must be in the initial migration — not added later.

---

## Documentation Map

| File | Purpose |
|------|---------|
| `01_Start_Here/START_HERE.md` | Role-based onboarding guide (read first) |
| `02_Core_Documentation/SchoolHub_PRD_v3.md` | **Authoritative** product requirements v3.0 |
| `02_Core_Documentation/SchoolHub_API_Reference.md` | API endpoints, DB query patterns, rate limits |
| `02_Core_Documentation/SchoolHub_Quick_Reference.md` | One-page dev/design cheat sheet |
| `03_Skills_Framework/schoolhub-fullstack-dev-skill.md` | TypeScript interfaces, component hierarchy, Claude integration examples, implementation plan |
| `03_Skills_Framework/schoolhub-ai-curriculum-skill.md` | Claude Sonnet prompts, parse pipeline, schema contracts |
| `03_Skills_Framework/schoolhub-product-design-skill.md` | Design tokens, grade-band variants, SEN overlay rules |
| `04_Curriculum_Sync/` | MOE curriculum ingestion pipeline |
| `05_Features/` | Per-feature implementation specs |
| `02_Core_Documentation/archive/` | Superseded PRDs (v1, v2) — historical reference only |

---

## Claude API Patterns

Five distinct use cases — all use `claude-sonnet-4-6`. All outputs must be Zod-validated before writing to DB; never expose raw Claude output to the client.

1. **Curriculum parsing** — vision API; PDF → `parsed_topics: JSONB`. Runs via `parse_queue` worker. Batch; not user-facing latency.
2. **File upload parsing** — structured output; non-iCal, non-spreadsheet uploads (e.g. school calendar PDFs) → normalised payload.
3. **Schedule generation** — structured output; inputs: exam dates + school calendar + available hours + parsed topics + SEN profile → `schedule_json: JSONB`. Runs at onboarding and on every regeneration.
4. **Bite / micro-lesson generation** — structured output; inputs: topic + grade band + SEN profile + duration constraint → `content_json: JSONB`. Duration: 5 min max (K2), 5–10 min (P1–P6), ≤ 5 min hard cap when SEN profile = ADHD.
5. **Adaptive feedback tone & weak-topic explanation** — grade band + SEN profile passed as system context; Claude calibrates vocabulary, sentence complexity, emoji usage, and diagnostic depth. Powers weak-topic WHY text and session summaries.

---

## Monetisation / Feature Gates

| Feature | Free (7-day trial) | Scholar ($18/mo) | Scholar Pro ($35/mo) |
|---------|:-----------------:|:---------------:|:-------------------:|
| Subjects | 1 | All | All |
| Children | 1 | 2 | 4 |
| Gamification rewards | — | ✓ | ✓ |
| Shareable reports | — | ✓ | ✓ |
| Dark mode | — | ✓ | ✓ |
| SEN profile | — | 1 child | All children |
| Mental health dashboard | — | — | ✓ |
| Offline PWA | — | — | ✓ |
| Priority support | — | — | ✓ |

No credit card required for 7-day trial. Annual plan = 2 months free.

---

## Key Constraints & Performance Targets

| Constraint | Target |
|-----------|--------|
| Onboarding completion time | < 3 minutes |
| Grade-band UI switch (child profile change) | < 300ms |
| XP award after bite completion | < 2 seconds (WebSocket) |
| Curriculum parse accuracy | ≥ 90% |
| K2 / Lower Primary tap target minimum | 56×56px |
| ADHD-profile bite length | ≤ 5 minutes (hard cap) |
| Autism-profile schedule-change notice | ≥ 48 hours |
| Progress card image dimensions | 1080×1350px |
| Data residency | Supabase Singapore region — PDPA; no sensitive student data outside Supabase |

**Exam countdown widget**: persistent on every screen; colour-coded green (> 60 days) → yellow (30–60 days) → red (< 30 days). Multiple exams shown in carousel. At K2 shows "P1 in X days" readiness countdown. Student (not parent) can hide it.

---

## Notable Feature Behaviours

- **Chinese Language Support**: K2 character recognition + pinyin intro + oral readiness; P1–P6 full MOE scope. Pinyin toggle for P1–P2. Vocabulary bite format: character → pinyin → meaning → example sentence. HCL (Higher Chinese) deferred to Phase 2. All content reviewed by MOE-trained Chinese educators before launch.
- **K2 Readiness Mode**: pre-built English / Math / Chinese foundations tracks; no syllabus PDF upload required; parent completes setup; countdown shows days to P1 intake.
- **Age-adaptive bite lengths**: K2 ≤ 5 min / P1–P6 5–10 min. ADHD profile overrides to ≤ 5 min across all grades — enforced by bite generation prompt, not just content.
- **One-tap schedule regeneration**: confirmation modal shows delta (new vs old schedule) before commit; no re-setup required. Autism profile triggers 48-hour delayed activation (`activates_at` set 48h ahead; `confirmed_by_parent` still required).
- **Weak topic explanations**: surface WHY topic is weak + one-tap remedy action (not just a label).
- **Multi-child profile switcher**: always visible in top nav; independent schedule, progress, gamification, and SEN profile per child; parent receives one consolidated notification covering all children.
- **Mental health guardrails**: rule-based only; Claude not involved; never a diagnostic tool; suggestions always overridable by parent.
