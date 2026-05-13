import type { UploadFileType } from '@schoolhub/types';
import { callClaude } from './callClaude.js';
import { UploadPayloadSchema, type UploadPayload } from './schemas.js';
import { system, userPrompt, VERSION } from './prompts/uploadParse.v1.js';

export { type UploadPayload };
export const PROMPT_VERSION = VERSION;

type SupportedPDFUploadType = Exclude<UploadFileType, 'spelling_list' | 'moe_syllabus'>;

/** Parse a school calendar or assessment-dates PDF using Claude. */
export async function parseUploadPDF(
  pdfBase64: string,
  fileType: SupportedPDFUploadType,
): Promise<UploadPayload> {
  return callClaude({
    systemPrompt: system(fileType),
    userPrompt: userPrompt(fileType),
    schema: UploadPayloadSchema,
    maxTokens: 4096,
    pdfBase64,
  });
}
