import type { GradeBand, SENProfile, Subject } from '@schoolhub/types';

export const VERSION = 'schedule-generate.v1';

export interface TopicInput {
  id: string;
  topic_name: string;
  subject: string;
  estimated_hours: number;
  exam_weight_percentage: number;
  difficulty_level: number;
  prerequisites: string[];
}

export interface ScheduleGenerateContext {
  gradeBand: GradeBand;
  senProfile: SENProfile;
  gradeLevel: string;
  weeklyStudyMinutes: number;
  subjects: Subject[];
  topics: TopicInput[];
  examDates: Array<{ label: string; date: string; subject: string | null }>;
  holidayDates: string[];
  startDate: string;
}

export function system(ctx: ScheduleGenerateContext): string {
  const senClause = ctx.senProfile
    ? `\nSEN profile: ${ctx.senProfile}.${
        ctx.senProfile === 'ADHD'
          ? ' Each bite must be ≤5 minutes. Frequent micro-breaks. Focus on one task at a time.'
          : ctx.senProfile === 'Autism_Spectrum'
            ? ' No surprise changes. Predictable routine. Buffer weeks before any exam.'
            : ' Scaffolded difficulty. Extended pacing.'
      }`
    : '';
  return `\
You are a Singapore Primary ${ctx.gradeLevel} study schedule planner.
Grade band: ${ctx.gradeBand}${senClause}
Weekly study budget: ${ctx.weeklyStudyMinutes} minutes.
Bite duration: ${ctx.senProfile === 'ADHD' ? '1–5' : '5–10'} minutes.

Generate exactly 8 weeks of bites (weeks 1–8). Do not exceed 8 weeks total.
Keep each week's bites concise — max 14 bites per week.
Apply spaced repetition: revisit topics after 3 days, 7 days, and 14 days.
Leave buffer_weeks ≥ 1 before any exam date within the 8-week window.
Mark exam dates as review-only weeks (no new topics).
Do NOT schedule bites on holiday_days.

Output ONLY valid JSON. No markdown, no prose.

Schema:
{
  "weeks": [
    {
      "week_number": number,
      "date_range": string (e.g. "2026-01-05 – 2026-01-09"),
      "bites": [
        {
          "topic_id": string (uuid),
          "subject": string,
          "duration_min": number,
          "intensity": "low"|"med"|"high",
          "is_review": boolean,
          "date": "YYYY-MM-DD"
        }
      ],
      "total_minutes": number,
      "holiday_days": ["YYYY-MM-DD"],
      "notes": string
    }
  ],
  "buffer_weeks": number,
  "hash": string (sha256 of concatenated week_number+topic_ids, provided by caller — output empty string)
}`;
}

export function userPrompt(ctx: ScheduleGenerateContext): string {
  return JSON.stringify({
    start_date: ctx.startDate,
    subjects: ctx.subjects,
    exam_dates: ctx.examDates,
    holiday_dates: ctx.holidayDates,
    topics: ctx.topics,
  });
}
