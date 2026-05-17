// Singapore public holidays and MOE school holiday data.
// Source: MOM Singapore public holidays, MOE 2026 school calendar.
// Public holiday dates for Islamic holidays (Hari Raya) are approximate
// and should be verified against official announcements each year.

export interface CalendarBreak {
  name: string;
  date: Date;
  type: 'public_holiday' | 'school_holiday';
}

const ph = (name: string, iso: string): CalendarBreak => ({
  name,
  date: new Date(iso),
  type: 'public_holiday',
});

const sh = (name: string, iso: string): CalendarBreak => ({
  name,
  date: new Date(iso),
  type: 'school_holiday',
});

// Singapore public holidays 2026
const PUBLIC_HOLIDAYS: CalendarBreak[] = [
  ph("New Year's Day",    '2026-01-01'),
  ph('Chinese New Year',  '2026-01-22'),
  ph('Chinese New Year',  '2026-01-23'),
  ph('Good Friday',       '2026-04-03'),
  ph('Labour Day',        '2026-05-01'),
  ph('Vesak Day',         '2026-05-13'),
  ph('Hari Raya Puasa',   '2026-05-29'), // approximate
  ph('Hari Raya Haji',    '2026-06-17'), // approximate
  ph('National Day',      '2026-08-10'), // observed (9 Aug falls on Sunday)
  ph('Deepavali',         '2026-10-20'), // approximate
  ph('Christmas Day',     '2026-12-25'),
];

// MOE 2026 school holidays — first day of each break period
const SCHOOL_HOLIDAYS: CalendarBreak[] = [
  sh('March School Holidays',     '2026-03-09'),
  sh('June School Holidays',      '2026-06-01'),
  sh('September School Holidays', '2026-09-07'),
  sh('Year-End School Holidays',  '2026-11-23'),
];

// MOE 2026 school term dates (for context / future use)
export const SCHOOL_TERMS_2026 = [
  { term: 1, start: new Date('2026-01-02'), end: new Date('2026-03-07') },
  { term: 2, start: new Date('2026-03-23'), end: new Date('2026-05-30') },
  { term: 3, start: new Date('2026-06-29'), end: new Date('2026-09-04') },
  { term: 4, start: new Date('2026-09-21'), end: new Date('2026-11-19') },
];

const ALL_BREAKS = [...PUBLIC_HOLIDAYS, ...SCHOOL_HOLIDAYS].sort(
  (a, b) => a.date.getTime() - b.date.getTime(),
);

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function daysUntil(target: Date): number {
  const today = startOfDay(new Date());
  const t = startOfDay(target);
  return Math.ceil((t.getTime() - today.getTime()) / 86_400_000);
}

export function formatBreakDate(date: Date): string {
  return date.toLocaleDateString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function getNextBreak(): (CalendarBreak & { daysAway: number }) | null {
  const today = startOfDay(new Date());
  const next = ALL_BREAKS.find(b => startOfDay(b.date) >= today);
  if (!next) return null;
  return { ...next, daysAway: daysUntil(next.date) };
}
