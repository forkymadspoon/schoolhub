import { createHash } from 'crypto';
import type { GradeBand, SENProfile } from '@schoolhub/types';
import { biteDurationCap } from '@schoolhub/types';
import { callClaude } from './callClaude.js';
import { BiteContentSchema, type BiteContentOutput } from './schemas.js';
import { system, userPrompt, VERSION, type BiteGenerateContext } from './prompts/biteGenerate.v1.js';

export { type BiteGenerateContext };
export const PROMPT_VERSION = VERSION;

export interface BiteGenerateInput {
  topicId: string;
  topicName: string;
  subject: string;
  learningObjective: string;
  difficulty: number;
  prerequisites: string[];
  gradeBand: GradeBand;
  senProfile: SENProfile;
}

export interface BiteGenerateResult {
  content: BiteContentOutput;
  cacheKey: string;
  promptVersion: string;
}

export async function generateBite(input: BiteGenerateInput): Promise<BiteGenerateResult> {
  const durationMinCap = biteDurationCap(input.gradeBand, input.senProfile);

  const ctx: BiteGenerateContext = {
    gradeBand: input.gradeBand,
    senProfile: input.senProfile,
    durationMinCap,
    topicName: input.topicName,
    subject: input.subject,
    learningObjective: input.learningObjective,
    difficulty: input.difficulty,
    prerequisites: input.prerequisites,
  };

  const content = await callClaude({
    systemPrompt: system(ctx),
    userPrompt: userPrompt(ctx),
    schema: BiteContentSchema,
    maxTokens: 4096,
  });

  // Enforce duration cap post-generation as safety net
  const cappedContent: BiteContentOutput = {
    ...content,
    duration_min: Math.min(content.duration_min, durationMinCap),
  };

  const cacheKey = createHash('sha256')
    .update(`${input.topicId}:${input.gradeBand}:${input.senProfile ?? 'none'}:${PROMPT_VERSION}`)
    .digest('hex');

  return { content: cappedContent, cacheKey, promptVersion: PROMPT_VERSION };
}
