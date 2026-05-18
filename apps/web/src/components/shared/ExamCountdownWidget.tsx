import { useState, useEffect } from 'react';
import type { ExamCountdownItem, GradeLevel } from '@schoolhub/types';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';

interface Props {
  childId: string;
  gradeLevel?: GradeLevel | undefined;
  /** Student (not parent) can hide the widget */
  canHide?: boolean;
}

// ─── Grade-appropriate milestone fallback ─────────────────────────────────────

// Grades with no formal SA/WA assessments
const NO_EXAM_GRADES: GradeLevel[] = ['K2', 'P1', 'P2'];

function nextMilestone(grade: GradeLevel): { label: string; date: Date } {
  const now = new Date();
  const y = now.getFullYear();

  if (grade === 'K2') {
    // Count down to P1 intake (first school day of next calendar year)
    return { label: 'P1 intake', date: new Date(y + 1, 0, 2) };
  }
  if (grade === 'P1' || grade === 'P2') {
    // No SA/WA — show next school holiday instead
    const midYear = new Date(y, 5, 1);   // ~Jun 1 mid-year holidays
    if (midYear > now) return { label: 'Mid-year holidays', date: midYear };
    const yearEnd = new Date(y, 10, 21); // ~Nov 21 year-end holidays
    if (yearEnd > now) return { label: 'Year-end holidays', date: yearEnd };
    return { label: 'Mid-year holidays', date: new Date(y + 1, 5, 1) };
  }
  if (grade === 'P6') {
    return { label: 'PSLE', date: new Date(y, 9, 1) }; // Oct 1
  }
  if (grade === 'P5') {
    const prelim = new Date(y, 7, 1); // Aug 1 — Prelim
    if (prelim > now) return { label: 'Prelim', date: prelim };
    return { label: 'SA2', date: new Date(y, 9, 15) };
  }
  // P3–P4: SA1 (June) then SA2 (Oct)
  const sa1 = new Date(y, 5, 2);   // Jun 2
  if (sa1 > now) return { label: 'SA1', date: sa1 };
  const sa2 = new Date(y, 9, 15);  // Oct 15
  if (sa2 > now) return { label: 'SA2', date: sa2 };
  return { label: 'SA1', date: new Date(y + 1, 5, 2) };
}

function daysUntil(target: Date): number {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / msPerDay));
}

function colourForDays(days: number): ExamCountdownItem['colour'] {
  if (days > 60) return 'green';
  if (days > 30) return 'yellow';
  return 'red';
}

// Replace "PSLE" label with grade-appropriate text for non-P6 grades
function fixLabel(label: string, grade?: GradeLevel): string {
  if (!grade || grade === 'P6') return label;
  if (label.toUpperCase() === 'PSLE') return nextMilestone(grade).label;
  return label;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExamCountdownWidget({ childId, gradeLevel, canHide = false }: Props) {
  const [items, setItems] = useState<ExamCountdownItem[]>([]);
  const [hidden, setHidden] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    void api
      .get<{ items: ExamCountdownItem[] }>(`/children/${childId}/countdown`)
      .then((d) => setItems(d.items))
      .catch(() => null);
  }, [childId]);

  if (hidden) return null;

  // Strip SA/WA labels for grades that don't have formal assessments
  const SA_LABELS = /^(SA1|SA2|WA1|WA2|WA3|WA4)$/i;
  const filteredItems = gradeLevel && NO_EXAM_GRADES.includes(gradeLevel)
    ? items.filter(item => !SA_LABELS.test(item.label.trim()))
    : items;

  // If the API returned nothing (or all items were filtered) and we know the grade, synthesise a milestone
  const displayItems: ExamCountdownItem[] = filteredItems.length > 0
    ? filteredItems.map(item => ({ ...item, label: fixLabel(item.label, gradeLevel) }))
    : gradeLevel
      ? (() => {
          const { label, date } = nextMilestone(gradeLevel);
          const days = daysUntil(date);
          return [{ label, date: date.toISOString().slice(0, 10), days_remaining: days, colour: colourForDays(days) }];
        })()
      : [];

  if (displayItems.length === 0) return null;

  const current = displayItems[index % displayItems.length];
  if (!current) return null;

  const dotClass =
    current.colour === 'green'
      ? 'status-dot-green'
      : current.colour === 'yellow'
        ? 'status-dot-yellow'
        : 'status-dot-red';

  return (
    <div className="flex items-center gap-2">
      <button
        className="countdown-chip"
        aria-label={`${current.label} countdown: ${current.days_remaining} days`}
        onClick={() => displayItems.length > 1 && setIndex((i) => i + 1)}
      >
        <span className={cn('status-dot', dotClass)} aria-hidden="true" />
        <span>
          {current.label} · {current.days_remaining} days
        </span>
      </button>

      {canHide && (
        <button
          className="text-muted text-xs underline"
          onClick={() => setHidden(true)}
          aria-label="Hide countdown"
        >
          hide
        </button>
      )}
    </div>
  );
}
