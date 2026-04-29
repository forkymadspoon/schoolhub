---
name: schoolhub-ai-curriculum-expert
description: Design and implement SchoolHub's AI pipeline using Claude Sonnet — curriculum parsing, schedule generation (SEN- and calendar-aware), bite generation (grade-band + SEN-calibrated), weak-topic explanations, and file-upload parsing. Aligned to PRD v3.0. Scope K2 → P6 Singapore MOE.
---

# SchoolHub AI & Curriculum Expert

Five Claude Sonnet use cases, aligned to **PRD v3.0 (April 2026)**. Scope: Singapore K2 → P6. Model: `claude-sonnet-4-6`.

## Use Case Map

| # | Use case | Input | Output | Latency profile |
|---|----------|-------|--------|-----------------|
| 1 | Curriculum parsing | MOE syllabus PDF | `parsed_topics: JSONB` | Batch (cron), not user-facing |
| 2 | Upload parsing | Non-iCal PDFs (school calendars, assessment date sheets) | Normalised payload | Per-upload, async with polling |
| 3 | Schedule generation | Topics + exam dates + school calendar + weekly hours + grade_band + sen_profile | `schedule_json: JSONB` | Onboarding + every regen |
| 4 | Bite generation | Topic + grade_band + sen_profile + duration cap | `content_json: JSONB` | Cached per (topic, band, variant) |
| 5 | Weak-topic explanation + adaptive feedback | Failure history + band + sen_profile | WHY string + recommended bite id | Per flag |

All outputs validated with `zod` schemas before being written to the database. Never expose raw Claude output to the client.

## 1. Curriculum Parsing

Accepts P1–P6 MOE syllabus PDFs. K2 uses pre-built readiness tracks — never parsed.

```typescript
export async function parseCurriculum(pdfBase64: string, level: Level, subject: Subject) {
  const r = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
        { type: 'text', text: curriculumPrompt(level, subject) },
      ],
    }],
  });
  return ParsedTopicsSchema.parse(JSON.parse(firstText(r)));
}
```

Prompt contract:

```
Extract MOE {subject} {level} curriculum as strict JSON.

Required fields per topic:
  id, sequence, name, chapter_numbers[], learning_objectives[],
  estimated_hours, exam_weight_percentage, prerequisites[],
  key_concepts[], content_strands[], difficulty_level (1-5)

Required metadata:
  curriculum_type ("MOE"), level, subject, academic_year,
  total_hours, common_exam_window

Rules:
- Cover all chapters in the syllabus.
- Weight percentages sum to 100 ± 5.
- Prerequisites refer only to ids within this curriculum.
- If hours not in PDF, estimate based on chapter depth; flag with "estimated": true.
- Output strict JSON. No prose. No trailing commentary.
```

Accuracy target per PRD: ≥ 90%. Retry policy: 3× with exponential backoff. On persistent failure, row stays in `parse_queue` with `status='failed'` and triggers admin alert.

## 2. File Upload Parsing (Non-iCal)

For `school_calendar` and `assessment_dates` uploaded as PDFs. .ics is handled by the native iCal parser in `packages/parsers`. .csv/.xlsx/.txt parsed natively.

```typescript
export async function parseUpload(pdfBase64: string, fileType: FileType, childId: string) {
  const r = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
        { type: 'text', text: uploadPrompt(fileType) },
      ],
    }],
  });
  return UploadPayloadSchema[fileType].parse(JSON.parse(firstText(r)));
}
```

Prompt fragments:

```
school_calendar:
  Return JSON { "term_dates": [{ "term": 1, "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }],
                "holidays":   [{ "name": "...", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }] }
  Extract Singapore-localised dates (+08:00). If ambiguous, flag "confidence": "low".

assessment_dates:
  Return JSON { "assessments": [{ "name": "SA1", "subject": "Mathematics",
                                  "date": "YYYY-MM-DD", "type": "SA1|SA2|CA|PSLE|Mock|Other" }] }
  Ignore past events relative to today.
```

Low-confidence fields render in the UI for inline manual correction.

## 3. Schedule Generation

SEN profile and school calendar are first-class inputs — not post-processing.

```typescript
export async function generateSchedule(p: ScheduleInput): Promise<ScheduleOutput> {
  const system = [
    `You are SchoolHub's planner. Output strict JSON only.`,
    `Grade band: ${p.grade_band}.`,
    p.sen_profile ? `SEN profile: ${p.sen_profile} — apply pacing rules below.` : '',
    p.grade_band === 'K2' ? 'K2 readiness mode: max 5-min bites, P1 intake countdown.' : '',
  ].filter(Boolean).join('\n');

  const r = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    system,
    max_tokens: 6000,
    messages: [{ role: 'user', content: renderSchedulePrompt(p) }],
  });
  return ScheduleSchema.parse(JSON.parse(firstText(r)));
}
```

Prompt rules embedded in `renderSchedulePrompt`:

```
Principles:
 1 Spacing effect: revisit each topic at Day+1, +3, +7, +14, +30 (cap at exam date).
 2 Prerequisite order: never schedule a topic before its prerequisites.
 3 Progressive complexity within a week.
 4 Buffer: ≥ 2 weeks before each exam for review-only bites.
 5 Respect school holidays (from school_calendar) — no bites on those days.
 6 Even load across weeks, ± 20%.

SEN adaptations:
 - ADHD → bite duration ≤ 5 min; 10% more micro-breaks; schedule 10% fewer bites/day.
 - Autism_Spectrum → no week-over-week structure changes; consistent daily slot.
 - Other_SEN → 15% extra scaffold bites before new topics.

Inputs:
  topics[], exam_dates[], school_calendar{}, weekly_hours_per_subject{},
  grade_band, sen_profile (nullable)

Output JSON schema:
{
  "weeks": [
    {
      "week_number", "date_range",
      "bites": [
        { "topic_id", "subject", "duration_min", "intensity": "low|med|high",
          "is_review": bool, "date" }
      ],
      "total_minutes", "holiday_days", "notes"
    }
  ],
  "buffer_weeks",
  "hash"   // stable content hash; server recomputes and validates
}
```

Delta preview is server-computed by diffing new vs most recent confirmed schedule; not requested from Claude.

## 4. Bite Generation

Grade-band + SEN + duration cap drive tone and length.

```typescript
export async function generateBite(topic: Topic, band: GradeBand, sen: SENProfile): Promise<BiteContent> {
  const cap = sen === 'ADHD' ? 5 : (band === 'K2' ? 5 : 10);
  const tone = tonePreset(band, sen);

  const r = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: tone,
    messages: [{ role: 'user', content: bitePrompt(topic, band, sen, cap) }],
  });
  return BiteContentSchema.parse(JSON.parse(firstText(r)));
}
```

Tone presets:

```
K2:                      Flesch-Kincaid ≤ 2. Image-first. Audio (TTS) friendly.
Lower_Primary (P1–P3):   FK ≤ 3. Short sentences. Pinyin on Chinese content.
Upper_Primary (P4–P6):   FK ≤ 6. Scaffolded open-ended questions allowed.
+ ADHD:                  Single learning objective per bite. Active voice. Max 1 diagram.
+ Autism_Spectrum:       Consistent bite structure header. Explicit "what happens next" line.
+ Other_SEN:             Pre-teach each key term before first use.
```

Bite JSON contract:

```
{
  "title", "learning_objective",
  "text",                 // ≤ 200 words (K2/LP), ≤ 350 (UP)
  "key_terms": [ { "term", "definition" } ],
  "diagram": { "kind": "svg-hint|image-ref", "description" },
  "practice": { "type": "drag|tap|select|short_answer", "prompt", "solution" },
  "quiz": [
    { "question", "options": [4], "correct_index", "explanation" }
  ],
  "duration_min",         // ≤ cap
  "difficulty": 1..5,
  "prerequisites": [ "bite_id" ]
}
```

Caching key: `sha256(topic_id + band + sen_profile + prompt_version)`.

## 5. Weak Topic Explanation

Input: recent bite failures + grade_band + SEN. Output: plain-language WHY + recommended remedial bite id.

```typescript
export async function explainWeakTopic(ctx: WeakTopicCtx): Promise<{ why: string; remedy_bite_id: string }> {
  const r = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: tonePreset(ctx.grade_band, ctx.sen_profile),
    messages: [{ role: 'user', content: weakTopicPrompt(ctx) }],
  });
  return WeakTopicOutputSchema.parse(JSON.parse(firstText(r)));
}
```

Prompt:

```
The student has failed these bites for topic {topic}:
  {failed_bites_with_answers}

Known prerequisites of this topic: {prereqs}
Existing remedial bites in the pool: {candidate_remedies}

Return JSON { "why": "...", "remedy_bite_id": "..." }

Writing rules:
- Address the parent (not the student).
- ≤ 2 sentences for "why".
- Use concrete concept names, not labels like "weak topic".
- Pick the remedy that best matches the observed misconception.
- No clinical language.
```

## Prompt Versioning

Every prompt carries `prompt_version` tagged in `packages/ai/src/prompts/`. Database rows include the version used. Changes go through PR with regression tests against a frozen set of sample syllabi and child profiles.

## Validation & Guardrails

```typescript
// Every Claude call goes through this pipeline
async function callClaude<T>(opts: CallOpts, schema: ZodSchema<T>): Promise<T> {
  const raw = await withRetry(() => claude.messages.create(opts));
  const text = firstText(raw);
  const json = safeJsonParse(text);             // JSON5-tolerant; logs bad output
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    await logPromptFailure({ raw, issues: parsed.error.issues });
    throw new AIOutputValidationError(parsed.error);
  }
  return parsed.data;
}
```

- Schema validation: `zod` for every output — fail closed.
- JSON tolerance: repair trailing commas, stripped code fences.
- Prompt-injection defence: raw user uploads are never interpolated into prompts as plain text. PDFs go through `type: "document"`; CSV/TXT content is pre-parsed structurally before any Claude call.
- PII minimisation: child names are replaced with a placeholder (`CHILD`) in AI prompts wherever possible.

## Spaced-Repetition Sub-Algorithm

Applied inside schedule generation (and on every regen). Default sequence per topic:

```
Day 0  new  bite
Day 1  review (cap duration to 50%)
Day 3  review
Day 7  review
Day 14 review
Day 30 review
```

Reviews beyond the earliest exam for that subject are dropped. ADHD: +1 early review at Day 2. Autism: same schedule every week of the cycle.

## Mental-Health Signals (rule engine, not AI)

The guardrail engine is deterministic — Claude is **not** used to classify wellbeing. Signal definitions (PRD §7.3):

```
overload_risk        study_hours_week > 2 × weekly_default
burnout_risk         streak_drop_consecutive_days ≥ 3
comprehension_plateau same_topic_failed_bites ≥ 3
activity_imbalance   consecutive_study_days ≥ 7 and break_logged_days = 0
exam_anxiety         days_to_nearest_exam ≤ 14 and week_completion_rate drop ≥ 0.2
```

SEN-adjusted thresholds: ADHD lowers `burnout_risk` threshold to 2 consecutive-day drops; Autism raises `activity_imbalance` to 10 days.

## Progress Metrics & Weak-Topic Detection

```typescript
async function detectWeakTopics(childId: string) {
  const bites = await getRecentCompletedBites(childId, { windowDays: 14 });
  const byTopic = groupBy(bites, 'topic_id');
  const weak: WeakTopicFlag[] = [];
  for (const [topicId, list] of Object.entries(byTopic)) {
    const moods = list.map((b) => b.mood);
    const rate = moods.filter((m) => m === 'struggling').length / moods.length;
    const quizAvg = avg(list.map((b) => b.quiz_score));
    if (rate > 0.4 || quizAvg < 0.5) {
      weak.push({ topic_id: topicId, struggle_rate: rate, quiz_avg: quizAvg });
    }
  }
  return weak;
}
```

## Schedule Validation

```typescript
function validateSchedule(s: ScheduleOutput, inputs: ScheduleInput): string[] {
  const errs: string[] = [];
  const totalMin = s.weeks.flatMap(w => w.bites).reduce((n, b) => n + b.duration_min, 0);
  if (s.buffer_weeks < 2) errs.push('Insufficient buffer (< 2 weeks).');

  const holidays = inputs.school_calendar.holidays.flatMap(expandDates);
  const onHoliday = s.weeks.flatMap(w => w.bites).some(b => holidays.includes(b.date));
  if (onHoliday) errs.push('Schedule places a bite on a school holiday.');

  if (inputs.sen_profile === 'ADHD') {
    const over = s.weeks.flatMap(w => w.bites).some(b => b.duration_min > 5);
    if (over) errs.push('ADHD profile: bite > 5 min.');
  }
  // Prerequisite check…
  return errs;
}
```

Failing schedules are re-prompted once with the error list attached; if still failing, fall back to a deterministic scheduler (no AI).

## Testing

```typescript
describe('curriculum parse', () => {
  it('produces topics that sum to ~100% weighting', async () => {
    const parsed = await parseCurriculum(pdfB64, 'P5', 'Mathematics');
    const sum = parsed.topics.reduce((n, t) => n + t.exam_weight_percentage, 0);
    expect(sum).toBeGreaterThanOrEqual(95);
    expect(sum).toBeLessThanOrEqual(105);
  });
});

describe('schedule generation', () => {
  it('caps ADHD bite duration at 5 min', async () => {
    const s = await generateSchedule({ ...fixture, sen_profile: 'ADHD' });
    expect(Math.max(...s.weeks.flatMap(w => w.bites).map(b => b.duration_min))).toBeLessThanOrEqual(5);
  });

  it('does not schedule on school holidays', async () => {
    const s = await generateSchedule(fixture);
    const holidays = fixture.school_calendar.holidays.flatMap(expandDates);
    const offenders = s.weeks.flatMap(w => w.bites).filter(b => holidays.includes(b.date));
    expect(offenders).toHaveLength(0);
  });
});
```

## Budgets (per PRD v3)

```
Curriculum parsing      ~100 calls/day    ≈ $15–20/month
Upload parsing          per upload        ≈ $0.05/call
Schedule generation     per regen         ≈ $0.01/call
Bite generation         cached            ≈ $0.01/call
Weak-topic explanation  per flag          ≈ $0.005/call
```

## References

- `02_Core_Documentation/SchoolHub_PRD_v3.md` — authoritative
- `02_Core_Documentation/SchoolHub_API_Reference.md` — endpoints + schema
- `04_Curriculum_Sync/SchoolHub_Curriculum_Sync_Technical_Guide.md` — MOE ingestion cron
- `03_Skills_Framework/schoolhub-fullstack-dev-skill.md` — integration points
