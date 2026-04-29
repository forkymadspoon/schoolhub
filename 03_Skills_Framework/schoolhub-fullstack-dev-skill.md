---
name: schoolhub-fullstack-dev
description: Build SchoolHub's full-stack web application (React + Node.js + Supabase + Claude Sonnet). Aligned to PRD v3.0 — scope K2 → P6, SEN support, mental-health guardrails, sibling dashboard, file upload ingestion. Use when developing parent dashboards, student bite interfaces, API endpoints, curriculum parsing, adaptive scheduling, notification systems, SEN overlays, or any SchoolHub MVP feature.
---

# SchoolHub Full-Stack Development

Build guide aligned to **PRD v3.0 (April 2026)**. Scope: Singapore K2 → P6. Web-only responsive PWA. Launch: June 2026 Beta.

## Tech Stack

```
Frontend:   React 18 + TypeScript + Tailwind CSS + Shadcn/ui (PWA, Workbox)
Backend:    Node.js + Express + TypeScript
Database:   Supabase (PostgreSQL + Auth)
AI:         Claude Sonnet API (curriculum parse, schedule gen, bite gen, weak-topic, upload parse)
Ingestion:  csv / xlsx / txt / ics / pdf parsers in packages/parsers
Messaging:  Telegram Bot API (primary) + Twilio SMS (fallback)
Reports:    canvas / Puppeteer (1080×1350px WhatsApp cards + PDF)
Hosting:    Vercel (frontend) · Railway (backend) · Supabase (DB)
```

## Monorepo Layout

```
schoolhub/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── ui/           # shadcn base + TierCard / TierFeedback / TierProgress + SENOverlay
│   ├── types/        # Shared TypeScript interfaces
│   ├── ai/           # Claude Sonnet wrappers (5 use cases)
│   └── parsers/      # .csv/.txt/.xlsx/.ics/.pdf ingestion
├── scripts/curriculum-sync/
└── supabase/migrations/
```

## Data Model (TypeScript)

```typescript
export type GradeLevel = 'K2' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
export type GradeBand = 'K2' | 'Lower_Primary' | 'Upper_Primary';
export type SENProfile = 'ADHD' | 'Autism_Spectrum' | 'Other_SEN' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'parent' | 'student' | 'admin';
  telegram_id?: string;
  sms_number?: string;
  plan: 'free_trial' | 'scholar' | 'scholar_pro';
  trial_ends_at?: string;
  created_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  grade_level: GradeLevel;
  grade_band: GradeBand;
  sen_profile: SENProfile;
  gamification_enabled: boolean;
  p1_intake_date?: string;            // Only set for K2
  date_of_birth: string;
  created_at: string;
}

export interface CurriculumVersion {
  id: string;
  curriculum_type: 'MOE';
  level: Exclude<GradeLevel, 'K2'>;   // MOE syllabus starts at P1
  subject: Subject;
  version: string;
  source_hash: string;
  parsed_topics: ParsedTopic[];        // JSONB
  status: 'queued' | 'parsing' | 'parsed' | 'failed';
  release_date: string;
}

export interface StudySchedule {
  id: string;
  child_id: string;
  schedule_json: ScheduleJson;         // JSONB
  generated_at: string;
  trigger_reason: 'initial' | 'manual' | 'low_completion' | 'exam_change' | 'calendar_change' | 'sen_change';
  schedule_hash: string;
  activates_at: string;
  confirmed_by_parent: boolean;
}

export interface Bite {
  id: string;
  topic_id: string;
  title: string;
  learning_objective: string;
  content_json: BiteContent;           // JSONB
  duration_min: number;                // 5 max for K2/ADHD; 5–10 for P1–P6
  grade_band: GradeBand;
  sen_variant?: Exclude<SENProfile, null>;
}

export interface Upload {
  id: string;
  parent_id: string;
  child_id?: string;
  file_type: 'spelling_list' | 'assessment_dates' | 'school_calendar' | 'moe_syllabus';
  original_filename: string;
  storage_path: string;
  status: 'queued' | 'parsing' | 'parsed' | 'failed';
  parsed_payload?: unknown;            // JSONB
  error_json?: { errors: { field: string; reason: string }[] };
  created_at: string;
}

export interface WellbeingSignal {
  id: string;
  child_id: string;
  signal_type: 'overload_risk' | 'burnout_risk' | 'comprehension_plateau' | 'activity_imbalance' | 'exam_anxiety';
  triggered_at: string;
  resolved_at?: string;
  recommended_action: string;
  acknowledged_by?: string;
  acknowledgement?: 'accepted' | 'modified' | 'dismissed';
}

export interface XPEvent {
  id: string;
  child_id: string;
  event_type: 'bite_complete' | 'correct_answer' | 'streak_milestone' | 'ahead_of_schedule';
  xp_delta: number;
  created_at: string;
}

export interface Badge {
  id: string;
  child_id: string;
  subject: Subject;
  tier: 'bronze' | 'silver' | 'gold';
  unlocked_at: string;
}
```

## Component Hierarchy

```
apps/web/src/
├── components/
│   ├── parent/
│   │   ├── Dashboard.tsx                 # Sibling timeline entry
│   │   ├── SiblingTimeline.tsx           # Weekly lanes + conflict flags
│   │   ├── ChildProfileSwitcher.tsx      # Always visible in top nav
│   │   ├── OnboardingWizard.tsx          # < 3 min; K2 and P1–P6 variants
│   │   ├── DataUpload.tsx                # Drag-drop spelling/calendar/dates/syllabus
│   │   ├── ScheduleRegenModal.tsx        # Delta preview → confirm
│   │   ├── WellbeingPanel.tsx            # Mental-health signals (Scholar Pro)
│   │   ├── NotificationSettings.tsx      # Telegram/SMS mode picker
│   │   └── SENProfilePicker.tsx          # Optional ADHD/Autism/Other setup
│   ├── student/
│   │   ├── DailyGoal.tsx
│   │   ├── BiteViewer.tsx                # Respects SEN cap (5 min ADHD)
│   │   ├── BiteQuiz.tsx
│   │   ├── StreakBanner.tsx
│   │   └── FocusMode.tsx                 # Single-task view (ADHD)
│   ├── shared/
│   │   ├── ExamCountdownWidget.tsx       # Persistent — green/yellow/red; K2 shows P1 intake
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
│   ├── ai.ts              # thin wrapper over packages/ai
│   ├── supabase.ts
│   ├── realtime.ts        # WS: xp.awarded, badge.unlocked, wellbeing.signal
│   ├── telegram.ts
│   └── uploads.ts         # multipart + polling
└── hooks/
    ├── useGradeBand.ts
    ├── useSENProfile.ts
    ├── useSchedule.ts
    ├── useWellbeing.ts
    └── useSiblingTimeline.ts
```

### BiteViewer — SEN-aware

```typescript
interface Props {
  bite: Bite;
  senProfile: SENProfile;
  onComplete: (mood: 'struggling' | 'okay' | 'got_it') => void;
}

export const BiteViewer: React.FC<Props> = ({ bite, senProfile, onComplete }) => {
  const content = bite.content_json;
  const hardCapMin = senProfile === 'ADHD' ? 5 : bite.duration_min;

  return (
    <SENOverlay profile={senProfile}>
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold">{bite.title}</h2>
        <BiteTimer maxMinutes={hardCapMin} />
        <div className="mt-4 prose">{content.text}</div>
        {content.diagram && <Diagram value={content.diagram} />}
        {content.quiz && <Quiz items={content.quiz} />}

        <div className="mt-6 flex gap-2">
          <button aria-label="Struggling"  onClick={() => onComplete('struggling')}>Struggling</button>
          <button aria-label="Okay"        onClick={() => onComplete('okay')}>Okay</button>
          <button aria-label="Got it"      onClick={() => onComplete('got_it')}>Got it!</button>
        </div>
      </div>
    </SENOverlay>
  );
};
```

### ScheduleRegenModal — 48h delay for Autism profile

```typescript
const { preview, activation } = await api.schedules.regenerate(childId, { trigger });

<Modal title="Review updated schedule">
  {/* Plain-language reason always shown above the delta */}
  <ReasonText>{preview.reason_text}</ReasonText>
  <DeltaPreview preview={preview} />
  {activation.mode === 'delayed_48h' && (
    <Notice tone="info">
      Autism-profile child. New schedule activates {formatRelative(activation.activates_at)}.
    </Notice>
  )}
  <Button onClick={() => api.schedules.confirm(childId, preview.new_schedule_hash)}>
    Confirm
  </Button>
</Modal>
```

`reason_text` is a server-side template string (not Claude-generated) composed from trigger type + metric. Examples by trigger:

| Trigger | reason_text template |
|---------|----------------------|
| `low_completion` | "{name} completed {pct}% of bites this week, so we've lightened next week's load." |
| `exam_date_change` | "{name}'s {subject} exam moved to {date}, so we've shifted revision weeks." |
| `school_calendar_change` | "A school holiday was added, so we've redistributed bites around it." |
| `sen_profile_change` | "{name}'s learning profile was updated, so bites have been repaced to match." |
| `manual` | "You requested a schedule refresh." |

## API Endpoints (Express)

```
Auth                    POST   /api/auth/signup  /login  /logout
Children                POST   /api/children
                        PATCH  /api/children/:id
                        PATCH  /api/children/:id/sen-profile
                        PATCH  /api/children/:id/gamification
Curriculum              GET    /api/curricula
                        GET    /api/curricula/:id
                        POST   /api/study-plans/:childId/set-curriculum
K2 Readiness            GET    /api/k2/readiness-tracks
                        POST   /api/children/:childId/readiness
Uploads                 POST   /api/uploads
                        GET    /api/uploads/:id
                        POST   /api/uploads/:id/correct
Schedules               POST   /api/schedules/:childId/regenerate
                        POST   /api/schedules/:childId/confirm
                        GET    /api/schedules/:childId/history
Sibling Timeline        GET    /api/households/:parentId/timeline
                        POST   /api/households/:parentId/timeline/apply
Bites                   GET    /api/bites/:childId/today
                        POST   /api/bites/:biteId/complete
Wellbeing               GET    /api/children/:id/wellbeing
                        POST   /api/children/:id/wellbeing/:signalId/ack
                        GET    /api/children/:id/holistic-prompts
Notifications           POST   /api/notifications/config
                        POST   /api/notifications/telegram/link
Reports                 POST   /api/reports/:childId/weekly-card
Countdown               GET    /api/children/:id/countdown
Realtime                WS     /realtime/children/:childId
Internal                POST   /api/internal/curriculum/fetch
                        GET    /api/internal/curriculum/status
                        POST   /api/internal/curriculum/notify-update
                        POST   /api/internal/wellbeing/evaluate
```

Sample route:

```typescript
router.post('/schedules/:childId/regenerate', auth, async (req, res) => {
  const child = await supabase.from('children').select('*').eq('id', req.params.childId).single();
  const trigger = req.body.trigger ?? 'manual';

  const preview = await ai.generateSchedule({
    topics: await getParsedTopics(child.data.id),
    examDates: await getExamDates(child.data.id),
    schoolCalendar: await getSchoolCalendar(child.data.id),
    weeklyHours: await getWeeklyHours(child.data.id),
    senProfile: child.data.sen_profile,
    gradeBand: child.data.grade_band,
  });

  const delayed = child.data.sen_profile === 'Autism_Spectrum';
  const activation = {
    mode: delayed ? 'delayed_48h' : 'immediate',
    activates_at: delayed ? addHours(new Date(), 48).toISOString() : new Date().toISOString(),
  };

  await supabase.from('study_schedules').insert({
    child_id: child.data.id,
    schedule_json: preview.schedule,
    schedule_hash: preview.hash,
    trigger_reason: trigger,
    activates_at: activation.activates_at,
    confirmed_by_parent: false,
  });

  res.json({ preview: preview.delta, activation });
});
```

## Claude Sonnet Integration (5 use cases)

```typescript
// packages/ai/src/curriculumParse.ts
export async function parseCurriculum(pdfBase64: string): Promise<ParsedTopic[]> {
  const r = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
        { type: 'text', text: CURRICULUM_PARSE_PROMPT },
      ],
    }],
  });
  return validate(ParsedTopicsSchema, JSON.parse(firstText(r)));
}

// packages/ai/src/scheduleGenerate.ts
export async function generateSchedule(p: ScheduleInput): Promise<ScheduleOutput> {
  const r = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    system: systemForBand(p.gradeBand, p.senProfile),
    messages: [{ role: 'user', content: renderSchedulePrompt(p) }],
  });
  return validate(ScheduleSchema, JSON.parse(firstText(r)));
}

// packages/ai/src/biteGenerate.ts
export async function generateBite(t: Topic, band: GradeBand, sen: SENProfile): Promise<Bite> {
  const durationCap = sen === 'ADHD' ? 5 : (band === 'K2' ? 5 : 10);
  // …
}

// packages/ai/src/weakTopic.ts — WHY + recommended bite
// packages/ai/src/uploadParse.ts — non-iCal PDFs → normalised payload
```

All outputs are schema-validated (`zod`) before being written to the database. Never expose raw Claude output to the client.

## Mental Health Guardrail Engine

Rule-based — no ML. Runs hourly via `/api/internal/wellbeing/evaluate` cron. Each rule evaluates against recent activity and writes `wellbeing_signals` rows. Suggestions only — parent ack required on dashboard.

```typescript
const rules: Rule[] = [
  overloadRisk({ threshold: (childWeeklyDefault) => childWeeklyDefault * 2 }),
  burnoutRisk({ streakDropDays: 3 }),
  comprehensionPlateau({ consecutiveFailedBites: 3 }),
  activityImbalance({ consecutiveStudyDays: 7 }),
  examAnxiety({ countdownDays: 14, completionDropThreshold: 0.2 }),
];
// SEN-adjusted thresholds applied per child.
```

## File Upload Pipeline

```
client (multipart) → POST /api/uploads → storage (Supabase) → parse_queue row
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              ▼                          ▼                          ▼
  csv / txt / xlsx parser       ics parser              Claude Sonnet (PDF)
              └──────────────────────────┴──────────────────────────┘
                                         ▼
                             validated JSONB → uploads.parsed_payload
                                         ▼
                            notify client via WS upload.parsed
```

Error UX: per-row inline correction form when parser cannot resolve a field. Parent can override any auto-extracted value.

## Notifications (Telegram + SMS)

```typescript
// services/telegram.ts
export async function sendWeeklyDigest(p: ParentDigest) {
  const md = renderDigestMarkdown(p);            // consolidated across all children
  try {
    await bot.telegram.sendMessage(p.telegramId, md, { parse_mode: 'MarkdownV2' });
  } catch (e) {
    if (p.sms_number) await twilio.send(p.sms_number, renderDigestSms(p));
  }
}
```

Modes: weekly digest / daily progress / realtime. One consolidated message covers all siblings.

## PWA & Offline

- Workbox service worker, cache-first for **assigned bites only** (Scholar Pro only).
- `vite-plugin-pwa` for manifest + SW registration.
- Dedicated iOS Safari testing checklist; document known limitations.

## Phase 1 MVP Build Order (v3)

Aligned to PRD §6 priority tiers.

### Critical (Weeks 1–4)

1. Supabase schema + migrations (include `sen_profile`, `wellbeing_signals`, `uploads` on day one).
2. Parent auth + onboarding wizard (K2 and P1–P6 paths, < 3 min).
3. File upload pipeline (.csv, .txt, .xlsx, .ics, .pdf) with manual-correction UX.
4. Curriculum sync + Claude parse → `parsed_topics`.
5. Schedule generation (SEN- and calendar-aware) + delta regeneration modal.
6. Gamification: streak / XP / badges with 2 s WS payout; parent kill-switch.
7. Chinese Language bites (K2 + P1–P6); pinyin toggle.
8. Tiered pricing + 7-day trial (no CC); plan-gated features.
9. SEN profile setup + ADHD/Autism/Other adaptations (incl. 48h delayed activation).
10. Mental-health guardrail engine (5 signal types) + parent ack UX.

### High (Weeks 5–6)

11. Sibling timeline dashboard + conflict detection + load-balance suggestions.
12. Configurable notifications (Telegram primary, Twilio fallback) — one consolidated message.
13. Exam countdown widget (persistent; K2 shows P1 intake).

### Medium / Low (Weeks 7–8)

14. Shareable weekly progress card (Sunday cron) + wellbeing traffic-light status.
15. Weak-topic WHY + one-tap remedy action.
16. Dark mode (Scholar+).
17. Offline PWA caching (Scholar Pro) — iOS Safari test.

## Testing Targets

```typescript
it('ADHD profile caps bite duration at 5 minutes', async () => {
  const bite = await ai.generateBite(topic, 'Upper_Primary', 'ADHD');
  expect(bite.duration_min).toBeLessThanOrEqual(5);
});

it('Autism profile delays schedule activation by 48 hours', async () => {
  const r = await api.post(`/schedules/${asdChild.id}/regenerate`, { trigger: 'manual' });
  expect(r.data.activation.mode).toBe('delayed_48h');
  expect(diffHours(r.data.activation.activates_at, new Date())).toBeGreaterThanOrEqual(48);
});

it('Schedule regenerates when weekly completion < 60%', async () => {
  await seedCompletion(child.id, 0.4);
  await cron.runWellbeingAndScheduleTriggers();
  const history = await api.get(`/schedules/${child.id}/history`);
  expect(history.data[0].trigger_reason).toBe('low_completion');
});

it('XP awarded within 2 seconds of bite completion', async () => {
  const start = Date.now();
  await api.post(`/bites/${bite.id}/complete`);
  const ev = await waitForWS('xp.awarded');
  expect(Date.now() - start).toBeLessThan(2000);
  expect(ev.xp_delta).toBeGreaterThan(0);
});
```

## Performance Targets (PRD v3)

| Constraint | Target |
|-----------|--------|
| Onboarding completion | < 3 min |
| Grade-band UI switch  | < 300 ms |
| XP payout post-bite   | < 2 s (WS) |
| Curriculum parse      | ≥ 90% accuracy |
| Tap target (K2/LP)    | 56×56 px min |
| ADHD bite cap         | ≤ 5 min |
| ASD schedule notice   | ≥ 48 h |
| Progress card         | 1080×1350 px |

## Environment

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6
TELEGRAM_BOT_TOKEN=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SUPABASE_SERVICE_ROLE_KEY=...   # backend only
```

## References

- `02_Core_Documentation/SchoolHub_PRD_v3.md` — authoritative PRD
- `02_Core_Documentation/SchoolHub_API_Reference.md` — endpoints + schema + rate limits
- `03_Skills_Framework/schoolhub-ai-curriculum-skill.md` — Claude prompts
- `03_Skills_Framework/schoolhub-product-design-skill.md` — design tokens + SEN overlays
- `04_Curriculum_Sync/SchoolHub_Curriculum_Sync_Technical_Guide.md` — MOE ingestion
- `05_Features/SchoolHub_Parent_Notifications_Implementation.md` — Telegram/SMS
