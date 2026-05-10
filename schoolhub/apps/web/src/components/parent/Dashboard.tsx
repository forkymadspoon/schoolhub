import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function pct(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function subjectColor(subject: string) {
  if (subject === 'Mathematics') return 'bg-primary/10 border-primary text-primary';
  if (subject === 'English') return 'bg-accent/10 border-accent text-accent';
  if (subject === 'Science') return 'bg-game-green/10 border-game-green text-game-green';
  return 'bg-primary/10 border-primary text-primary';
}

function subjectDot(subject: string) {
  if (subject === 'Mathematics') return 'bg-primary';
  if (subject === 'English') return 'bg-accent';
  if (subject === 'Science') return 'bg-game-green';
  return 'bg-primary';
}

function intensityChip(intensity: string) {
  if (intensity === 'high') return 'bg-game-orange-tint text-game-orange';
  if (intensity === 'low') return 'bg-game-green-tint text-game-green';
  return 'bg-primary-soft text-primary';
}

interface ScheduleBite {
  topic_id: string;
  subject: string;
  duration_min: number;
  intensity: string;
  is_review: boolean;
  date: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [showRegen, setShowRegen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showWellbeing, setShowWellbeing] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);

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

  useEffect(() => {
    if (!childId) return;
    return subscribeToChildEvents(childId, (event) => {
      if (event.type === 'wellbeing.signal') refreshWellbeing();
    });
  }, [childId, refreshWellbeing]);

  const openSignals = signals.filter(s => !s.resolved_at).length;
  const bTotal = bitesThisWeek?.total ?? 0;
  const bDone  = bitesThisWeek?.completed ?? 0;
  const progress = pct(bDone, bTotal);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingBites: ScheduleBite[] = schedule?.schedule_json
    ? (schedule.schedule_json as { weeks: Array<{ bites: ScheduleBite[] }> })
        .weeks
        .flatMap(w => w.bites)
        .filter(b => b.date >= today)
        .slice(0, 6)
    : [];

  const handleChildSwitch = (id: string) => {
    void api.get<Child>(`/children/${id}`).then(setActiveChild).catch(() => null);
  };

  const handleRegenConfirmed = () => {
    setShowRegen(false);
    refreshSchedule();
  };

  return (
    <div className="min-h-screen bg-bg" data-sen={activeChild?.sen_profile ?? undefined}>

      {/* ── Mobile header (hidden on desktop — sidebar handles nav) ── */}
      <header className="md:hidden bg-surface border-b border-line px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="/icon-light.svg" alt="SchoolHub" className="h-7 w-7" />
          <ChildProfileSwitcher activeChildId={childId} onSwitch={handleChildSwitch} />
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowNotifSettings(true)}
            className="btn-secondary text-xs px-3 py-2">
            Notifications
          </button>
          <button type="button" onClick={() => setShowUpload(true)}
            className="btn-secondary text-xs px-3 py-2">
            Upload
          </button>
        </div>
      </header>

      {/* ── Desktop page header ── */}
      <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-line bg-surface sticky top-0 z-10">
        <div>
          <h1 className="text-ink font-bold text-xl">
            {activeChild ? `${activeChild.name}'s Dashboard` : 'Dashboard'}
          </h1>
          <p className="text-muted text-sm mt-0.5">
            {new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ChildProfileSwitcher activeChildId={childId} onSwitch={handleChildSwitch} />
          <button type="button" onClick={() => setShowNotifSettings(true)}
            className="btn-secondary text-sm px-4 py-2">
            Notifications
          </button>
          <button type="button" onClick={() => setShowUpload(true)}
            className="btn-secondary text-sm px-4 py-2">
            Upload files
          </button>
        </div>
      </header>

      <main className="px-4 md:px-8 py-5 pb-24 md:pb-8 flex flex-col gap-5">

        {/* ── Exam countdown ── */}
        {childId && <ExamCountdownWidget childId={childId} />}

        {/* ── Desktop 2-column layout / Mobile single-column ── */}
        <div className="md:grid md:grid-cols-[1fr_320px] md:gap-6 flex flex-col gap-5">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-5">

            {/* Hero: this week */}
            <div className="card flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-1">This week</p>
                  {schedLoading ? (
                    <div className="h-8 w-24 bg-line rounded-lg animate-pulse" />
                  ) : (
                    <p className="text-4xl font-extrabold text-ink leading-none">
                      {bDone}<span className="text-muted text-xl font-medium">/{bTotal}</span>
                    </p>
                  )}
                  <p className="text-muted text-xs mt-1">bites completed</p>
                </div>
                {bTotal > 0 && (
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#E2DCFF" strokeWidth="5" />
                      <circle
                        cx="32" cy="32" r="26"
                        fill="none"
                        stroke={progress >= 80 ? '#22C55E' : progress >= 50 ? '#F59E0B' : '#7C5CFC'}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink">
                      {progress}%
                    </span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={!childId || schedLoading}
                  onClick={() => navigate('/plan')}
                  className="btn-primary flex-1 py-3 text-sm"
                >
                  View schedule →
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegen(true)}
                  disabled={!childId}
                  className="btn-secondary px-4 py-3 text-sm"
                  aria-label="Regenerate schedule"
                >
                  ↺
                </button>
              </div>
            </div>

            {/* Upcoming bites / schedule timeline */}
            {upcomingBites.length > 0 && (
              <div className="card flex flex-col gap-3">
                <h3 className="text-ink font-semibold text-sm">Upcoming sessions</h3>
                <div className="flex flex-col gap-2">
                  {upcomingBites.map((bite, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border-l-[3px] bg-surface ${subjectColor(bite.subject)}`}
                      style={{ borderLeftWidth: '3px' }}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${subjectDot(bite.subject)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-ink text-sm font-medium truncate">{bite.subject}</p>
                        <p className="text-muted text-xs">{bite.date} · {bite.duration_min} min</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-pill ${intensityChip(bite.intensity)}`}>
                        {bite.intensity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sibling timeline — desktop puts it in left col */}
            {allChildren.length >= 2 && (
              <div className="md:block hidden">
                <SiblingTimeline />
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-5">

            {/* Wellbeing card */}
            <div className="card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-ink font-semibold text-sm">Wellbeing</h3>
                <div className="flex items-center gap-2">
                  <span className={
                    openSignals === 0 ? 'status-dot status-dot-green' :
                    openSignals <= 2  ? 'status-dot status-dot-yellow' :
                                        'status-dot status-dot-red'
                  } />
                  <span className="text-muted text-xs">
                    {openSignals === 0 ? 'All good' : openSignals === 1 ? '1 signal' : `${openSignals} signals`}
                  </span>
                </div>
              </div>
              {openSignals > 0 ? (
                <>
                  <ul className="flex flex-col gap-1">
                    {signals.filter(s => !s.resolved_at).slice(0, 3).map(s => (
                      <li key={s.id} className="text-muted text-xs capitalize flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-game-orange flex-shrink-0" />
                        {s.signal_type.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setShowWellbeing(true)}
                    className="btn-secondary text-xs px-4 py-2 self-start"
                  >
                    View details →
                  </button>
                </>
              ) : (
                <p className="text-muted text-xs">No active signals. Keep going!</p>
              )}
            </div>

            {/* Sibling timeline — mobile shows here */}
            {allChildren.length >= 2 && (
              <div className="md:hidden">
                <SiblingTimeline />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Modals ── */}
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40"
          onClick={() => setShowNotifSettings(false)}>
          <div className="bg-surface rounded-t-card sm:rounded-card shadow-card w-full max-w-lg mx-0 sm:mx-4 p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-ink font-semibold text-lg">Notification settings</h2>
              <button type="button" onClick={() => setShowNotifSettings(false)}
                className="text-muted hover:text-ink text-xl leading-none min-h-0 min-w-0" aria-label="Close">×</button>
            </div>
            <NotificationSettings />
          </div>
        </div>
      )}

      {showUpload && activeChild && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40"
          onClick={() => setShowUpload(false)}>
          <div className="bg-surface rounded-t-card sm:rounded-card shadow-card w-full max-w-lg mx-0 sm:mx-4 p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-ink font-semibold text-lg">Upload files</h2>
              <button type="button" onClick={() => setShowUpload(false)}
                className="text-muted hover:text-ink text-xl leading-none min-h-0 min-w-0" aria-label="Close">×</button>
            </div>
            <DataUpload childId={activeChild.id} onComplete={() => setShowUpload(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
