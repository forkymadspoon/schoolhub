import { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, Sprout } from 'lucide-react';
import type { GradeLevel } from '@schoolhub/types';

// PSLE is held in early October each year; recalculates after it passes
function getPsleDate(): Date {
  const now = new Date();
  const psle = new Date(now.getFullYear(), 9, 1); // Oct 1
  if (psle < now) psle.setFullYear(psle.getFullYear() + 1);
  return psle;
}

function daysUntil(d: Date): number {
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

interface Props {
  gradeLevel: GradeLevel;
}

export function PsleChip({ gradeLevel }: Props) {
  const [days, setDays] = useState(() => daysUntil(getPsleDate()));

  useEffect(() => {
    const id = setInterval(() => setDays(daysUntil(getPsleDate())), 60_000);
    return () => clearInterval(id);
  }, []);

  const base =
    'inline-flex items-center gap-1.5 rounded-pill bg-surface shadow-card border border-line px-3 py-1.5';

  if (gradeLevel === 'P6') {
    return (
      <div className={base} title="PSLE 2026">
        <GraduationCap className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        <span className="text-[11px] font-semibold text-ink">
          PSLE in{' '}
          <span className="text-primary tabular-nums">{days}</span>{' '}
          days
        </span>
      </div>
    );
  }

  if (gradeLevel === 'P5') {
    return (
      <div className={base} title="Build steady habits — PSLE next year">
        <BookOpen className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        <span className="text-[11px] font-semibold text-ink">
          PSLE next yr · build habits
        </span>
      </div>
    );
  }

  // K2, P1–P4
  return (
    <div className={base} title="Focus on fundamentals — no exam pressure yet">
      <Sprout className="h-3.5 w-3.5 text-game-green flex-shrink-0" />
      <span className="text-[11px] font-semibold text-ink">
        Fundamentals first · play matters
      </span>
    </div>
  );
}
