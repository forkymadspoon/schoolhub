import { parse } from 'csv-parse/sync';
import type { UploadFileType } from '@schoolhub/types';

export interface CSVParseResult {
  fileType: Extract<UploadFileType, 'spelling_list'>;
  words: string[];
}

/** Parse a CSV/TXT spelling-list file. Accepts single-column or multi-column (first column used). */
export function parseSpellingListCSV(raw: string): CSVParseResult {
  const rows: string[][] = parse(raw, {
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as string[][];

  const words = rows
    .map(r => r[0]?.trim() ?? '')
    .filter(w => w.length > 0);

  if (words.length === 0) {
    throw new Error('No words found in spelling list CSV');
  }

  return { fileType: 'spelling_list', words };
}
