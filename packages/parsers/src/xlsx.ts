import * as XLSX from 'xlsx';
import type { UploadFileType } from '@schoolhub/types';

export interface XLSXSpellingResult {
  fileType: Extract<UploadFileType, 'spelling_list'>;
  words: string[];
}

/** Parse the first sheet of an .xlsx file as a spelling list (first column, all rows). */
export function parseSpellingListXLSX(buffer: Buffer): XLSXSpellingResult {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('XLSX file contains no sheets');

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error('Could not read first sheet');

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const words = rows
    .map(r => String(r[0] ?? '').trim())
    .filter(w => w.length > 0);

  if (words.length === 0) {
    throw new Error('No words found in XLSX spelling list');
  }

  return { fileType: 'spelling_list', words };
}
