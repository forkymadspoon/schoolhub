/**
 * PDF parsing delegates entirely to Claude via @schoolhub/ai.
 * This module converts a PDF buffer to base64 and routes to the correct AI use case.
 *
 * Callers must provide the actual @schoolhub/ai module; we accept it as a parameter
 * to avoid circular package dependencies.
 */

import type { UploadFileType } from '@schoolhub/types';

export type PDFParseUploadFn<T = unknown> = (
  pdfBase64: string,
  fileType: Exclude<UploadFileType, 'spelling_list' | 'moe_syllabus'>,
) => Promise<T>;

export interface PDFParseResult<T = unknown> {
  payload: T;
}

/** Convert a PDF buffer to base64 and delegate to the provided Claude upload-parse function. */
export async function parsePDF<T = unknown>(
  buffer: Buffer,
  fileType: Exclude<UploadFileType, 'spelling_list' | 'moe_syllabus'>,
  parseUploadPDF: PDFParseUploadFn<T>,
): Promise<PDFParseResult<T>> {
  const pdfBase64 = buffer.toString('base64');
  const payload = await parseUploadPDF(pdfBase64, fileType);
  return { payload };
}
