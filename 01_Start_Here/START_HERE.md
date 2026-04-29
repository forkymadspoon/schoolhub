# SchoolHub — Start Here

Aligned to **PRD v3.0 (April 2026)**. Scope: Singapore K2 → P6. Launch: June 2026 Beta.

## What SchoolHub Does

AI-driven adaptive study scheduling for Singapore parents and students aged 6–12. Parents build curriculum-aligned plans; students learn through bite-size lessons with personalised pacing, gamification, SEN-aware adaptations, and mental-health guardrails.

Core differentiator: AI-driven adaptive scheduling + SEN behavioural frameworks + mental-health guardrails — answering "are we on track, and is my child okay?" in real time.

## 5-Minute Orientation

| | |
|---|---|
| Market | Singapore |
| Grades | K2 → P6 (ages 6–12) |
| Platform | Web-only responsive PWA |
| Languages | English + Chinese (Simplified) |
| Launch | June 2026 Beta |
| Authoritative spec | `02_Core_Documentation/SchoolHub_PRD_v3.md` |

Preschool (ages 3–5) and Secondary (Sec 1–4) removed in v3. Scope narrowed to the Singapore primary market.

## What's New in v3

- **Scope narrowed** to K2 → P6.
- **K2 readiness mode** replaces MOE syllabus at that age; countdown shows "P1 in N days".
- **SEN Support Framework** — ADHD, Autism Spectrum, Other SEN. Overlay on top of grade-band variant. Psychologist review pre-beta.
- **Mental-Health Guardrails** — rule-based, suggestion-only, parent always overrides. No AI classification. No clinical claims.
- **Data Input** — parents upload spelling lists, school calendars, assessment dates (.csv / .xlsx / .txt / .ics / .pdf). Manual entry everywhere.
- **Sibling Timeline Dashboard** as the home screen for multi-child accounts.
- **Gamification per-child opt-out + guardrail auto-pause** — prevents pressure on overloaded students.
- **Claude Sonnet (`claude-sonnet-4-6`)** — five use cases. All outputs zod-validated.

## Documentation Map

```
SchoolHub/
├── 01_Start_Here/
│   ├── START_HERE.md                (this file)
│   └── DELIVERY_SUMMARY.txt
├── 02_Core_Documentation/
│   ├── SchoolHub_PRD_v3.md        ← authoritative
│   ├── SchoolHub_API_Reference.md
│   ├── SchoolHub_Quick_Reference.md
│   ├── SchoolHub_Documentation_Index.md
│   ├── SchoolHub_Complete_Documentation_Summary.md
│   └── archive/                     (v1, v2 — historical only)
├── 03_Skills_Framework/
│   ├── SchoolHub_Skills_Framework.md
│   ├── schoolhub-fullstack-dev-skill.md
│   ├── schoolhub-product-design-skill.md
│   └── schoolhub-ai-curriculum-skill.md
├── 04_Curriculum_Sync/
│   ├── SchoolHub_Curriculum_Sync_Summary.md
│   └── SchoolHub_Curriculum_Sync_Technical_Guide.md
└── 05_Features/
    └── SchoolHub_Parent_Notifications_Implementation.md
```

## Role-Based Reading Paths

### Product manager (~1 h)

1. `02_Core_Documentation/SchoolHub_Quick_Reference.md` — 5 min.
2. `02_Core_Documentation/SchoolHub_PRD_v3.md` §1–§7 — 40 min.
3. `02_Core_Documentation/SchoolHub_Complete_Documentation_Summary.md` — 10 min.

### Full-stack engineer (~90 min)

1. `02_Core_Documentation/SchoolHub_Quick_Reference.md` — 5 min.
2. `02_Core_Documentation/SchoolHub_PRD_v3.md` — 45 min.
3. `02_Core_Documentation/SchoolHub_API_Reference.md` — 20 min.
4. `03_Skills_Framework/schoolhub-fullstack-dev-skill.md` — 20 min.

Then begin Sprint 1 (Onboarding + Data Upload) in `SchoolHub_Skills_Framework.md`.

### Product designer (~2 h)

1. `02_Core_Documentation/SchoolHub_Quick_Reference.md` — 5 min.
2. `02_Core_Documentation/SchoolHub_PRD_v3.md` §4, §6, §7 — 45 min.
3. `03_Skills_Framework/schoolhub-product-design-skill.md` — 45 min.
4. Start wireframing grade-band variants + SEN overlays.

### AI / curriculum engineer (~2 h)

1. `02_Core_Documentation/SchoolHub_Quick_Reference.md` — 5 min.
2. `02_Core_Documentation/SchoolHub_PRD_v3.md` §7–§8 — 45 min.
3. `03_Skills_Framework/schoolhub-ai-curriculum-skill.md` — 30 min.
4. `04_Curriculum_Sync/SchoolHub_Curriculum_Sync_Technical_Guide.md` — 40 min.

## Priority Feature Map (PRD v3 §6)

| Priority | Features |
|----------|----------|
| Critical | Gamification · Chinese · Tiered pricing + free trial · Data input · SEN support · Mental-health guardrails |
| High | 3-min onboarding · Sibling timeline dashboard · One-tap schedule regeneration · Configurable notifications |
| Medium | Shareable progress report · Exam countdown · Weak-topic explanations |
| Low | Dark mode · Offline PWA |

## Key Constraints

| Constraint | Target |
|------------|--------|
| Onboarding | < 3 min |
| Grade-band UI switch | < 300 ms |
| XP payout | < 2 s via WebSocket |
| Curriculum parse accuracy | ≥ 90% |
| ADHD bite cap | ≤ 5 min |
| ASD schedule-change notice | ≥ 48 h |
| Progress card | 1080×1350 px |
| Data residency | Supabase (Singapore region) — PDPA |

## Pricing

| Tier | Price | Children |
|------|-------|----------|
| Free (7-day trial, no CC) | $0 | 1 |
| Scholar | $18 / mo | 2 |
| Scholar Pro | $35 / mo | 4 |

Annual = 2 months free. Scholar Pro unlocks offline PWA, SEN for all children, wellbeing dashboard, priority support, exam packs.

## Launch Readiness (pre-beta)

- All 15 features from PRD v3 §6 shipped.
- Psychologist review of SEN framework complete.
- MOE-trained Chinese educator review of Chinese content complete.
- Curriculum parse accuracy measured ≥ 90% (sampled ≥ 5%).
- Performance targets met.
- PWA iOS Safari suite passing.
- Beta cohort of 20 families onboarded.
- PDPA review complete.

## Top Risks

| Risk | Level | Mitigation |
|------|-------|-----------|
| Chinese content quality | HIGH | MOE-trained educator review pre-launch |
| SEN content accuracy | HIGH | Psychologist review; not a clinical tool |
| Mental-health false positives | MED | Suggestions only; parent override |
| PWA iOS Safari | MED | Dedicated iOS test suite |
| Low trial-to-paid | MED | 7-day full trial + shareable report card |
| Gamification stress | MED | Per-child opt-out + guardrail auto-flags |

## Status

**Approved for MVP Development.** Target: 500 active users by Month 6; trial-to-paid 8–12%; SGD $5,000 MRR by Month 12.

Read `02_Core_Documentation/SchoolHub_Quick_Reference.md` next.
