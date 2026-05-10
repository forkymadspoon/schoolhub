import { useEffect, useState } from 'react';
import type { Child } from '@schoolhub/types';
import { api } from '../../services/api';
import { useSchedule } from '../../hooks/useSchedule';
import { ScheduleRegenModal } from './ScheduleRegenModal';
import { DataUpload } from './DataUpload';

interface ScheduleBite {
  topic_id: string;
  subject: string;
  duration_min: number;
  intensity: string;
  is_review: boolean;
  date: string;
}

function subjectEmoji(subject: string) {
  if (subject === 'Mathematics') return '🔢';
  if (subject === 'Science') return '🔬';
  if (subject === 'English') return '📖';
  return '📚';
}

function intensityBg(intensity: string) {
  if (intensity === 'high') return 'bg-game-orange-tint border-game-orange/30';
  if (intensity === 'low')  return 'bg-game-green-tint border-game-green/30';
  return 'bg-primary-soft border-primary/20';
}

export function PlanPage() {
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [showRegen, setShowRegen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    void api.get<Child[]>('/children').then(children => {
      const first = children[0];
      if (first) setActiveChild(first);
    }).catch(() => null);
  }, []);

  const childId = activeChild?.id ?? null;
  const { schedule, loading, refresh } = useSchedule(childId);

  // Group bites by week
  const weeks = schedule?.schedule_json
    ? (schedule.schedule_json as { weeks: Array<{ week_number: number; date_range: string; bites: ScheduleBite[]; notes: string }> }).weeks
    : [];

  return (
    <div className="flex flex-col gap-5">
      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="btn-primary flex-1 py-3 text-sm"
        >
          Upload files
        </button>
        <button
          type="button"
          onClick={() => setShowRegen(true)}
          disabled={!childId}
          className="btn-secondary flex-1 py-3 text-sm"
        >
          ↺ Regenerate
        </button>
      </div>

      {/* Schedule */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-24 bg-surface rounded-card animate-pulse" />
          ))}
        </div>
      ) : weeks.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-muted text-sm">No schedule yet. Complete onboarding to generate one.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {weeks.map(week => (
            <div key={week.week_number} className="card flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <h3 className="text-ink font-semibold text-sm">Week {week.week_number}</h3>
                <span className="text-muted text-xs">{week.date_range}</span>
              </div>
              {week.notes && (
                <p className="text-muted text-xs italic">{week.notes}</p>
              )}
              <div className="flex flex-col gap-2">
                {week.bites.map((bite, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${intensityBg(bite.intensity)}`}
                  >
                    <span className="text-lg leading-none">{subjectEmoji(bite.subject)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-ink text-sm font-medium truncate">
                        {bite.subject}{bite.is_review ? ' — Review' : ''}
                      </p>
                      <p className="text-muted text-xs">{bite.date} · {bite.duration_min} min</p>
                    </div>
                    <span className="text-muted text-xs capitalize shrink-0">{bite.intensity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showRegen && activeChild && (
        <ScheduleRegenModal
          childId={activeChild.id}
          childName={activeChild.name}
          senProfile={activeChild.sen_profile}
          onClose={() => setShowRegen(false)}
          onConfirmed={() => { setShowRegen(false); refresh(); }}
        />
      )}

      {showUpload && activeChild && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40"
          onClick={() => setShowUpload(false)}>
          <div className="bg-surface rounded-t-card sm:rounded-card shadow-card w-full max-w-lg mx-0 sm:mx-4 p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-ink font-semibold text-lg">Upload files</h2>
              <button type="button" onClick={() => setShowUpload(false)}
                className="text-muted hover:text-ink text-xl" aria-label="Close">×</button>
            </div>
            <DataUpload childId={activeChild.id} onComplete={() => setShowUpload(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
