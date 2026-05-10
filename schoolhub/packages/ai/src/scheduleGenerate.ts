import { createHash } from 'crypto';
import { callClaude, withChildPlaceholder } from './callClaude.js';
import { ScheduleJsonSchema, type ScheduleJsonOutput } from './schemas.js';
import { system, userPrompt, VERSION, type ScheduleGenerateContext, type TopicInput } from './prompts/scheduleGenerate.v1.js';

export { type ScheduleGenerateContext, type TopicInput };
export const PROMPT_VERSION = VERSION;

function mockSchedule(ctx: ScheduleGenerateContext, startDate: string): ScheduleJsonOutput {
  const subjects = ctx.subjects.length > 0 ? ctx.subjects : ['English', 'Mathematics', 'Science'];
  const fakeTopicIds: Record<string, string> = {
    English: 'a1b2c3d4-0001-0001-0001-000000000001',
    Mathematics: 'a1b2c3d4-0002-0002-0002-000000000002',
    Science: 'a1b2c3d4-0003-0003-0003-000000000003',
    Chinese: 'a1b2c3d4-0004-0004-0004-000000000004',
    Malay: 'a1b2c3d4-0005-0005-0005-000000000005',
    Tamil: 'a1b2c3d4-0006-0006-0006-000000000006',
    Social_Studies: 'a1b2c3d4-0007-0007-0007-000000000007',
  };

  const start = new Date(startDate);
  // Align to next Monday
  const dayOfWeek = start.getDay();
  const daysUntilMon = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
  start.setDate(start.getDate() + daysUntilMon);

  const weeks = Array.from({ length: 4 }, (_, wi) => {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + wi * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4);

    const bites = subjects.flatMap((subject, si) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + si % 5);
      const dateStr = date.toISOString().slice(0, 10);
      return [
        {
          topic_id: fakeTopicIds[subject] ?? 'a1b2c3d4-0001-0001-0001-000000000001',
          subject: subject as 'English' | 'Mathematics' | 'Science',
          duration_min: 7,
          intensity: 'med' as const,
          is_review: false,
          date: dateStr,
        },
      ];
    });

    const dateRange = `${weekStart.toISOString().slice(0, 10)} – ${weekEnd.toISOString().slice(0, 10)}`;
    return {
      week_number: wi + 1,
      date_range: dateRange,
      bites,
      total_minutes: bites.length * 7,
      holiday_days: [] as string[],
      notes: wi === 0 ? '[Alpha] Mock schedule — upgrade to Scholar to generate a real AI plan.' : '',
    };
  });

  return { weeks, buffer_weeks: 1, hash: '' };
}

export async function generateSchedule(
  ctx: ScheduleGenerateContext,
  childName: string,
): Promise<ScheduleJsonOutput & { hash: string }> {
  let result: ScheduleJsonOutput;

  if (process.env.ALPHA_MODE === 'true') {
    result = mockSchedule(ctx, ctx.startDate);
  } else {
    const safeSystem = withChildPlaceholder(system(ctx), childName);
    const safeUser = withChildPlaceholder(userPrompt(ctx), childName);
    result = await callClaude({
      systemPrompt: safeSystem,
      userPrompt: safeUser,
      schema: ScheduleJsonSchema,
      maxTokens: 8192,
    });
  }

  const hashInput = result.weeks
    .flatMap(w => w.bites.map(b => `${w.week_number}:${b.topic_id}:${b.date}`))
    .join('|');
  const hash = createHash('sha256').update(hashInput).digest('hex').slice(0, 16);

  return { ...result, hash };
}
