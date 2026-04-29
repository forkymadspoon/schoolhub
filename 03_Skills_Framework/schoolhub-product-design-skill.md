---
name: schoolhub-product-design-ux
description: Design SchoolHub's UX for Singapore parents and students aged 6–12 (K2 → P6). Aligned to PRD v3.0 — grade-band variants, SEN overlays (ADHD / Autism / Other SEN), mental-health guardrails, sibling timeline, exam countdown, and data upload. Covers personas, user flows, grade-band design system, SEN accessibility, and critical screens.
---

# SchoolHub Product Design & UX

Design framework aligned to **PRD v3.0 (April 2026)**. Scope: Singapore K2 → P6 parents and students. Web-only responsive PWA.

## Design Principles

1. **Clarity over features** — every element serves a purpose; no clutter.
2. **Progress visibility** — parents and students see measurable progress every session.
3. **Frictionless setup** — first schedule in < 3 min, including file-upload path.
4. **Mobile-first** — design for 375 px phones; scale to tablet + desktop.
5. **Grade-band aware** — K2 / Lower Primary / Upper Primary variants, not one-size-fits-all.
6. **SEN-inclusive** — ADHD / Autism / Other SEN overlays sit on top of the grade-band layer.
7. **Wellbeing-first** — mental-health guardrails framed as suggestions; never alarm bells.
8. **Accessibility** — WCAG 2.1 AA minimum. 56×56 px tap targets for K2 / Lower Primary.
9. **Local adaptation** — English + Chinese (Simplified) with pinyin toggle for P1–P2.

## Personas (from PRD v3)

### Priya, 38 — Busy Parent

Two children (K2 + P4). Spends SGD $800/month on tuition. Primary payer. WhatsApp-native; checks phone 40+ times a day. Wants "are we on track?" answered in seconds.

### Aiden, 10 — Primary 4 Student

Motivated but easily distracted. Responds to streaks and badges. Uses iPad for school. Needs bites that fit between other activities.

### Sarah, 42 — SEN Parent

Child (age 9, P3) diagnosed with ADHD. Needs structured, calm, predictable study routines. Frustrated that mainstream platforms don't accommodate her child's pace. Wants tools not labels.

## User Journeys

### Priya — Onboarding (target: < 3 min)

```
Open site → Sign up (email, no CC)                       0:30
Add child: name, grade P4                                1:00
Subjects: English, Math, Chinese, Science                1:30
Upload school calendar (.pdf) or pick SG presets         2:00
Upload spelling list (.csv) — optional                   2:20
Weekly study hours: slider per subject                   2:40
Preview schedule → Confirm                               3:00
Telegram link (one message: one digest)                  DONE
```

K2 path replaces syllabus upload with readiness-track selection (English / Math / Chinese Foundations) + P1 intake date.

### Aiden — Daily Loop

```
Open home → "Today's Goal: 3 bites · 30 min"
Streak banner shows 🔥 12
Start bite → 8 min → XP awarded in < 2 s via WS
Streak updates in place
Badge unlock cue on 10th cumulative bite
Countdown widget visible throughout
```

### Sarah — SEN Setup (ADHD)

```
Add child → toggle "Enable SEN profile"
Select ADHD → brief framework disclosure
Confirm → schedule regenerates with 5-min bite cap
Focus Mode enabled; leaderboard hidden
First bite: single task on screen, timer visible
```

## Grade-Band Variants

| Band | Ages | UI mode | TTS | Tap target | Readability | Input style |
|------|------|---------|-----|-----------|-------------|-------------|
| K2 | 6 | Visual-first | Auto | 56×56 px | FK ≤ 2 | Image-first, no typing required |
| Lower Primary (P1–P3) | 7–9 | Guided visual | Auto (P1–P2) | 56×56 px | FK ≤ 3 | Image + short text; pinyin toggle |
| Upper Primary (P4–P6) | 10–12 | Transitional | Opt-in | 44×44 px | FK ≤ 6 | Text + multi-choice; scaffolded open |

Grade-band shifts component variants (`TierCard`, `TierFeedback`, `TierProgress`), bite duration defaults, and Claude tone calibration.

## SEN Overlays

Applied as a wrapper on top of the grade-band variant — never replaces the grade-band design.

### ADHD overlay

- Bite duration hard-capped at 5 min (timer visible).
- Focus Mode: single task visible at a time; side nav collapsed.
- Reduced visual clutter: muted background, no animated accents.
- Positive reinforcement on every bite completion.
- Frequent micro-break cues ("Stretch for 60 s").
- Leaderboard hidden by default.

### Autism Spectrum overlay

- Consistent schedule layout; no surprise changes.
- Schedule changes require 48-hour advance-notice card before activation.
- Predictable reward cadence (same animation, same spot).
- Animated transitions disabled.
- Explicit *what happens next* copy on every screen.
- Leaderboard hidden by default.

### Other SEN overlay

- Adaptive difficulty (Vygotsky ZPD): scaffolded hints before answers.
- Extended response time on quizzes (double default).
- Parent notified of frustration signals (3+ incorrect in a row).

All overlays include a subtle **"SEN profile active"** indicator for parents in settings — never shown to the student.

## Design System

### Colour tokens

```
--color-primary:       #2563EB   /* Trust, learning */
--color-primary-soft:  #DBEAFE   /* Backgrounds, chips */
--color-success:       #10B981
--color-warning:       #F59E0B
--color-danger:        #EF4444
--color-neutral-900:   #111827
--color-neutral-600:   #6B7280
--color-neutral-200:   #E5E7EB
--color-surface:       #FFFFFF
--color-surface-soft:  #F9FAFB

/* Wellbeing traffic light */
--wellbeing-green:  #10B981
--wellbeing-amber:  #F59E0B
--wellbeing-red:    #EF4444

/* Dark mode — Scholar+ */
--color-surface-dark:       #0F172A
--color-surface-soft-dark:  #1E293B
```

### Typography

```
Headings:  Inter Bold          h1 32 · h2 24 · h3 20 · h4 16
Body:      Inter Regular       md 16 · sm 14
Caption:   Inter Medium        12
Chinese:   Noto Sans SC        with pinyin Noto Sans Mono SC 0.8em superscript
```

### Spacing & radius

```
--space-xs: 4   --space-sm: 8   --space-md: 16   --space-lg: 24   --space-xl: 32
--radius-sm: 4  --radius-md: 8  --radius-lg: 12  --radius-pill: 9999
```

### Motion

```
--duration-fast:    150ms
--duration-normal:  300ms  /* Profile switch budget */
--duration-slow:    450ms
--ease-standard:    cubic-bezier(0.2, 0, 0, 1)
```

Autism overlay zeros motion (`--duration-*: 0`).

## Critical Screens

### 1. Onboarding — Upload step

```
┌─────────────────────────────────────┐
│ Step 4 of 6  ●●●●○○                 │
│                                     │
│ Add your school's key dates         │
│                                     │
│ ┌───────────────────────────────┐   │
│ │  Drop school calendar here    │   │
│ │  .pdf · .ics · .xlsx          │   │
│ │          [Browse]             │   │
│ └───────────────────────────────┘   │
│                                     │
│ Or use SG presets:                  │
│  • SA1 · SA2 · PSLE · CA1 · CA2     │
│                                     │
│ Spelling list (optional)            │
│ [ Upload .csv / .xlsx ]  [ Type ]   │
│                                     │
│ [ Back ]                [ Next → ]  │
└─────────────────────────────────────┘
```

Inline parse error UX: show row-by-row correction form under the dropzone if parser returns `failed`.

### 2. Parent Dashboard — Sibling Timeline

```
┌─────────────────────────────────────────────────────────┐
│ 👋 Morning Priya     🔔   ⚙︎    PSLE · 171 days  🟢        │
├─────────────────────────────────────────────────────────┤
│ [ Aiden P4 ] [ Mia K2 ]          < Week 18 · May 4 >    │
│                                                         │
│   Mon    Tue    Wed    Thu    Fri    Sat    Sun         │
│  ──────────────────────────────────────────             │
│  Aiden  ▓▓▓    ▓▓     ▓▓▓    ▓▓     ▓▓     —    —      │
│  Mia    ▓      ▓      ▓      ▓      ▓      —    —      │
│                                                         │
│  ⚠︎ Wed May 6 — both children high intensity            │
│     [ Apply suggestion: shift Aiden science → Thu ]     │
│                                                         │
│  Wellbeing: Aiden 🟢 · Mia 🟡 (activity imbalance)      │
└─────────────────────────────────────────────────────────┘
```

Conflict rows sit immediately below the calendar with a **one-tap Apply**. Wellbeing traffic light is readable at a glance; tap to open the signal card.

### 3. Schedule Regeneration — Delta preview

```
┌─────────────────────────────────────┐
│ Review updated schedule             │
│                                     │
│ Rohan completed 42% of bites last   │
│ week, so we've lightened the load   │
│ for weeks 3–6.                      │
│                                     │
│ +12 bites added        (weeks 3–6)  │
│ −4  bites removed                   │
│ ~18 bites shifted                   │
│                                     │
│ ▓▓░░▓▓▓▓▓░▓▓▓▓▓▓▓                    │
│ old ▓  added ░  shifted ~           │
│                                     │
│ ℹ︎ Autism profile active              │
│   Activates Fri 26 Apr 10:00 (+48h) │
│                                     │
│ [ Cancel ]          [ Confirm ]     │
└─────────────────────────────────────┘
```

Plain-language reason text always appears above the delta numbers. One sentence maximum. Copy derived from trigger type + metric (server-side template, not AI-generated).

### 4. Student Daily Goal (Upper Primary)

```
┌─────────────────────────────────────┐
│ ← Home                     🔥 12    │
│                                     │
│ Today's Goal                        │
│ 3 bites · 30 min                    │
│                                     │
│ ▓▓░░░░░░░░░░░░░░  1 / 3              │
│                                     │
│ ✓ Fractions — Equivalents (10 min)  │
│ ▸ Fractions — Comparing (10 min)    │
│ ○ Word problems (10 min)            │
│                                     │
│ [ Start next bite ]                 │
│                                     │
│ PSLE · 171 days  🟢                  │
└─────────────────────────────────────┘
```

K2 variant shows bites as illustrated tiles with character + audio; countdown becomes "P1 in 253 days".

### 5. Bite Viewer — ADHD Focus Mode

```
┌─────────────────────────────────────┐
│                        5:00 ▓░░░░░  │
│                                     │
│  Learning objective                 │
│  Add two two-digit numbers          │
│                                     │
│  24 + 37 = ?                        │
│                                     │
│  [ 51 ]   [ 61 ]   [ 71 ]           │
│                                     │
│  🎯 Nice one                         │
└─────────────────────────────────────┘
```

No nav. No streak chrome. Single task. Timer visible. Positive reinforcement on success.

### 6. Wellbeing Panel (Scholar Pro)

```
┌─────────────────────────────────────┐
│ Aiden — wellbeing                   │
│                                     │
│ 🟡 Burnout risk                      │
│ Streak dropped 3 days in a row.     │
│                                     │
│ Suggestion                          │
│ Pause gamification pressure.        │
│ Consider a 2-day break.             │
│                                     │
│ [ Accept ]  [ Modify ]  [ Dismiss ] │
│                                     │
│ Suggestions only. You're always     │
│ in control. SchoolHub is not a    │
│ medical tool.                       │
└─────────────────────────────────────┘
```

Tone rules: framed as suggestions; parent always overrides; never clinical language.

### 7. Exam Countdown Widget

```
┌────────────────────────────────┐
│ PSLE · 171 days  🟢             │    persistent nav chip
└────────────────────────────────┘
```

- Green > 60 days, Yellow 30–60, Red < 30.
- Multi-exam carousel (swipe).
- K2: renders "P1 · N days 🟢".
- Student can hide; parent cannot.

### 8. Shareable Progress Card

1080 × 1350 px WhatsApp card, generated Sunday 22:00 SGT.

```
┌─────────────────────────────┐
│  Aiden · Primary 4          │
│  Week 18                    │
│  ──────────────────────     │
│  ✓ 14 bites  · 🔥 12 days   │
│  Badges: 🥈 Math · 🥉 Eng   │
│  PSLE · 171 days  🟢         │
│  Wellbeing  🟢               │
│                             │
│            schoolhub.app  │
└─────────────────────────────┘
```

## Information Architecture

### Parent

```
Home                   Sibling timeline + wellbeing snapshots
Plan                   Calendar · regenerate · upload data
Progress               Per-child trends · weak topics · badges
Wellbeing (Pro)        Signals · holistic prompts
Settings               Children · SEN profile · notifications · plan
```

### Student

```
Today                  Goal · streak · start bite
My Stats               Weekly summary · badges
Settings               Appearance · notifications
```

Child profile switcher is always in the top nav (Scholar: 2, Scholar Pro: 4).

## Accessibility Checklist

- Colour contrast ≥ 4.5:1 body / ≥ 3:1 large text (WCAG 2.1 AA)
- Tap target 56×56 px (K2 / Lower Primary), 44×44 px (Upper Primary)
- Keyboard reachable; visible focus ring (blue, 2 px)
- Form labels always visible; no placeholder-only labels
- Motion: respect `prefers-reduced-motion`; Autism overlay zeros motion
- ARIA labels on icon-only buttons; live region for XP/streak updates
- Pinyin toggle globally accessible for P1–P2
- Dark mode contrast re-validated
- TTS works offline for K2 cached bites
- Wellbeing tone reviewed by Singapore-based child psychologist before beta

## Responsive Breakpoints

```
Mobile   ≤ 640 px  primary target (375 px baseline)
Tablet   641–1024 px
Desktop  ≥ 1025 px (sibling timeline 2-up)
```

Swipe gestures: calendar navigation, countdown carousel, badge gallery.

## Prototypes to Produce (Figma)

1. Onboarding — K2 and P1–P6 variants, including upload + error states.
2. Sibling timeline dashboard — empty, standard, conflict-detected states.
3. Schedule regen modal — immediate vs 48h-delayed (ASD) variants.
4. Student Daily Goal — Upper Primary vs K2 vs ADHD Focus Mode variants.
5. Wellbeing panel — green / amber / red states.
6. Shareable progress card template.
7. Exam countdown chip — green / yellow / red / K2 readiness.
8. Settings — SEN profile picker with disclosure copy.

## Design Decisions & Rationale

- **Grade bands, not a single tier ladder.** v3 drops Preschool and Secondary — three bands are easier to design for and reduce variant sprawl.
- **SEN overlay pattern, not SEN theme.** Overlays compose on top of grade-band variants, so a P4 ADHD child still looks like a P4 child to their peers (privacy + dignity).
- **48-hour delayed activation for ASD.** Removes the single biggest frustration pattern for autistic learners: surprise change.
- **Wellbeing signals are suggestions, not alerts.** Reduces false-positive anxiety; preserves parent agency; avoids clinical overreach.
- **Sibling timeline over per-child view.** Priya optimises across children; the UI reflects that.
- **Emoji-first mood buttons (student).** Faster and more engaging than Likert scales.
- **Sunday-night progress card.** Aligns with parents' weekend planning cadence and WhatsApp sharing habits.

## Usability Testing Checklist

- Can a new parent finish onboarding in < 3 min on a 375 px phone?
- Does the sibling timeline surface a conflict in one glance?
- Does the schedule delta preview communicate change without re-setup anxiety?
- Can an Upper Primary student finish a bite in under 10 min unaided?
- Does the ADHD Focus Mode prevent distraction without feeling punitive?
- Does the ASD 48h-delay notice feel reassuring, not restrictive?
- Does the wellbeing panel read as supportive, not clinical?
- Is the countdown widget legible at chip scale on 375 px?
- Does the progress card motivate sharing without feeling braggy?

## Token File (CSS variables)

```css
:root {
  /* Colours */
  --color-primary: #2563EB;
  --color-primary-soft: #DBEAFE;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-neutral-900: #111827;
  --color-neutral-600: #6B7280;
  --color-neutral-200: #E5E7EB;
  --color-surface: #FFFFFF;
  --color-surface-soft: #F9FAFB;

  /* Wellbeing */
  --wellbeing-green: #10B981;
  --wellbeing-amber: #F59E0B;
  --wellbeing-red: #EF4444;

  /* Spacing */
  --space-xs: 4px; --space-sm: 8px; --space-md: 16px;
  --space-lg: 24px; --space-xl: 32px;

  /* Radius */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-pill: 9999px;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-zh: 'Noto Sans SC', var(--font-sans);
  --fs-caption: 12px; --fs-sm: 14px; --fs-md: 16px; --fs-lg: 20px; --fs-xl: 24px; --fs-2xl: 32px;

  /* Motion */
  --duration-fast: 150ms; --duration-normal: 300ms; --duration-slow: 450ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}

[data-sen="autism"] {
  --duration-fast: 0ms; --duration-normal: 0ms; --duration-slow: 0ms;
}

@media (prefers-reduced-motion: reduce) {
  :root { --duration-fast: 0ms; --duration-normal: 0ms; --duration-slow: 0ms; }
}

[data-theme="dark"] {
  --color-surface: #0F172A;
  --color-surface-soft: #1E293B;
  --color-neutral-900: #F9FAFB;
  --color-neutral-600: #94A3B8;
}
```

## References

- `02_Core_Documentation/SchoolHub_PRD_v3.md` — authoritative
- `03_Skills_Framework/schoolhub-fullstack-dev-skill.md` — component hierarchy
- `03_Skills_Framework/schoolhub-ai-curriculum-skill.md` — tone calibration prompts
- `05_Features/SchoolHub_Parent_Notifications_Implementation.md` — notification copy
