import type { GradeBand, MoodRating, SENProfile } from '@schoolhub/types';
import { callClaude, withChildPlaceholder } from './callClaude.js';
import { WeakTopicExplanationSchema, type WeakTopicExplanation } from './schemas.js';
import { system, userPrompt, VERSION, type WeakTopicContext } from './prompts/weakTopic.v1.js';

export { type WeakTopicExplanation };
export const PROMPT_VERSION = VERSION;

export interface WeakTopicInput {
  topicName: string;
  subject: string;
  failedAttempts: number;
  moodHistory: MoodRating[];
  prerequisiteTopics: Array<{ id: string; name: string }>;
  gradeBand: GradeBand;
  senProfile: SENProfile;
  childName: string;
}

export async function explainWeakTopic(input: WeakTopicInput): Promise<WeakTopicExplanation> {
  const ctx: WeakTopicContext = {
    gradeBand: input.gradeBand,
    senProfile: input.senProfile,
    topicName: input.topicName,
    subject: input.subject,
    failedAttempts: input.failedAttempts,
    moodHistory: input.moodHistory,
    prerequisiteTopics: input.prerequisiteTopics,
  };

  const safeSystem = withChildPlaceholder(system(ctx), input.childName);
  const safeUser = withChildPlaceholder(userPrompt(ctx), input.childName);

  return callClaude({
    systemPrompt: safeSystem,
    userPrompt: safeUser,
    schema: WeakTopicExplanationSchema,
    maxTokens: 1024,
  });
}
