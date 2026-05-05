import type { UploadFileType } from '@schoolhub/types';

export const VERSION = 'upload-parse.v1';

const SCHOOL_CALENDAR_SCHEMA = `{
  "type": "school_calendar",
  "events": [
    { "date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"|null, "title": string, "type": "holiday"|"school_event"|"exam"|"other", "all_day": boolean }
  ]
}`;

const ASSESSMENT_DATES_SCHEMA = `{
  "type": "assessment_dates",
  "dates": [
    { "label": string, "subject": string|null, "date": "YYYY-MM-DD", "type": "exam"|"quiz"|"assignment"|"other", "notes": string|null }
  ]
}`;

export function system(fileType: Exclude<UploadFileType, 'spelling_list' | 'moe_syllabus'>): string {
  const schema = fileType === 'school_calendar' ? SCHOOL_CALENDAR_SCHEMA : ASSESSMENT_DATES_SCHEMA;

  return `\
You are parsing a Singapore primary school document to extract structured date information.
Today is in the SGT timezone (UTC+8). Infer the year from context if not explicit.
Output ONLY valid JSON matching the schema. No markdown, no prose.

Schema:
${schema}`;
}

export function userPrompt(fileType: Exclude<UploadFileType, 'spelling_list' | 'moe_syllabus'>): string {
  return fileType === 'school_calendar'
    ? 'Extract all school calendar events from this document.'
    : 'Extract all assessment and exam dates from this document.';
}
