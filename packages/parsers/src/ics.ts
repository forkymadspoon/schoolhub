import ICAL from 'ical.js';

export interface CalendarEvent {
  date: string;        // YYYY-MM-DD
  end_date: string | null;
  title: string;
  type: 'holiday' | 'school_event' | 'exam' | 'other';
  all_day: boolean;
}

export interface ICSParseResult {
  fileType: 'school_calendar';
  events: CalendarEvent[];
}

const HOLIDAY_KEYWORDS = ['holiday', 'public holiday', 'school holiday', 'vacation', 'break', 'hari raya', 'deepavali', 'christmas', 'new year', 'chinese new year', 'labour day', 'national day'];
const EXAM_KEYWORDS = ['exam', 'test', 'assessment', 'psle', 'ca1', 'ca2', 'sa1', 'sa2', 'mid-year', 'end-of-year'];

function classifyEvent(summary: string): CalendarEvent['type'] {
  const lower = summary.toLowerCase();
  if (EXAM_KEYWORDS.some(k => lower.includes(k))) return 'exam';
  if (HOLIDAY_KEYWORDS.some(k => lower.includes(k))) return 'holiday';
  return 'school_event';
}

function toISODate(date: ICAL.Time): string {
  const jsDate = date.toJSDate();
  return jsDate.toISOString().slice(0, 10);
}

/** Parse an .ics (iCalendar) file and return structured school calendar events. */
export function parseICS(raw: string): ICSParseResult {
  const jCal = ICAL.parse(raw);
  const comp = new ICAL.Component(jCal);
  const vevents = comp.getAllSubcomponents('vevent');

  const events: CalendarEvent[] = vevents.map(vevent => {
    const event = new ICAL.Event(vevent);
    const summary = event.summary ?? 'Untitled';

    const dtstart = event.startDate;
    const dtend = event.endDate;
    const allDay = dtstart.isDate;

    const date = toISODate(dtstart);
    const endDate = dtend ? toISODate(dtend) : null;
    // iCal all-day DTEND is exclusive; subtract 1 day for display
    const displayEndDate =
      allDay && endDate && endDate !== date
        ? new Date(new Date(endDate).getTime() - 86400000).toISOString().slice(0, 10)
        : endDate === date
          ? null
          : endDate;

    return {
      date,
      end_date: displayEndDate,
      title: summary,
      type: classifyEvent(summary),
      all_day: allDay,
    };
  });

  return { fileType: 'school_calendar', events };
}
