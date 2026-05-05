import type { GradeLevel, Subject } from '@schoolhub/types';
import { callClaude } from './callClaude.js';
import { ParsedTopicsResponseSchema, type ParsedTopicsResponse } from './schemas.js';
import { system, userPrompt, VERSION } from './prompts/curriculumParse.v1.js';

export const PROMPT_VERSION = VERSION;

export async function parseCurriculumPDF(
  pdfBase64: string,
  level: Exclude<GradeLevel, 'K2'>,
  subject: Subject,
): Promise<ParsedTopicsResponse> {
  return callClaude({
    systemPrompt: system,
    userPrompt: userPrompt(level, subject),
    schema: ParsedTopicsResponseSchema,
    maxTokens: 8192,
    pdfBase64,
  });
}
