import { useSiblingTimeline } from '../../hooks/useSiblingTimeline';
import type { DayEntry } from '../../hooks/useSiblingTimeline';
import type { Intensity } from '@schoolhub/types';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function intensityDotClass(intensity: Intensity): string {
  if (intensity === 'low') return 'bg-game-green';
  if (intensity === 'med') return 'bg-game-yellow';
  return 'bg-game-orange';
}

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

export function SiblingTimeline() {
  const { children, conflicts, suggestions, loading, week, weekLabel, prevWeek, nextWeek } = useSiblingTimeline();

  const monday = isoWeekToMonday(week);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  if (loading) {
    return (
      <div className="card flex flex-col gap-3">
        <div className="h-4 bg-line rounded animate-pulse w-40" />
        {[1, 2].map(n => <div key={n} className="h-8 bg-line rounded animate-pulse" />)}
      </div>
    );
  }

  if (children.length === 0) return null;

  return (
    <div className="card flex flex-col gap-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-ink font-semibold text-sm">Study overview</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevWeek}
            className="text-muted hover:text-ink text-sm px-2 py-1"
            aria-label="Previous week"
          >
            ←
          </button>
          <span className="text-muted text-xs">{weekLabel}</span>
          <button
            type="button"
            onClick={nextWeek}
            className="text-muted hover:text-ink text-sm px-2 py-1"
            aria-label="Next week"
          >
            →
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs" role="grid" aria-label="Weekly study overview">
          <thead>
            <tr>
              <th className="text-left text-muted font-normal pr-3 w-20" scope="col">Child</th>
              {DAY_NAMES.map((day, i) => (
                <th key={day} className="text-center text-muted font-normal w-9" scope="col">
                  {day}
                  <div className="text-muted/60 text-[10px]">{weekDates[i]?.slice(5)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children.map((child) => {
              const dayMap = new Map<string, DayEntry>();
              for (const entry of child.daily) {
                dayMap.set(entry.date, entry);
              }

              return (
                <tr key={child.child_id}>
                  <td className="text-ink font-medium pr-3 py-2 truncate max-w-[80px]">{child.name}</td>
                  {weekDates.map((date, i) => {
                    const entry = dayMap.get(date);
                    const dayName = DAY_NAMES[i] ?? date;
                    return (
                      <td key={date} className="text-center py-2">
                        {entry ? (
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${intensityDotClass(entry.intensity)}`}
                            aria-label={`${dayName}: ${entry.intensity} intensity, ${entry.total_minutes} min`}
                            role="img"
                          />
                        ) : (
                          <span
                            className="inline-block w-3 h-3 rounded-full bg-line"
                            aria-label={`${dayName}: no study scheduled`}
                            role="img"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Intensity legend */}
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-game-green inline-block" aria-hidden="true" /> Light</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-game-yellow inline-block" aria-hidden="true" /> Moderate</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-game-orange inline-block" aria-hidden="true" /> Heavy</span>
      </div>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="flex flex-col gap-2" role="alert">
          {conflicts.map((c, i) => (
            <div key={i} className="flex items-start gap-2 bg-game-orange-tint rounded-xl px-3 py-2">
              <span className="text-game-orange text-sm mt-0.5" aria-hidden="true">⚠</span>
              <div>
                <p className="text-ink text-xs font-medium">{c.date}: overlapping heavy study days</p>
                <p className="text-muted text-xs">{c.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load balance suggestions */}
      {suggestions.map((s, i) => (
        <p key={i} className="text-muted text-xs">{s}</p>
      ))}
    </div>
  );
}
