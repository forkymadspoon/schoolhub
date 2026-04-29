# SchoolHub — Automated Curriculum Sync (Executive Summary)

Aligned to **PRD v3.0 (April 2026)**. Scope: Singapore K2 → P6. Launch: June 2026 Beta.

## The Ask

Instead of parents uploading syllabi manually, access curriculum data directly from MOE Singapore with automated weekly updates. Parents pick from a dropdown; the app keeps content fresh on their behalf.

## The Solution

A fully automated pipeline that:

1. **Fetches** MOE P1–P6 syllabi weekly from official sources.
2. **Detects** changes via SHA-256 hashing.
3. **Parses** changed PDFs with Claude Sonnet (`claude-sonnet-4-6`) into structured `parsed_topics` JSON.
4. **Validates** output with zod before DB write.
5. **Notifies** parents via Telegram / SMS when a child's subject curriculum changes.

Primary curriculum is MOE P1–P6. K2 uses pre-built readiness tracks (English, Math, Chinese Foundations) — no syllabus ingestion needed. Secondary (Sec 1–4) is **out of scope** in v3.

## Scope (v3)

| Grade | Source | Method |
|-------|--------|--------|
| K2 | Pre-built readiness tracks | Parent selects track; no upload |
| P1–P6 | MOE Singapore PDFs | Weekly cron + Claude parsing |
| Parent-supplied files | Spelling lists, school calendars, assessment dates | Manual upload (.csv / .xlsx / .txt / .ics / .pdf) via Data Input feature |

Note: The Data Input feature (parent uploads) uses the **same Claude Sonnet parse path** for non-iCal PDFs, but is distinct from the automated MOE sync.

## Benefits

### For parents

- Dropdown selection at onboarding; no PDF upload for MOE content.
- Always current — automatically synced when MOE publishes updates.
- Auto-regeneration offered when a child's syllabus changes (one-tap confirm, delta preview).
- Companion upload flow for school-specific material (spelling lists, term calendars).

### For SchoolHub

- Frictionless onboarding (supports the < 3 min target).
- Curriculum database as a strategic asset.
- B2B narrative — always MOE-aligned.
- Defensible — ongoing integration effort competitors must match.

## How It Works (3 Steps)

### 1. Automated fetch (weekly cron)

```
GitHub Actions (Mon 02:00 SGT)
  → Fetch MOE P1–P6 PDFs
  → SHA-256 hash per PDF
  → Compare against curriculum_versions.source_hash
  → Queue changed PDFs into parse_queue
```

Cost: $0 (free GitHub tier).

### 2. Claude parsing (async queue)

```
parse_queue worker
  → Download PDF
  → Claude Sonnet vision → structured JSON
  → zod validation
  → Upsert into curriculum_versions.parsed_topics (JSONB)
  → Index for dropdown lookup
```

Per-syllabus parse: ~2 minutes, ~$0.30–$0.50. Target accuracy ≥ 90%, sampled ≥ 5% by curriculum reviewer.

### 3. Parent onboarding (< 3 min)

```
Parent creates child → picks grade P1–P6 →
  System loads pre-parsed curriculum instantly →
  Parent enters available hours/week + exam dates →
  Schedule generated (SEN- and calendar-aware) →
  Done.
```

For K2 children, parent selects readiness tracks instead and the countdown renders "P1 in N days".

## Data Sources

### Singapore MOE (v3 in-scope)

- Primary 1 → Primary 6 (all MOE subjects, including PSLE prep at P6).
- English, Math, Science, Chinese (Simplified), Mother Tongue options covered by MOE P1–P6 syllabi.

Sources:

- `www.moe.gov.sg/primary/curriculum/syllabus`
- PDF assets under `https://www.moe.gov.sg/-/media/files/primary/...`
- `data.gov.sg` API (metadata)

### Out of scope for v3

- Secondary (Sec 1–4) — removed from v3.
- O / N-Levels — removed from v3.
- International curricula (IB, Cambridge IGCSE, GCE A-Levels) — deferred to Phase 2 post-June 2026 launch.

## Technical Architecture (High Level)

```
┌─────────────────────────────────────┐
│  MOE P1–P6 PDFs (www.moe.gov.sg)    │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│  GitHub Actions Scheduler (Weekly)  │
│  - Fetch P1–P6 PDFs                 │
│  - SHA-256 change detection         │
│  - Enqueue into parse_queue         │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│  Claude Sonnet (claude-sonnet-4-6)  │
│  - Vision parse → structured JSON   │
│  - zod validation                   │
│  - Retry on schema failure          │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│  Supabase (PostgreSQL)              │
│  - curriculum_versions.parsed_topics│
│  - parse_queue (retries, status)    │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│  Parent onboarding                  │
│  - P1–P6 dropdown → instant load    │
│  - K2 → readiness track picker      │
│  - Schedule regen offered on change │
└─────────────────────────────────────┘
```

See `SchoolHub_Curriculum_Sync_Technical_Guide.md` for implementation code, environment setup, and error-handling patterns.

## Why Claude Sonnet

Curriculum parsing is not generic document extraction. SchoolHub needs:

1. **Vision quality** — MOE PDFs contain tables, diagrams, and math notation.
2. **Semantic understanding** — topic prerequisites (e.g. "multiplication before division").
3. **Hierarchical reasoning** — syllabus structure (topics → sub-topics → learning objectives).
4. **Consistency** — identical output schema across ~24 MOE P1–P6 PDFs.

Claude Sonnet (`claude-sonnet-4-6`) meets all four at materially lower cost per parse than Opus-class alternatives, which matters because MOE syllabus updates occur sporadically and sync cost must stay near zero.

## Change Propagation

When a new `curriculum_versions` row is written, a notifier:

1. Identifies affected children (grade + subject match).
2. Sends parent a Telegram / SMS note:
   > "Chen Li's P4 Science syllabus was updated. Tap to review new topics and regenerate schedule."
3. Links to a one-tap regeneration flow with delta preview. ASD-profile children receive the change on a 48-hour delay to preserve routine predictability.

## Implementation Plan

### Sprint 1 (week 1) — foundations

- GitHub Actions cron + Supabase setup.
- `curriculum_versions` + `parse_queue` migrations (already in v3 schema).
- Fetch 5 seed P1–P6 syllabi; SHA-256 diffing.

### Sprint 2 (week 2) — parsing

- Claude Sonnet parse pipeline + zod schema.
- Retry with truncated prompt on schema failure.
- Sample ≥ 5% of parses for manual accuracy review.

### Sprint 3 (week 3) — parent flow

- Dropdown curriculum picker in onboarding.
- Change-notification parent message template.
- One-tap schedule regeneration with delta preview (SEN-aware).

### Sprint 4 (week 4) — operations

- Monitoring dashboard (parse success rate, last-fetch timestamp).
- Alert if parse success < 90% over rolling 7 days.
- Backfill all 24 MOE P1–P6 PDFs.

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| MOE URL format change | Low | Heartbeat check + email alert |
| PDF structure drift | Medium | Quarterly sampling; fallback to prior version |
| Claude schema failures | Low | zod + retry; deterministic scheduler fallback |
| Syllabus release lag | Medium | Fall back to most-recent valid version |
| GitHub Actions quota | Very Low | ~10 min/week usage |

## Success Metrics

- Curriculum sync uptime: ≥ 99.5%.
- Parse success: ≥ 90% accuracy, sampled ≥ 5%.
- Parse-to-availability: < 24 h after MOE publication.
- Parent onboarding: < 3 min from account creation to first schedule.
- Parent satisfaction: "easiest setup I've done" in beta qualitative.

## Related Files

- `SchoolHub_Curriculum_Sync_Technical_Guide.md` — implementation guide with code.
- `../02_Core_Documentation/SchoolHub_API_Reference.md` — curriculum + parse_queue endpoints and schema.
- `../02_Core_Documentation/SchoolHub_PRD_v3.md` — authoritative product requirements.
- `../05_Features/SchoolHub_Parent_Notifications_Implementation.md` — change-notification delivery.

## Next Steps

1. Confirm the 24 MOE P1–P6 PDF URLs to seed.
2. Build the parse pipeline (Sprint 1 + 2 above).
3. Integrate the dropdown into the onboarding wizard.
4. Backfill all P1–P6 subjects and validate accuracy on a 5% sample.
5. Wire change notifications into the existing Telegram + Twilio channels.

This pipeline transforms SchoolHub onboarding from manual PDF upload to a MOE-aligned dropdown — contributing materially to the < 3 min onboarding target and the 8–12% trial-to-paid conversion goal.
