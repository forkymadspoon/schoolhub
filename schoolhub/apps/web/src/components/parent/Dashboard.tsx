import { useEffect, useState } from 'react';
import type { Child } from '@schoolhub/types';
import { api } from '../../services/api';
import { useSchedule } from '../../hooks/useSchedule';
import { useWellbeing } from '../../hooks/useWellbeing';
import { subscribeToChildEvents } from '../../services/realtime';
import { ChildProfileSwitcher } from './ChildProfileSwitcher';
import { ExamCountdownWidget } from '../shared/ExamCountdownWidget';
import { ScheduleRegenModal } from './ScheduleRegenModal';
import { WellbeingPanel } from './WellbeingPanel';
import { SiblingTimeline } from './SiblingTimeline';
import { NotificationSettings } from './NotificationSettings';
import { DataUpload } from './DataUpload';

function bitesColor(completed: number, total: number): string {
  if (total === 0) return 'bg-line';
  const pct = completed / total;
  if (pct >= 0.8) return 'bg-game-green';
  if (pct >= 0.5) return 'bg-game-yellow';
  return 'bg-game-orange';
}

function wellbeingDotClass(openCount: number): string {
  if (openCount === 0) return 'status-dot status-dot-green';
  if (openCount <= 2)  return 'status-dot status-dot-yellow';
  return 'status-dot status-dot-red';
}

function wellbeingLabel(openCount: number): string {
  if (openCount === 0) return 'All good';
  if (openCount === 1) return '1 signal';
  return `${openCount} signals`;
}

export function Dashboard() {
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [showRegen, setShowRegen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showWellbeing, setShowWellbeing] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);

  // Load children on mount
  useEffect(() => {
    void api.get<Child[]>('/children').then(children => {
      setAllChildren(children);
      const first = children[0];
      if (first) setActiveChild(first);
    }).catch(() => null);
  }, []);

  const childId = activeChild?.id ?? null;
  const { schedule, bitesThisWeek, loading: schedLoading, refresh: refreshSchedule } = useSchedule(childId);
  const { signals, refresh: refreshWellbeing } = useWellbeing(childId);

  // Re-fetch wellbeing signals when a new one fires via Realtime
  useEffect(() => {
    if (!childId) return;
    return subscribeToChildEvents(childId, (event) => {
      if (event.type === 'wellbeing.signal') refreshWellbeing();
    });
  }, [childId, refreshWellbeing]);

  const openSignals = signals.filter(s => !s.resolved_at).length;
  const bTotal = bitesThisWeek?.total ?? 0;
  const bDone  = bitesThisWeek?.completed ?? 0;

  const handleChildSwitch = (id: string) => {
    void api.get<Child>(`/children/${id}`).then(setActiveChild).catch(() => null);
  };

  const handleRegenConfirmed = () => {
    setShowRegen(false);
    refreshSchedule();
  };

  return (
    <div className="min-h-screen bg-bg" data-sen={activeChild?.sen_profile ?? undefined}>
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="bg-surface border-b border-line px-4 py-3 flex items-center justify-between">
        <ChildProfileSwitcher
          activeChildId={childId}
          onSwitch={handleChildSwitch}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotifSettings(true)}
            className="btn-secondary text-sm px-4 py-2"
          >
            Notifications
          </button>
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="btn-secondary text-sm px-4 py-2"
          >
            Upload files
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        {/* ── Exam countdown ───────────────────────────────────────────────── */}
        {childId && (
          <ExamCountdownWidget childId={childId} />
        )}

        {/* ── Schedule cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* This week */}
          <div className="card flex flex-col gap-3">
            <h3 className="text-ink font-semibold text-sm">This week</h3>

            {schedLoading ? (
              <div className="h-2 bg-line rounded-full animate-pulse" />
            ) : schedule ? (
              <>
                {/* Progress bar */}
                <div className="relative h-2 bg-line rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${bitesColor(bDone, bTotal)}`}
                    style={{ width: bTotal > 0 ? `${Math.round((bDone / bTotal) * 100)}%` : '0%' }}
                  />
                </div>
                <p className="text-muted text-sm">
                  {bDone} / {bTotal} {bTotal === 1 ? 'bite' : 'bites'} completed
                </p>
              </>
            ) : (
              <p className="text-muted text-sm">No schedule yet.</p>
            )}

            <button
              type="button"
              onClick={() => setShowRegen(true)}
              disabled={!childId}
              className="btn-secondary text-sm px-4 py-2 self-start mt-auto"
            >
              ↺ Regenerate
            </button>
          </div>

          {/* Wellbeing */}
          <div className="card flex flex-col gap-3">
            <h3 className="text-ink font-semibold text-sm">Wellbeing</h3>
            <div className="flex items-center gap-2">
              <span className={wellbeingDotClass(openSignals)} />
              <span className="text-ink text-sm font-medium">{wellbeingLabel(openSignals)}</span>
            </div>
            {openSignals > 0 && (
              <ul className="flex flex-col gap-1">
                {signals.filter(s => !s.resolved_at).slice(0, 3).map(s => (
                  <li key={s.id} className="text-muted text-xs">
                    {s.signal_type.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            )}
            {openSignals > 0 && (
              <button
                type="button"
                onClick={() => setShowWellbeing(true)}
                className="text-primary text-xs font-medium mt-auto text-left hover:underline"
              >
                View details →
              </button>
            )}
          </div>
        </div>

        {/* ── Sibling timeline (shown when parent has 2+ children) ─────────── */}
        {allChildren.length >= 2 && (
          <SiblingTimeline />
        )}
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showRegen && activeChild && (
        <ScheduleRegenModal
          childId={activeChild.id}
          childName={activeChild.name}
          senProfile={activeChild.sen_profile}
          onClose={() => setShowRegen(false)}
          onConfirmed={handleRegenConfirmed}
        />
      )}

      {showWellbeing && activeChild && (
        <WellbeingPanel
          childId={activeChild.id}
          childName={activeChild.name}
          onClose={() => setShowWellbeing(false)}
        />
      )}

      {showNotifSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
          onClick={() => setShowNotifSettings(false)}
        >
          <div
            className="bg-surface rounded-card shadow-card w-full max-w-lg mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-ink font-semibold text-lg">Notification settings</h2>
              <button
                type="button"
                onClick={() => setShowNotifSettings(false)}
                className="text-muted hover:text-ink text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <NotificationSettings />
          </div>
        </div>
      )}

      {showUpload && activeChild && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
          onClick={() => setShowUpload(false)}
        >
          <div
            className="bg-surface rounded-card shadow-card w-full max-w-lg mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-ink font-semibold text-lg">Upload files</h2>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="text-muted hover:text-ink text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <DataUpload
              childId={activeChild.id}
              onComplete={() => setShowUpload(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
