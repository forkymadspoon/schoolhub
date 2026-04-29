# SCHOOLHUB

**Product Requirements Document**

*Adaptive Learning & Study Scheduling Platform · Singapore*

| **Version** | **2.0 — MVP Improvements Update** |
| --- | --- |
| Updated | April 2026 |
| Market | Singapore (Preschool → Secondary) |
| Status | Approved for MVP Development |

# 1. Vision **&**** Mission**

## Vision

Every student in Singapore has access to personalised, structured study support that eliminates academic stress, prevents burnout, and enables consistent, sustainable learning.

## Mission

Build an intelligent study companion that helps busy parents create adaptive, curriculum-aligned study schedules, and helps students learn through bite-size, engaging lessons — transforming exam preparation from chaotic cramming into organised, confident success.

## Core Differentiator

*SchoolHub is the only Singapore EdTech platform combining AI-driven adaptive study scheduling with exam-date countdown visibility — turning a parent's biggest anxiety ("**are we on track?**") into a real-time answer.*

# 2. Problem Statement

Parents struggle to translate MOE syllabi into actionable, exam-ready study plans. Students face disorganised revision, last-minute cramming, and burnout. Current solutions (Excel, generic apps, physical tuition) are either not curriculum-aware, not adaptive, or prohibitively expensive.

## Pain Points by Persona

| **Persona** | **Primary Pain** |
| --- | --- |
| Parent | No time to research syllabus, manually track topics, or enforce consistent study habits across multiple children |
| Student | Overwhelmed by exam scope, unsure what to study next, no feedback loop on weak topics |
| School / MOE | Provide syllabi but lack tools to help individual students manage personal study timelines |

# 3. Product Scope — MVP

Platform type: Web-only (responsive, desktop + mobile browser). Content format: Text + diagrams (video in Phase 2). Curriculum: Standalone MOE-aligned (Google Classroom integration post-MVP). Subjects: All MOE subjects (broad appeal). Target launch: June 2026 (Beta).

# 4. User Personas

## Parent — Priya, 38

- Working professional, 2 school-age children (P3, Sec 1)

- Spends $800/month on tuition; wants better ROI

- Primary decision-maker and payment owner

- WhatsApp-native; checks phone 40+ times/day

## Student — Aiden, 12 (Primary 6)

- PSLE candidate; motivated but easily distracted

- Responds to rewards and visible progress

- Uses iPad for school; night owl study habits

- Embarrassed when behind peers; thrives on streaks

## Teacher / School (Phase 2 target)

- MOE educator looking to supplement classroom teaching

- Needs dashboards for class-level progress, not individual nagging

# 5. Core Feature Set (Original MVP)

## 5.1 Curriculum Upload **&**** Parsing**

- Parent uploads school syllabus PDF or selects from MOE-standard templates

- Claude AI parses topics, prerequisites, chapter dependencies

- 90%+ accuracy target for curriculum extraction

## 5.2 Adaptive Schedule Generation

- Input: exam dates, available study hours/week, subject list

- Output: week-by-week study plan with spaced repetition built in

- Buffer weeks auto-inserted before exam dates

- Schedule regenerates when student falls behind

## 5.3 Bite-Size Learning Modules

- 5–15 minute lessons per topic (text + diagrams)

- MOE-syllabus-aligned content

- Student self-reports comprehension after each bite

## 5.4 Parent Dashboard

- Real-time view of child's study progress

- Weekly summaries, struggle alerts, exam countdown

- Multi-child profile switcher

## 5.5 Notifications

- Configurable: weekly digest / daily progress / real-time alerts

- Telegram bot (free) + SMS fallback

- Three alert modes selectable during onboarding

# 6. MVP Improvements — Version 2.0

Based on competitive analysis against Geniebook, KooBits, Superstar Teacher, LingoAce, and 88tuition, the following 15 improvements are incorporated into the MVP to close critical experience gaps and strengthen retention.

| **#** | **Feature** | **Priority** | **Status** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | Gamification Layer | CRITICAL | NEW | Streak counter, daily XP, subject-specific badges. Activates daily habit loop for ages 6–12 — absent from all competitors except KooBits. |
| 2 | Chinese Language Support | CRITICAL | NEW | Mandarin content for Primary (P1–P6) and Secondary. MOE-mandated subject. |
| 3 | Preschool UX Mode | CRITICAL | ENHANCED | Ages 3–6 interface: larger tap targets, visual-first navigation, read-aloud for non-readers. |
| 4 | Tiered Pricing + Free Trial | CRITICAL | NEW | 3 tiers: Free (7-day trial), Scholar ($18/mo), Scholar Pro ($35/mo). |
| 5 | 3-Minute Onboarding | HIGH | ENHANCED | Cut onboarding from 5 to under 3 minutes. Pre-fill from MOE syllabus templates. |
| 6 | Configurable Notifications | HIGH | ENHANCED | Parent chooses mode at setup: Weekly Digest, Daily Progress, or Real-Time Alerts. |
| 7 | Age-Adaptive Bite Length | HIGH | ENHANCED | Preschool: 3–5 min. Primary: 5–10 min. Secondary: 10–20 min. |
| 8 | One-Tap Schedule Regeneration | HIGH | ENHANCED | Single-tap rescheduling with confirmation modal + instant preview. |
| 9 | Shareable Progress Report | MEDIUM | NEW | Weekly PDF/image summary parents can forward via WhatsApp. |
| 10 | Weak Topic Explanations | MEDIUM | ENHANCED | Shows WHY topic is weak and recommends a remedy action. |
| 11 | Exam Countdown Widget | MEDIUM | NEW | Persistent countdown on every screen: "PSLE in 47 days." |
| 12 | Dark Mode | LOW | NEW | Night-mode toggle for students studying after school hours. |
| 13 | Offline Mode (PWA) | LOW | NEW | Service worker caches assigned bites for MRT connectivity gaps. |
| 14 | Multi-Child Profiles | MEDIUM | ENHANCED | Frictionless switching between child profiles from day one. |
| 15 | Adaptive UI/UX Engine | CRITICAL | NEW | UI/UX dynamically tailors instruction delivery and feedback loops by educational tier. Visual-first for preschool/primary; text-dense for secondary. |

# 7. Feature Detail — New **&**** Enhanced**

## 7.1 Gamification Layer (NEW · CRITICAL)

**Objectives**

- Drive daily app opens without relying on parent enforcement

- Build intrinsic motivation for ages 6–12 through visible progress

- Match KooBits engagement depth without copying their school-social mechanic

**Components**

- **Streak:**Daily Streak Counter visible on home screen. Breaks if no bite completed. 3-day grace restore.

- **XP:**Earn XP per bite completed, per correct comprehension check, per streak milestone. Bonus XP ahead of schedule.

- **Badges:**Tiered: Bronze (10 bites), Silver (30 bites), Gold (100 bites) per subject. Displayed on student profile.

- **Leaderboard:**Weekly XP Leaderboard (opt-in, anonymous by default). Internal to SchoolHub users only.

**Acceptance Criteria**

- Streak counter visible on every page load

- XP awarded within 2 seconds of bite completion

- Badge notification shown on first unlock

- Parents can disable gamification in settings

## 7.2 Chinese Language Support (NEW · CRITICAL)

**Scope**

- Primary Chinese: P1–P6 MOE syllabus — reading, writing, composition starters

- Secondary Chinese: Sec 1–4 — oral practice prompts, comprehension, vocabulary

- Higher Chinese (HCL): Flag in Phase 2 (specialist content required)

**Content Strategy**

- Text + diagrams only (consistent with MVP content strategy)

- Pinyin display toggle (for early primary)

- Vocabulary bite format: character → pinyin → meaning → example sentence

*📝 Video-based oral practice deferred to Phase 2 due to production cost and complexity.*

## 7.3 Preschool UX Mode (ENHANCED · CRITICAL)

**Trigger**

Automatically activates when student age is set to 3–6 during profile creation.

**UX Changes**

- Minimum tap target: 56×56px (vs 44×44px standard)

- Navigation icons: pictographic with text labels below

- Read-aloud: all instruction text has TTS playback button

- Bite length: hard capped at 5 minutes

- Question format: tap-to-select images only (no typing)

- Reward animations: larger, more frequent, celebratory

- Parent must complete setup — child cannot modify own schedule

## 7.4 Tiered Pricing + Free Trial (NEW · CRITICAL)

| **Tier** | **Price** | **Trial** | **Included** |
| --- | --- | --- | --- |
| Free | $0 | 7 days full access | 1 subject, 1 child, basic schedule, no gamification rewards |
| Scholar | $18 / month | — | All subjects, 2 children, full gamification, shareable reports, dark mode |
| Scholar Pro | $35 / month | — | Up to 4 children, preschool UX, offline mode, priority support, exam-pack content |

*📝 Annual plan offers 2 months free. No credit card required for 7-day trial.*

## 7.5 3-Minute Onboarding (ENHANCED · HIGH)

**Flow (Revised)**

- Enter child name + grade level (30 seconds)

- Select subjects from pre-populated MOE-standard list (30 seconds)

- Set exam date(s) — calendar picker, common exam dates pre-filled (30 seconds)

- Set weekly study hours per subject — slider with suggested defaults (30 seconds)

- Preview generated schedule — one-tap confirm (30 seconds)

*📝 Custom syllabus upload (PDF) is an optional advanced step, not required for onboarding.*

## 7.6 Age-Adaptive Bite Length (ENHANCED · HIGH)

| **Age Group** | **Bite Duration** | **Questions per Bite** |
| --- | --- | --- |
| Preschool (3–6) | 3–5 minutes | 2–3 tap-to-select |
| Primary (7–12) | 5–10 minutes | 4–6 mixed format |
| Secondary (13–17) | 10–20 minutes | 6–10 including OEQ |

## 7.7 One-Tap Schedule Regeneration (ENHANCED · HIGH)

**Trigger Conditions**

- Student completes < 60% of scheduled bites in a week

- Parent manually triggers from dashboard

- Exam date changed

**UX Flow**

Banner appears: "Aiden is 3 topics behind. Regenerate schedule?" → Tap [Regenerate] → Modal shows new schedule preview with delta highlighted → Tap [Confirm] → New schedule live.

*📝 No re-setup required. All regenerations logged in parent dashboard history.*

## 7.8 Shareable Progress Report (NEW · MEDIUM)

- Generated every Sunday night, available Monday morning

- Format: Single-image card (WhatsApp-friendly, 1080×1350px) + PDF version

- Contains: subjects studied, bites completed, streak, badges earned, exam countdown

- Share button in parent dashboard and notification

- SchoolHub watermark + App Store/Play Store link (organic growth mechanic)

## 7.9 Weak Topic Explanations (ENHANCED · MEDIUM)

**Before (v1.0)**

"Aiden is weak in: Fractions, Speed, Algebra" — flag only.

**After (v2.0)**

"Aiden is weak in Fractions. This usually means the concept of equivalent fractions hasn't fully clicked yet. Recommended: Start with the Fractions Foundations bite before moving to Mixed Numbers." — plus one-tap action button.

## 7.10 Exam Countdown Widget (NEW · MEDIUM)

- Displays on every page: nav bar or persistent footer banner

- Format: "PSLE · 47 days" (subject · days remaining)

- Colour changes: Green (> 60 days) → Yellow (30–60 days) → Red (< 30 days)

- Multiple exams shown in carousel if child has more than one upcoming

- Can be hidden by student (not parent) to reduce anxiety if preferred

## 7.11 Multi-Child Profiles (ENHANCED · MEDIUM)

- Profile switcher in top navigation header (always visible)

- Avatar + name + grade per child

- Up to 2 children on Scholar plan; up to 4 on Scholar Pro

- Each child has independent schedule, progress, and gamification state

- Parent receives consolidated summary covering all children in one notification

## 7.12 Adaptive UI/UX Engine (NEW · CRITICAL)

**Overview**

SchoolHub dynamically reconfigures instruction delivery, feedback presentation, and interface complexity based on the student's educational tier. A preschooler and a Secondary 4 student receive fundamentally different UI experiences — not just different content, but different interaction patterns, information density, and feedback mechanisms.

**Tier Definitions**

| **Tier** | **Age Range** | **Grade Level** | **UI Mode** |
| --- | --- | --- | --- |
| Preschool | 3–6 | K1–K2 | Visual-First |
| Lower Primary | 7–9 | P1–P3 | Guided Visual |
| Upper Primary | 10–12 | P4–P6 | Transitional |
| Secondary | 13–17 | Sec 1–4 | Text-Dense |

**Instruction Delivery by Tier**

| **Element** | **Preschool / Lower Primary** | **Upper Primary** | **Secondary** |
| --- | --- | --- | --- |
| Instructions | Illustrated step-by-step cards, TTS read-aloud on every screen | Short sentences + supporting icon | Full prose paragraphs, no icons required |
| Feedback Messages | Large animated emoji + 1–3 word praise ("Great job!") | Short sentence + colour indicator | Detailed explanation of correct/incorrect reasoning |
| Error Handling | Gentle animation, no score penalty shown, encourage retry | "Try again" with hint tooltip | Explicit error message + link to related concept bite |
| Progress Indicators | Star/smiley face per bite, large colour fills | Progress bar + XP delta | Percentage complete + topic mastery score |
| Navigation Labels | Icon only with spoken label on tap | Icon + short text label | Text label only |
| Question Format | Tap-to-select image options, no keyboard | Mixed: image tap + short text input | Full text input, open-ended questions, structured essays |
| Content Density | One concept per screen, max 2 sentences | 2–3 concepts per screen | Full topic summary, multi-paragraph, cross-references |

**Feedback Loop Architecture**

- Immediate Feedback: Delivered within 1 second of interaction for all tiers; format adapts per tier definition above

- Session Summary: Preschool/Lower Primary — animated trophy screen. Upper Primary — bite summary card. Secondary — topic mastery breakdown with gap analysis.

- Weekly Review: Preschool/Lower Primary — parent-facing only (child does not see weekly report). Secondary — student receives own detailed progress report alongside parent copy.

- Weak Topic Flags: Preschool/Lower Primary — surfaced to parent only, not student. Upper Primary — surfaced to student in simplified language. Secondary — surfaced to student with full diagnostic reasoning.

**Adaptive Trigger Logic**

- Tier assigned at profile creation based on grade level input

- Tier upgrades automatically on academic year rollover (e.g. P6 → Sec 1 in January)

- Parent may manually override tier in child profile settings

- System monitors bite completion patterns; if Secondary student consistently scores < 40%, UI downgrades offer surfaced to parent (optional)

**Technical Requirements**

- Tier context injected into every screen render via user profile state

- Component library includes tier-variant for each UI element (TierCard, TierFeedback, TierProgress)

- TTS integration (Web Speech API) gated behind Preschool/Lower Primary tier flag

- Feedback tone and vocabulary calibrated via Claude prompt layer — tier passed as system context

- All tier-specific component variants unit-tested against each tier definition

**Acceptance Criteria**

- Preschool student never encounters keyboard input on any bite screen

- Secondary student never encounters TTS auto-play unless manually triggered

- Switching child profiles instantly re-renders full UI to target tier within 300ms

- Weak topic diagnostic language passes readability check: Flesch-Kincaid Grade ≤ 3 for Lower Primary; ≥ 9 for Secondary

- Parent dashboard always renders in text-dense Secondary-equivalent mode regardless of child tier

# 8. Technical Architecture

## Stack

| **Layer** | **Technology** |
| --- | --- |
| Frontend | React 18 + TypeScript + Tailwind CSS + Shadcn/ui (web-responsive, PWA) |
| Backend | Node.js + Express + TypeScript |
| Database | Supabase (PostgreSQL) + Supabase Auth |
| AI Engine | Claude Sonnet (curriculum parsing, schedule generation, weak topic explanations, adaptive feedback tone) |
| Notifications | Telegram Bot API (free) + Twilio SMS (fallback) |
| Offline/PWA | Service Worker with Workbox — cache-first for assigned bites |
| Hosting | Vercel (frontend) + Railway (backend) + Supabase (database) |

## New Technical Requirements (v2.0)

- PWA manifest + service worker for offline bite caching

- TTS integration (Web Speech API) for preschool read-aloud

- Image generation pipeline for shareable progress cards (canvas/puppeteer)

- XP/badge event system with real-time websocket updates

- Multi-tenant child profile architecture from day one

- Tier-aware component rendering system (TierCard, TierFeedback, TierProgress variants)

- Claude prompt layer with tier context injection for adaptive feedback tone calibration

# 9. Monetisation Strategy

## Pricing Model

Freemium with 7-day full-access trial (no credit card). Three subscription tiers as defined in Section 7.4.

## Revenue Targets (Year 1)

- 500 active users by Month 6

- 8–12% trial-to-paid conversion

- Average revenue per user: SGD $25/month

- Target: SGD $5,000 MRR by Month 12

## Phase 2 Revenue Streams

- School/tuition centre licences (B2B2C)

- Exam packs — premium topic-specific deep-dives

- Tutor marketplace referral fee (10–15%)

# 10. Success Metrics

| **Category** | **Metric** | **Target** |
| --- | --- | --- |
| Acquisition | Active users at Month 6 | 500+ |
| Acquisition | Trial-to-paid conversion | 8–12% |
| Engagement | Monthly retention | 60%+ |
| Engagement | Daily active rate (DAU/MAU) | 40%+ |
| Engagement | Bite completion rate | 70%+ |
| Product | Onboarding completion time | < 3 minutes |
| Product | Curriculum parse accuracy | 90%+ |
| Product | Tier UI switch render time | < 300ms |
| Revenue | MRR at Month 12 | SGD $5,000+ |
| Growth | Progress reports shared/week | 20%+ of active users |

# 11. Product Roadmap

## Phase 1 — MVP (Now → Month 3)

- All 15 improvements from Section 6 shipped (including Adaptive UI/UX Engine)

- Singapore launch, all MOE subjects, preschool + primary + secondary

- Freemium pricing live

- Telegram notification bot

- Target: 500 users, validate retention

## Phase 2 — Growth (Month 4–9)

- Video bite format (commissioned educator content)

- Google Classroom integration (school pilot)

- School/tuition centre B2B licence

- Higher Chinese (HCL) support

- Mobile native app (iOS + Android)

## Phase 3 — Expansion (Month 10–15)

- Malaysia, Hong Kong, India market entry

- AI tutoring chatbot (student asks Claude questions)

- Enterprise MOE integration discussions

- Peer study groups (opt-in social learning)

# 12. Risk Register

| **Risk** | **Likelihood** | **Mitigation** |
| --- | --- | --- |
| Low trial-to-paid conversion | Medium | 7-day full trial removes hesitation. Shareable report card drives FOMO among parents. |
| Gamification disengages older students | Medium | Gamification opt-out in settings. Secondary UI de-emphasises XP; emphasises progress percentage instead. |
| Chinese content quality | High | Commission MOE-trained Chinese educators for content review before launch. Beta test with 20 families. |
| MOE syllabus changes mid-year | Low | Build curriculum version control. Flag parents when syllabus updates detected. Offer one-tap schedule refresh. |
| PWA offline limitations on iOS | Medium | Test offline mode on iOS Safari specifically. Document known limitations. Prioritise native iOS app in Phase 2. |
| Adaptive UI/UX tier miscalibration | Medium | User testing per tier with 5+ students each before launch. Readability scoring automated via CI pipeline. Parent override available from day one. |

# 13. Document Metadata

| **Field** | **Value** |
| --- | --- |
| Document Version | 2.0 |
| Previous Version | 1.0 (April 2026 — initial PRD) |
| Changes in v2.0 | 15 MVP improvements added (Section 6 & 7), including new Adaptive UI/UX Engine (Section 7.12) |
| Last Updated | April 2026 |
| Target Launch | June 2026 (Beta) |
| Primary Market | Singapore (scale internationally post-validation) |
| Status | Approved for MVP Development |

## Sign-offs

| **Role** | **Name** | **Signature / Date** |
| --- | --- | --- |
| Product Owner |  |  |
| Engineering Lead |  |  |
| Design Lead |  |  |

*SchoolHub PRD v2.0 · Adaptive Learning **&** Study Scheduling · Singapore · April 2026*
