import { useState, useEffect, useCallback } from 'react';
import type { Bite, SENProfile } from '@schoolhub/types';
import { api } from '../../services/api';
import { subscribeToChildEvents } from '../../services/realtime';
import { StreakBanner } from './StreakBanner';
import { BiteViewer } from './BiteViewer';
import { FocusMode } from './FocusMode';

interface TodayBiteRow {
  id: string;
  bite_id: string | null;
  planned_date: string;
  completed_at: string | null;
  bites: Bite | null;
  topics: { topic_name: string } | null;
}

interface TodayResponse {
  bites: TodayBiteRow[];
  streak_days: number;
}

interface Props {
  childId: string;
  senProfile: SENProfile;
}

export function DailyGoal({ childId, senProfile }: Props) {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TodayBiteRow | null>(null);
  const [totalXp, setTotalXp] = useState(0);

  const fetchToday = useCallback(() => {
    setLoading(true);
    void api
      .get<TodayResponse>(`/bites/${childId}/today`)
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [childId]);

  useEffect(() => { fetchToday(); }, [fetchToday]);

  useEffect(() => {
    return subscribeToChildEvents(childId, (event) => {
      if (event.type === 'xp.awarded') {
        setTotalXp(prev => prev + event.xp_delta);
      }
    });
  }, [childId]);

  if (selected?.bites) {
    if (senProfile === 'ADHD') {
      return (
        <FocusMode
          bite={selected.bites}
          scheduleBiteId={selected.id}
          childId={childId}
          onDone={() => { setSelected(null); fetchToday(); }}
        />
      );
    }
    return (
      <BiteViewer
        bite={selected.bites}
        scheduleBiteId={selected.id}
        childId={childId}
        senProfile={senProfile}
        onBack={() => { setSelected(null); fetchToday(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-line px-4 py-3 flex items-center justify-between">
        <h1 className="text-ink font-semibold text-sm">Today's plan</h1>
        {totalXp > 0 && (
          <span className="text-primary font-bold text-xs">{totalXp} XP</span>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <StreakBanner streakDays={data?.streak_days ?? 0} />

        {loading ? (
          <div className="card flex flex-col gap-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-14 bg-line rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !data || data.bites.length === 0 ? (
          <div className="card">
            <p className="text-muted text-sm text-center py-4">No bites scheduled for today.</p>
          </div>
        ) : (
          <div className="card flex flex-col gap-3">
            <h2 className="text-ink font-semibold text-sm">
              {data.bites.length} {data.bites.length === 1 ? 'bite' : 'bites'} today
            </h2>
            {data.bites.map(row => (
              <BiteTile
                key={row.id}
                row={row}
                onTap={() => { if (row.bites && !row.completed_at) setSelected(row); }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BiteTile({
  row,
  onTap,
}: {
  row: TodayBiteRow;
  onTap: () => void;
}) {
  const title = row.bites?.content_json.title ?? row.topics?.topic_name ?? 'Study session';
  const duration = row.bites?.duration_min;
  const done = !!row.completed_at;
  const canTap = !!row.bites && !done;

  return (
    <button
      type="button"
      disabled={!canTap}
      onClick={onTap}
      className={[
        'flex items-center gap-3 rounded-2xl border p-3 text-left w-full transition-colors',
        done
          ? 'bg-game-green-tint border-game-green/30 opacity-80'
          : canTap
          ? 'bg-surface border-line hover:border-primary/50'
          : 'bg-surface border-line opacity-50 cursor-default',
      ].join(' ')}
    >
      <span className="text-xl" role="img" aria-label="bite">📚</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${done ? 'text-muted line-through' : 'text-ink'}`}>
          {title}
        </p>
        {duration != null && (
          <p className="text-muted text-xs">{duration} min</p>
        )}
      </div>
      {done ? (
        <span className="text-game-green text-sm font-bold shrink-0">✓</span>
      ) : canTap ? (
        <span className="text-muted text-sm shrink-0">→</span>
      ) : null}
    </button>
  );
}
