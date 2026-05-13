export { parseSpellingListCSV, type CSVParseResult } from './csv.js';
export { parseSpellingListXLSX, type XLSXSpellingResult } from './xlsx.js';
export { parseICS, type ICSParseResult, type CalendarEvent } from './ics.js';
export { parsePDF, type PDFParseResult, type PDFParseUploadFn } from './pdf.js';

import { parseSpellingListCSV } from './csv.js';
import { parseSpellingListXLSX } from './xlsx.js';
import { parseICS } from './ics.js';
import type { PDFParseUploadFn } from './pdf.js';
import type { UploadFileType } from '@schoolhub/types';

/**
 * Dispatch parser based on fileType + filename extension.
 * PDF files (assessment_dates, school_calendar) require a parseUploadPDF callback
 * supplied by the caller (from @schoolhub/ai) to avoid a circular dependency.
 */
export async function parseFile(
  buffer: Buffer,
  fileType: UploadFileType,
  filename: string,
  parseUploadPDF?: PDFParseUploadFn<unknown>,
): Promise<unknown> {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();

  if (fileType === 'spelling_list') {
    if (ext === '.xlsx') return parseSpellingListXLSX(buffer);
    return parseSpellingListCSV(buffer.toString('utf8'));
  }

  if (ext === '.ics') {
    return parseICS(buffer.toString('utf8'));
  }

  // PDF uploads delegate to Claude via the provided callback
  if (ext === '.pdf') {
    if (!parseUploadPDF) {
      throw new Error(`PDF parsing for ${fileType} requires a parseUploadPDF callback`);
    }
    if (fileType === 'moe_syllabus') {
      throw new Error('moe_syllabus PDF parsing is not supported via this route');
    }
    // fileType is now narrowed to 'assessment_dates' | 'school_calendar'
    return parseUploadPDF(buffer.toString('base64'), fileType);
  }

  throw new Error(`Unsupported file extension "${ext}" for type "${fileType}"`);
}
