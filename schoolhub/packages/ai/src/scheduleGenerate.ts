import { createHash } from 'crypto';
import { callClaude, withChildPlaceholder } from './callClaude.js';
import { ScheduleJsonSchema, type ScheduleJsonOutput } from './schemas.js';
import { system, userPrompt, VERSION, type ScheduleGenerateContext, type TopicInput } from './prompts/scheduleGenerate.v1.js';

export { type ScheduleGenerateContext, type TopicInput };
export const PROMPT_VERSION = VERSION;

export async function generateSchedule(
  ctx: ScheduleGenerateContext,
  childName: string,
): Promise<ScheduleJsonOutput & { hash: string }> {
  const safeSystem = withChildPlaceholder(system(ctx), childName);
  const safeUser = withChildPlaceholder(userPrompt(ctx), childName);

  const result = await callClaude({
    systemPrompt: safeSystem,
    userPrompt: safeUser,
    schema: ScheduleJsonSchema,
    maxTokens: 8192,
  });

  // Compute deterministic hash from topic ids in order
  const hashInput = result.weeks
    .flatMap(w => w.bites.map(b => `${w.week_number}:${b.topic_id}:${b.date}`))
    .join('|');
  const hash = createHash('sha256').update(hashInput).digest('hex').slice(0, 16);

  return { ...result, hash };
}
