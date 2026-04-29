# SchoolHub Documentation Index

Aligned to **PRD v3.0 (April 2026)**. Scope: Singapore K2 → P6. Launch: June 2026 Beta.

## File Map

| Folder / File | Purpose | Audience |
|---|---|---|
| `01_Start_Here/START_HERE.md` | Role-based onboarding guide | Everyone |
| `01_Start_Here/DELIVERY_SUMMARY.txt` | What's been delivered so far | PM / exec |
| `02_Core_Documentation/SchoolHub_PRD_v3.md` | **Authoritative** PRD v3.0 | Everyone |
| `02_Core_Documentation/SchoolHub_API_Reference.md` | Endpoints + DB schema + rate limits | Engineering |
| `02_Core_Documentation/SchoolHub_Quick_Reference.md` | One-page cheat sheet | Everyone |
| `02_Core_Documentation/SchoolHub_Complete_Documentation_Summary.md` | Executive doc summary | PM / exec |
| `02_Core_Documentation/SchoolHub_Documentation_Index.md` | *This file* | Everyone |
| `02_Core_Documentation/archive/` | Superseded PRDs (v1, v2) — historical only | — |
| `03_Skills_Framework/SchoolHub_Skills_Framework.md` | Role learning paths | Everyone |
| `03_Skills_Framework/schoolhub-fullstack-dev-skill.md` | Engineering skill | Engineering |
| `03_Skills_Framework/schoolhub-product-design-skill.md` | Design skill | Design |
| `03_Skills_Framework/schoolhub-ai-curriculum-skill.md` | AI skill | AI / curriculum |
| `04_Curriculum_Sync/SchoolHub_Curriculum_Sync_Summary.md` | MOE sync overview | PM / engineering |
| `04_Curriculum_Sync/SchoolHub_Curriculum_Sync_Technical_Guide.md` | MOE sync implementation | Engineering |
| `05_Features/SchoolHub_Parent_Notifications_Implementation.md` | Telegram + Twilio notifications spec | Engineering |

## Recommended Reading Order

### 5 minutes

Read `SchoolHub_Quick_Reference.md`. Done.

### 45 minutes (non-technical)

1. `SchoolHub_Quick_Reference.md` — 5 min.
2. `SchoolHub_PRD_v3.md` §1–§7 — 30 min.
3. `SchoolHub_Complete_Documentation_Summary.md` — 10 min.

### 90 minutes (engineering)

1. `SchoolHub_Quick_Reference.md` — 5 min.
2. `SchoolHub_PRD_v3.md` — 45 min.
3. `SchoolHub_API_Reference.md` — 20 min.
4. `schoolhub-fullstack-dev-skill.md` — 20 min.

### 2 hours (design)

1. `SchoolHub_Quick_Reference.md` — 5 min.
2. `SchoolHub_PRD_v3.md` — 45 min (focus §4, §6, §7).
3. `schoolhub-product-design-skill.md` — 45 min.
4. Start wireframing grade-band variants + SEN overlays.

### 2 hours (AI / curriculum)

1. `SchoolHub_Quick_Reference.md` — 5 min.
2. `SchoolHub_PRD_v3.md` — 45 min (focus §7, §8).
3. `schoolhub-ai-curriculum-skill.md` — 30 min.
4. `04_Curriculum_Sync/SchoolHub_Curriculum_Sync_Technical_Guide.md` — 40 min.

## Key Decisions (v3)

- **Scope narrowed to K2–P6.** Preschool (3–5) and Secondary (13–17) removed. Reduces variant sprawl and focuses MVP on the Singapore primary market.
- **K2 readiness mode, not MOE syllabus.** Three pre-built tracks (English, Math, Chinese Foundations). Countdown becomes "P1 in N days".
- **SEN as a first-class profile.** ADHD, Autism Spectrum, Other SEN. Overlay on top of grade band. Psychologist review pre-beta.
- **Mental-health guardrails are rule-based.** No AI classification. Suggestions only; parent always overrides; never clinical claims.
- **Data input over curriculum-only.** Parents can upload spelling lists, school calendars, assessment dates (.csv/.xlsx/.txt/.ics/.pdf). Manual entry everywhere.
- **Sibling timeline dashboard as the home screen.** Priya optimises across children.
- **Gamification per-child opt-out + guardrail auto-pause.** Prevents pressure on overloaded students.
- **Claude model: Sonnet (claude-sonnet-4-6).** Five use cases. All outputs zod-validated before DB write.

## Cross-References

### By topic

- **Curriculum ingestion:** `04_Curriculum_Sync/` + `schoolhub-ai-curriculum-skill.md` + `SchoolHub_API_Reference.md` §13.
- **File upload pipeline:** `SchoolHub_API_Reference.md` §4 + `schoolhub-fullstack-dev-skill.md` (File Upload Pipeline).
- **SEN behaviour:** `SchoolHub_PRD_v3.md` §7.4 + `schoolhub-product-design-skill.md` (SEN overlays) + `schoolhub-fullstack-dev-skill.md` (SEN endpoints).
- **Mental-health guardrails:** `SchoolHub_PRD_v3.md` §7.3 + `schoolhub-ai-curriculum-skill.md` (Mental-Health Signals) + `SchoolHub_API_Reference.md` §9.
- **Sibling timeline:** `SchoolHub_PRD_v3.md` §7.2 + `SchoolHub_API_Reference.md` §7 + `schoolhub-product-design-skill.md` (critical screens).
- **Gamification + real-time XP:** `SchoolHub_PRD_v3.md` §7.5 + `SchoolHub_API_Reference.md` §8 + `schoolhub-fullstack-dev-skill.md` (testing targets).
- **Notifications:** `05_Features/SchoolHub_Parent_Notifications_Implementation.md` + `SchoolHub_API_Reference.md` §10.

### By role

- **Product manager:** Quick Reference → PRD v3 → Complete Documentation Summary.
- **Engineer:** Quick Reference → PRD v3 → API Reference → fullstack skill → curriculum sync guide.
- **Designer:** Quick Reference → PRD v3 (§4 personas, §6 features, §7 feature detail) → design skill.
- **AI / curriculum:** Quick Reference → PRD v3 §7–§8 → AI skill → curriculum sync guide.

## Launch Readiness Checklist (Pre-beta)

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
| **3.0** | **2026-04-24** | SEN & Mental Health Update. Scope narrowed to K2–P6. 4 new features (Data Input, SEN Support, Mental Health Guardrails, Sibling Dashboard). Preschool + Secondary removed. |

## Status

**Approved for MVP Development.** Target: 500 active users at Month 6; trial-to-paid 8–12%; SGD $5,000 MRR by Month 12.
