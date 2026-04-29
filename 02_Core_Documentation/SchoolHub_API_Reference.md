# SchoolHub API & Data Reference

*Aligned to PRD v3.0 · April 2026 · Scope K2 → P6*

---

## 1. Scope & Conventions

- All endpoints are JSON over HTTPS. Auth via `Authorization: Bearer {supabase_jwt}` unless marked *Internal*.
- Scope is Singapore K2 → P6. No Secondary endpoints. Levels accepted: `K2`, `P1`, `P2`, `P3`, `P4`, `P5`, `P6`.
- Grade bands (UI variant): `K2`, `Lower_Primary` (P1–P3), `Upper_Primary` (P4–P6).
- SEN profile (optional per child): `ADHD`, `Autism_Spectrum`, `Other_SEN`, `null`.
- All JSONB payloads are schema-validated server-side before writing.

---

## 2. Curriculum Selection

### 2.1 GET /api/curricula

List curricula available for parent selection.

```http
GET /api/curricula?level=P4&subject=mathematics
```

Response:

```json
{
  "success": true,
  "curricula": [
    {
      "id": "curr_moe_p4_math_2026",
      "curriculum_type": "MOE",
      "country": "Singapore",
      "level": "P4",
      "subject": "Mathematics",
      "version": "2026",
      "release_date": "2026-01-05",
      "topics_count": 10,
      "recommended_study_hours": 80,
      "parsed": true,
      "is_latest": true
    }
  ],
  "filters": {
    "available_levels": ["K2", "P1", "P2", "P3", "P4", "P5", "P6"],
    "available_subjects": [
      "English", "Mathematics", "Science", "Chinese",
      "Malay", "Tamil", "Social_Studies"
    ]
  }
}
```

K2 has no MOE syllabus — use pre-built readiness tracks (section 3.1) instead.

### 2.2 GET /api/curricula/{id}

Full curriculum detail with `parsed_topics` (topics, objectives, hours, prerequisites, key concepts, exam weighting).

### 2.3 POST /api/study-plans/{childId}/set-curriculum

Selects a curriculum and triggers schedule generation.

Body:

```json
{
  "curriculum_id": "curr_moe_p4_math_2026",
  "exam_date": "2026-10-12",
  "weekly_hours": 4,
  "school_calendar_upload_id": "upl_cal_789",
  "assessment_dates_upload_id": "upl_dates_790"
}
```

Response returns `study_plan.schedule_json` (weekly plan with spaced repetition and buffer weeks) and `trigger_reason: "initial"`.

---

## 3. K2 Readiness

### 3.1 GET /api/k2/readiness-tracks

Returns the three pre-built readiness tracks. No syllabus upload required.

```json
{
  "tracks": [
    { "id": "k2_english",  "name": "English Foundations",  "bites": 40 },
    { "id": "k2_math",     "name": "Math Foundations",     "bites": 35 },
    { "id": "k2_chinese",  "name": "Chinese Foundations",  "bites": 30 }
  ]
}
```

### 3.2 POST /api/children/{childId}/readiness

Body: `{ "tracks": ["k2_english", "k2_math"], "p1_intake_date": "2027-01-04" }`.
Generates a K2 schedule and sets countdown to *"P1 in X days"*.

---

## 4. Data Input — File Upload & Manual Entry

### 4.1 POST /api/uploads

Multipart upload. Accepted types:

| `file_type` | Extensions | Parser |
|-------------|------------|--------|
| `spelling_list` | .csv .txt .xlsx | Native |
| `assessment_dates` | .ics .pdf | ical / Claude Sonnet (PDF) |
| `school_calendar` | .ics .pdf | ical / Claude Sonnet (PDF) |
| `moe_syllabus` | .pdf | Claude Sonnet vision |

Response:

```json
{
  "upload_id": "upl_abc123",
  "status": "queued",
  "file_type": "school_calendar"
}
```

### 4.2 GET /api/uploads/{id}

Returns `status` (`queued` → `parsing` → `parsed` | `failed`) and `parsed_payload`. Failed parses include `errors[]` and `manual_correction_url`.

### 4.3 POST /api/uploads/{id}/correct

Parent submits manual corrections inline for fields the parser could not resolve. All imported fields remain editable after ingest.

### 4.4 POST /api/children/{childId}/spelling-lists

Accepts either `upload_id` or inline `words[]`. Generates weekly spelling bites.

### 4.5 Common SG Exam Dates

`GET /api/reference/sg-exam-dates` returns pre-filled dates (PSLE, SA1, SA2, CA, mid-year) by year so parents can one-tap-pick common dates without manual entry.

---

## 5. Children & Profiles

### 5.1 POST /api/children

```json
{
  "name": "Aiden",
  "grade_level": "P4",
  "grade_band": "Upper_Primary",
  "sen_profile": null,
  "gamification_enabled": true,
  "p1_intake_date": null
}
```

### 5.2 PATCH /api/children/{id}/sen-profile

Body: `{ "sen_profile": "ADHD" | "Autism_Spectrum" | "Other_SEN" | null }`.

Side effects applied server-side:

- `ADHD` → bite duration hard-capped at 5 min; focus mode enabled; leaderboard hidden.
- `Autism_Spectrum` → schedule changes queued with 48-hour advance-notice alert; animated transitions disabled; leaderboard hidden.
- `Other_SEN` → adaptive difficulty on; scaffolded hints on; extended response time.

Response includes `regeneration_required: true` if existing schedule must be regenerated.

### 5.3 Grade-Band Auto-Promotion

Internal cron (January 1st) promotes P1–P5 children to next grade level and recomputes `grade_band`. Parent can override via `PATCH /api/children/{id}` with `grade_level`.

---

## 6. Schedules

### 6.1 POST /api/schedules/{childId}/regenerate

Triggers:

- `manual` (parent tap)
- `low_completion` (< 60% weekly bites completed)
- `exam_date_change`
- `school_calendar_change`
- `sen_profile_change`

Response returns a **delta preview** with a plain-language reason:

```json
{
  "preview": {
    "reason_text": "Aiden completed 45% of bites this week, so we've lightened next week's load.",
    "added_bites": 12,
    "removed_bites": 4,
    "shifted_bites": 18,
    "old_schedule_hash": "…",
    "new_schedule_hash": "…",
    "weeks_changed": [3, 4, 5, 6]
  },
  "activation": {
    "mode": "immediate",
    "activates_at": "2026-04-24T10:00:00+08:00"
  }
}
```

For children with `sen_profile = Autism_Spectrum`, `activation.mode = "delayed_48h"` and `activates_at` is set 48 hours out.

### 6.2 POST /api/schedules/{childId}/confirm

Body: `{ "new_schedule_hash": "…" }` — commits the previewed schedule.

### 6.3 GET /api/schedules/{childId}/history

Returns all regenerations with trigger reason, delta, and parent confirmation timestamps.

---

## 7. Sibling Timeline Dashboard

### 7.1 GET /api/households/{parentId}/timeline?week=2026-W18

Returns per-child lanes:

```json
{
  "week": "2026-W18",
  "children": [
    {
      "child_id": "c_1",
      "name": "Aiden",
      "grade_level": "P4",
      "daily": [ { "date": "2026-05-04", "bites": 3, "minutes": 30 } ]
    }
  ],
  "conflicts": [
    {
      "date": "2026-05-06",
      "type": "overlapping_high_intensity",
      "children": ["c_1", "c_2"],
      "suggestion": "Shift Aiden's science bite to 2026-05-07."
    }
  ],
  "load_balance_suggestions": []
}
```

### 7.2 POST /api/households/{parentId}/timeline/apply

Apply a suggested redistribution in one tap.

---

## 8. Bites & Gamification

### 8.1 GET /api/bites/{childId}/today

Returns today's assigned bites for the child (respects SEN caps).

### 8.2 POST /api/bites/{biteId}/complete

Body: `{ "answers": [...], "duration_sec": 285 }`.
Awards XP synchronously and emits WebSocket event `xp.awarded` within 2 s.

### 8.3 WebSocket: `ws /realtime/children/{childId}`

Events: `xp.awarded`, `badge.unlocked`, `streak.updated`, `wellbeing.signal`.

### 8.4 GET /api/children/{id}/gamification

Returns `streak`, `xp_total`, `badges[]`, `leaderboard_opt_in`.

### 8.5 PATCH /api/children/{id}/gamification

`{ "enabled": false }` — parent kill-switch. Auto-set to `paused` by mental-health guardrail on burnout signal.

---

## 9. Mental Health Guardrails

### 9.1 GET /api/children/{id}/wellbeing

```json
{
  "status": "amber",
  "signals": [
    {
      "id": "sig_1",
      "signal_type": "burnout_risk",
      "triggered_at": "2026-04-22T09:00:00+08:00",
      "recommended_action": "Pause gamification pressure. Suggest 2-day break.",
      "resolved_at": null
    }
  ]
}
```

Signal types: `overload_risk`, `burnout_risk`, `comprehension_plateau`, `activity_imbalance`, `exam_anxiety`.

### 9.2 POST /api/children/{id}/wellbeing/{signalId}/ack

Parent acknowledges a signal and may accept, modify, or dismiss the recommendation. All recommendations are suggestions; parent always has final override.

### 9.3 GET /api/children/{id}/holistic-prompts

Weekly non-academic activity suggestions (outdoor, creative, family). Read-only — SchoolHub never schedules non-academic time.

*Gated to Scholar Pro for the parent-facing dashboard view. Signal engine runs for all tiers but surfaces only via notifications on Scholar.*

---

## 10. Notifications

### 10.1 POST /api/notifications/config

```json
{
  "channel": "telegram",
  "mode": "weekly_digest",
  "fallback_sms": true
}
```

Modes: `weekly_digest`, `daily_progress`, `realtime`. Parent receives **one consolidated notification** covering all children.

### 10.2 POST /api/notifications/telegram/link

OAuth-free link via `/start` command with parent token. Twilio SMS is fallback if Telegram delivery fails.

---

## 11. Shareable Progress Report

### 11.1 POST /api/reports/{childId}/weekly-card

Generates 1080×1350px WhatsApp card + PDF. Scheduled cron runs every Sunday 22:00 SGT.

Response:

```json
{
  "image_url": "...png",
  "pdf_url": "...pdf",
  "expires_at": "2026-05-30T00:00:00+08:00",
  "wellbeing_status": "green"
}
```

Card contents: subjects studied, bites completed, streak, badges, exam countdown, wellbeing traffic-light status, watermark + app link.

---

## 12. Exam Countdown

### 12.1 GET /api/children/{id}/countdown

```json
{
  "items": [
    { "label": "PSLE", "date": "2026-10-12", "days_remaining": 171, "colour": "green" },
    { "label": "SA1",  "date": "2026-05-15", "days_remaining": 21,  "colour": "red"   }
  ]
}
```

K2 children: label becomes `"P1"` with `days_remaining` to the stored `p1_intake_date`.

---

## 13. Internal APIs

### 13.1 POST /api/internal/curriculum/fetch

Manually trigger MOE fetch. Body: `{ "sources": [...], "force_reparse": false }`.

### 13.2 GET /api/internal/curriculum/status

Returns fetch health, parse queue sizes, storage, alerts.

### 13.3 POST /api/internal/curriculum/notify-update

Notify parents of syllabus version changes affecting their child's subjects.

### 13.4 POST /api/internal/wellbeing/evaluate

Cron (hourly). Re-evaluates all active children against guardrail rules and writes new rows into `wellbeing_signals`.

All internal endpoints require `Authorization: Bearer {internal_api_key}` + `X-Admin-Token`.

---

## 14. Database Schema (Core Tables)

```sql
-- children
id UUID PK
parent_id UUID FK→users
name TEXT
grade_level TEXT CHECK IN ('K2','P1','P2','P3','P4','P5','P6')
grade_band TEXT CHECK IN ('K2','Lower_Primary','Upper_Primary')
sen_profile TEXT CHECK IN ('ADHD','Autism_Spectrum','Other_SEN') NULL
gamification_enabled BOOLEAN DEFAULT TRUE
p1_intake_date DATE NULL
created_at TIMESTAMPTZ

-- curriculum_versions
id UUID PK
curriculum_type TEXT  -- MOE, custom
level TEXT
subject TEXT
version TEXT
source_hash TEXT      -- SHA-256 of source PDF
parsed_topics JSONB
status TEXT           -- queued, parsing, parsed, failed
release_date DATE

-- study_schedules
id UUID PK
child_id UUID FK
schedule_json JSONB
generated_at TIMESTAMPTZ
trigger_reason TEXT   -- initial, manual, low_completion, exam_change, calendar_change, sen_change
schedule_hash TEXT
activates_at TIMESTAMPTZ
confirmed_by_parent BOOLEAN

-- bites
id UUID PK
topic_id UUID FK
content_json JSONB
duration_min INT
grade_band TEXT
sen_variant TEXT NULL

-- xp_events
id UUID PK
child_id UUID FK
event_type TEXT       -- bite_complete, correct_answer, streak_milestone, ahead_of_schedule
xp_delta INT
created_at TIMESTAMPTZ

-- badges
id UUID PK
child_id UUID FK
subject TEXT
tier TEXT             -- bronze, silver, gold
unlocked_at TIMESTAMPTZ

-- uploads
id UUID PK
parent_id UUID FK
child_id UUID FK NULL
file_type TEXT        -- spelling_list, assessment_dates, school_calendar, moe_syllabus
original_filename TEXT
storage_path TEXT
status TEXT           -- queued, parsing, parsed, failed
parsed_payload JSONB
error_json JSONB
created_at TIMESTAMPTZ

-- wellbeing_signals
id UUID PK
child_id UUID FK
signal_type TEXT
triggered_at TIMESTAMPTZ
resolved_at TIMESTAMPTZ NULL
recommended_action TEXT
acknowledged_by UUID FK→users NULL
acknowledgement TEXT  -- accepted, modified, dismissed

-- parse_queue
id UUID PK
source_type TEXT      -- curriculum | upload
source_id UUID
status TEXT
retries INT
last_error TEXT
```

---

## 15. Database Query Patterns

### 15.1 Latest curriculum by (level, subject)

```sql
SELECT id, version, release_date, parsed_topics
FROM curriculum_versions
WHERE curriculum_type='MOE' AND level=$1 AND subject=$2 AND status='parsed'
ORDER BY release_date DESC LIMIT 1;
```

### 15.2 Weekly completion rate for regeneration trigger

```sql
SELECT child_id,
       COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::float / COUNT(*) AS rate
FROM schedule_bites
WHERE week_start = date_trunc('week', now())
GROUP BY child_id
HAVING rate < 0.6;
```

### 15.3 Active wellbeing signals for parent dashboard

```sql
SELECT * FROM wellbeing_signals
WHERE child_id = ANY($1::uuid[])
  AND resolved_at IS NULL
ORDER BY triggered_at DESC;
```

### 15.4 Sibling conflict detection

```sql
SELECT date, array_agg(child_id) AS children
FROM scheduled_bites sb
JOIN children c ON c.id = sb.child_id
WHERE c.parent_id = $1
  AND intensity = 'high'
  AND date BETWEEN $2 AND $3
GROUP BY date
HAVING COUNT(DISTINCT child_id) > 1;
```

---

## 16. Error Handling

### 16.1 Upload parse failure

```json
{
  "error": "parse_failed",
  "upload_id": "upl_abc123",
  "file_type": "school_calendar",
  "reason": "Unreadable PDF",
  "manual_correction_url": "/parents/uploads/upl_abc123/fix"
}
```

### 16.2 Curriculum not found

```json
{
  "error": "curriculum_not_found",
  "requested": { "level": "Sec_2", "subject": "Mathematics" },
  "message": "Out of scope. SchoolHub MVP supports K2 → P6 only.",
  "alternatives": [
    { "level": "P6", "subject": "Mathematics" }
  ]
}
```

### 16.3 SEN change requires confirm

```json
{
  "error": "regeneration_required",
  "sen_profile": "ADHD",
  "next_step": "POST /api/schedules/{childId}/regenerate?trigger=sen_profile_change"
}
```

---

## 17. Rate Limits & Quotas

```
Parent-facing:
  GET  /api/curricula              100 req/min per user
  GET  /api/curricula/{id}         100 req/min per user
  POST /api/study-plans/*          10  req/min per user
  POST /api/uploads                20  req/min per user (50 MB / file)
  POST /api/schedules/*/regenerate 5   req/hour per child
  POST /api/bites/{id}/complete    60  req/min per child
  GET  /api/children/{id}/wellbeing 30 req/min per user

Internal:
  POST /api/internal/curriculum/fetch            1 per day
  GET  /api/internal/curriculum/status           10 req/min
  POST /api/internal/wellbeing/evaluate          cron only (hourly)

Claude Sonnet budget:
  Curriculum parsing       ~100 calls/day          (~$15–20/month)
  Schedule generation      per child per regen     (~$0.01/call)
  Bite generation          cached per topic+band   (~$0.01/call)
  Weak-topic explanation   per flag                (~$0.005/call)
  Upload parsing (PDF)     per upload              (~$0.05/call)
```

---

## 18. Data Freshness

| Source | Check | Freshness SLA |
|--------|-------|---------------|
| MOE K2 readiness (static) | Annual review | — |
| MOE P1–P6 syllabi | Weekly cron Mon 02:00 SGT | < 7 days |
| SG common exam dates | Annual Jan refresh | < 30 days |

---

## 19. Monitoring & Alerts

Metrics to track:

- `curriculum_parse_latency` histogram
- `upload_parse_success_rate` gauge (alert < 0.9)
- `schedule_regen_latency` histogram (alert p95 > 10 s)
- `xp_award_latency` histogram (alert p95 > 2 s)
- `wellbeing_signals_open` gauge per parent
- `sibling_conflicts_detected` counter

Alerts:

- Parse queue > 10 jobs for > 2 h → page on-call
- Upload parse failure rate > 10% for 1 h → Slack
- XP award p95 > 2 s for 10 min → page on-call
- Wellbeing engine cron miss → email admin

---

**END OF API REFERENCE**

See also: `SchoolHub_PRD_v3.md` · `04_Curriculum_Sync/` · `03_Skills_Framework/schoolhub-fullstack-dev-skill.md`.
