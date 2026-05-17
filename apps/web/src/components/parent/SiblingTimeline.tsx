import { useSiblingTimeline } from '../../hooks/useSiblingTimeline';
import type { DayEntry } from '../../hooks/useSiblingTimeline';
import type { Intensity } from '@schoolhub/types';
import { fmtDate } from '../../lib/utils';
import CautionIcon from '../../assets/icons/interface/caution.svg?react';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function isoWeekToMonday(isoWeekStr: string): Date {
  const parts = isoWeekStr.split('-W');
  const year = parseInt(parts[0] ?? '0', 10);
  const week = parseInt(parts[1] ?? '1', 10);
  const jan4 = new Date(year, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7;
  const mon = new Date(jan4);
  mon.setDate(jan4.getDate() - jan4Day + (week - 1) * 7);
  return mon;
}

interface CellProps {
  entry: DayEntry | undefined;
  isToday: boolean;
  isConflict: boolean;
}

function DayCell({ entry, isToday, isConflict }: CellProps) {
  const base =
    'rounded-xl border flex flex-col items-center justify-center py-1.5 min-h-[52px] gap-0.5 transition-colors relative';

  if (!entry) {
    return (
      <div
        className={`${base} border-dashed border-line ${isToday ? 'border-primary/30' : ''}`}
        aria-label="no study scheduled"
      />
    );
  }

  const { intensity, bite_count, total_minutes } = entry;

  const styles: Record<Intensity, string> = {
    low:  'bg-game-green-tint border-game-green/25 text-game-green',
    med:  'bg-game-yellow-tint border-game-yellow/30 text-ink',
    high: 'bg-game-orange-tint border-game-orange/35 text-game-orange',
  };

  const conflictStyle = isConflict ? 'ring-2 ring-game-orange/60' : '';
  const todayStyle = isToday ? 'ring-2 ring-primary/50' : '';

  return (
    <div
      className={`${base} ${styles[intensity]} ${conflictStyle} ${todayStyle}`}
      aria-label={`${bite_count} bites, ${total_minutes} min, ${intensity} intensity`}
    >
      {isConflict && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-game-orange flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">!</span>
        </span>
      )}
      <p className="text-xs font-bold leading-none">{bite_count}</p>
      <p className="text-[9px] leading-none opacity-70">{total_minutes}m</p>
    </div>
  );
}

export function SiblingTimeline() {
  const { children, conflicts, suggestions, loading, week, weekLabel, prevWeek, nextWeek } =
    useSiblingTimeline();

  const monday = isoWeekToMonday(week);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const today = new Date().toISOString().slice(0, 10);
  const conflictDates = new Set(conflicts.flatMap(c => [c.date]));

  if (loading) {
    return (
      <div className="card flex flex-col gap-3">
        <div className="h-4 bg-line rounded animate-pulse w-32" />
        {[1, 2].map(n => (
          <div key={n} className="grid grid-cols-8 gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 bg-line rounded-xl animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (children.length === 0) return null;

  return (
    <div className="card flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-ink font-semibold text-sm">
            {children.length > 1 ? 'Sibling timeline' : 'Study overview'}
          </h3>
          <p className="text-muted text-xs mt-0.5">
            {children.length > 1 ? 'Side-by-side weekly load' : 'Weekly study load'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevWeek}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary-soft text-muted hover:text-primary transition-colors text-sm"
            aria-label="Previous week"
          >
            ←
          </button>
          <span className="text-xs text-ink font-medium px-1">{weekLabel}</span>
          <button
            type="button"
            onClick={nextWeek}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary-soft text-muted hover:text-primary transition-colors text-sm"
            aria-label="Next week"
          >
            →
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto -mx-1">
        <div className="min-w-[480px] px-1">
          {/* Day header row */}
          <div
            className="grid gap-1 mb-2"
            style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}
          >
            <div />
            {DAY_NAMES.map((day, i) => {
              const date = weekDates[i];
              const isToday = date === today;
              return (
                <div key={day} className="text-center">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide ${
                      isToday ? 'text-primary' : 'text-muted'
                    }`}
                  >
                    {day}
                  </p>
                  <p
                    className={`text-[10px] ${
                      isToday
                        ? 'text-primary font-semibold'
                        : 'text-muted opacity-60'
                    }`}
                  >
                    {date?.slice(5).replace('-', '/')}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Child rows */}
          {children.map((child, idx) => {
            const dayMap = new Map<string, DayEntry>();
            for (const entry of child.daily) dayMap.set(entry.date, entry);

            // Avatar colour cycles through a palette
            const avatarBg = ['bg-primary-soft', 'bg-game-green-tint', 'bg-game-yellow-tint', 'bg-game-orange-tint'][
              idx % 4
            ];
            const avatarText = ['text-primary', 'text-game-green', 'text-ink', 'text-game-orange'][idx % 4];

            return (
              <div
                key={child.child_id}
                className="grid gap-1 mb-2 items-center"
                style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}
              >
                {/* Child label */}
                <div className="flex items-center gap-1.5 pr-1">
                  <div
                    className={`w-6 h-6 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className={`${avatarText} text-[10px] font-bold`}>
                      {child.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-ink text-xs font-semibold truncate leading-tight">
                      {child.name}
                    </p>
                    <p className="text-muted text-[9px] leading-tight">{child.grade_level}</p>
                  </div>
                </div>

                {/* Day cells */}
                {weekDates.map((date) => (
                  <DayCell
                    key={date}
                    entry={dayMap.get(date)}
                    isToday={date === today}
                    isConflict={conflictDates.has(date)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted pt-1 border-t border-line">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-game-green-tint border border-game-green/25 inline-block" />
          Light
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-game-yellow-tint border border-game-yellow/30 inline-block" />
          Moderate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-game-orange-tint border border-game-orange/35 inline-block" />
          Heavy
        </span>
        <span className="text-muted/50">· Cell = bites / minutes</span>
      </div>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-ink text-xs font-semibold flex items-center gap-1.5">
            <CautionIcon className="w-3.5 h-3.5" />
            {conflicts.length === 1 ? '1 conflict detected' : `${conflicts.length} conflicts detected`}
          </p>
          {conflicts.map((c, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 bg-game-orange-tint border border-game-orange/25 rounded-xl px-3 py-2.5"
            >
              <CautionIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-game-orange" />
              <div>
                <p className="text-ink text-xs font-semibold">
                  {fmtDate(c.date)}: {c.children.join(' & ')} overlap
                </p>
                <p className="text-muted text-xs mt-0.5">{c.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load-balance suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-1.5 -mt-1">
          {suggestions.map((s, i) => (
            <p key={i} className="text-muted text-xs flex items-start gap-1.5">
              <span className="text-primary mt-0.5 shrink-0">·</span>
              {s}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
