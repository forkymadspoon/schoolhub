import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Child } from '@schoolhub/types';
import { api } from '../../services/api';
import { useSchedule } from '../../hooks/useSchedule';
import { useWellbeing } from '../../hooks/useWellbeing';
import { useStats } from '../../hooks/useStats';
import { subscribeToChildEvents } from '../../services/realtime';
import { ExamCountdownWidget } from '../shared/ExamCountdownWidget';
import { ScheduleRegenModal } from './ScheduleRegenModal';
import { WellbeingPanel } from './WellbeingPanel';
import { SiblingTimeline } from './SiblingTimeline';
import { NotificationSettings } from './NotificationSettings';
import { DataUpload } from './DataUpload';

// ── Helpers ──────────────────────────────────────────────────────────────────

const CHILD_EMOJIS = ['🦊', '🐼', '🦁', '🐯'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function pct(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function subjectDot(subject: string) {
  if (subject === 'Mathematics') return 'bg-primary';
  if (subject === 'English') return 'bg-accent';
  if (subject === 'Science') return 'bg-game-green';
  return 'bg-primary';
}

function subjectColor(subject: string) {
  if (subject === 'Mathematics') return 'bg-primary/10 border-primary text-primary';
  if (subject === 'English') return 'bg-accent/10 border-accent text-accent';
  if (subject === 'Science') return 'bg-game-green/10 border-game-green text-game-green';
  return 'bg-primary/10 border-primary text-primary';
}

function intensityChip(intensity: string) {
  if (intensity === 'high') return 'bg-game-orange-tint text-game-orange';
  if (intensity === 'low') return 'bg-game-green-tint text-game-green';
  return 'bg-primary-soft text-primary';
}

function badgeEmoji(subject: string) {
  if (subject === 'Mathematics') return '🔢';
  if (subject === 'Science') return '🔬';
  if (subject === 'English') return '📖';
  return '📚';
}

interface ScheduleBite {
  topic_id: string;
  subject: string;
  duration_min: number;
  intensity: string;
  is_review: boolean;
  date: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

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
  const { stats } = useStats(childId);

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

  const allBites: ScheduleBite[] = schedule?.schedule_json
    ? (schedule.schedule_json as { weeks: Array<{ bites: ScheduleBite[] }> })
        .weeks.flatMap(w => w.bites)
    : [];

  const upcomingBites = allBites.filter(b => b.date >= today).slice(0, 6);

  // Derive topic mastery buckets from schedule
  const thisWeekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    return d.toISOString().slice(0, 10);
  })();
  const thisWeekEnd = (() => {
    const d = new Date(thisWeekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  })();

  const thisWeekBites = allBites.filter(b => b.date >= thisWeekStart && b.date <= thisWeekEnd);
  const reviewedSubjects = [...new Set(allBites.filter(b => b.is_review).map(b => b.subject))];
  const thisWeekSubjects = [...new Set(thisWeekBites.map(b => b.subject))];
  const allScheduledSubjects = [...new Set(allBites.map(b => b.subject))];
  const needsAttentionSubjects = allScheduledSubjects.filter(s => !thisWeekSubjects.includes(s) && !reviewedSubjects.includes(s));

  const handleChildSwitch = (id: string) => {
    const child = allChildren.find(c => c.id === id);
    if (child) setActiveChild(child);
    else void api.get<Child>(`/children/${id}`).then(setActiveChild).catch(() => null);
  };

  const handleRegenConfirmed = () => {
    setShowRegen(false);
    refreshSchedule();
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg" data-sen={activeChild?.sen_profile ?? undefined}>

      {/* ── Mobile header ── */}
      <header className="md:hidden bg-surface border-b border-line px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="SchoolHub" className="w-36 h-auto" />
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

      {/* ── Desktop header: greeting + child pills ── */}
      <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-line bg-surface sticky top-0 z-10">
        <div className="flex flex-col gap-1.5">
          <p className="text-muted text-xs">
            {new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-ink font-bold text-xl">{greeting()}</h1>
            {/* Emoji child pills */}
            <div className="flex items-center gap-2">
              {allChildren.map((child, i) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => handleChildSwitch(child.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-sm font-semibold transition-colors ${
                    activeChild?.id === child.id
                      ? 'bg-primary text-white'
                      : 'bg-primary-soft text-primary hover:bg-primary/20'
                  }`}
                >
                  <span>{CHILD_EMOJIS[i % CHILD_EMOJIS.length]}</span>
                  <span>{child.name}</span>
                  <span className="opacity-70 font-normal">{child.grade_level}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
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

        {/* ── Mobile: child pills ── */}
        {allChildren.length > 0 && (
          <div className="md:hidden flex items-center gap-2 flex-wrap">
            {allChildren.map((child, i) => (
              <button
                key={child.id}
                type="button"
                onClick={() => handleChildSwitch(child.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-sm font-semibold transition-colors ${
                  activeChild?.id === child.id
                    ? 'bg-primary text-white'
                    : 'bg-primary-soft text-primary hover:bg-primary/20'
                }`}
              >
                <span>{CHILD_EMOJIS[i % CHILD_EMOJIS.length]}</span>
                <span>{child.name} {child.grade_level}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Exam countdown ── */}
        {childId && <ExamCountdownWidget childId={childId} />}

        {/* ── Quick shortcuts (always visible) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { emoji: '📅', label: 'Plan', sub: 'View schedule', action: () => navigate('/plan') },
            { emoji: '📊', label: 'Progress', sub: 'Badges & XP', action: () => navigate('/progress') },
            { emoji: '💚', label: 'Wellbeing', sub: openSignals > 0 ? `${openSignals} signal${openSignals > 1 ? 's' : ''}` : 'All good', action: () => navigate('/wellbeing') },
            { emoji: '⬆️', label: 'Upload', sub: 'Files & calendars', action: () => setShowUpload(true) },
          ].map(({ emoji, label, sub, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              className="card flex items-center gap-3 py-3 px-4 hover:shadow-card transition-shadow text-left"
            >
              <span className="text-2xl leading-none">{emoji}</span>
              <div>
                <p className="text-ink font-semibold text-sm">{label}</p>
                <p className={`text-xs ${label === 'Wellbeing' && openSignals > 0 ? 'text-game-orange font-medium' : 'text-muted'}`}>{sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Desktop 2-column / Mobile single-column ── */}
        <div className="md:grid md:grid-cols-[1fr_300px] md:gap-6 flex flex-col gap-5">

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
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#D4E3ED" strokeWidth="5" />
                      <circle
                        cx="32" cy="32" r="26"
                        fill="none"
                        stroke={progress >= 80 ? '#87C83C' : progress >= 50 ? '#F4CC48' : '#198ECC'}
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

              {bTotal > 0 && (
                <div className="flex gap-3">
                  <button
                    type="button"
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
              )}
            </div>

            {/* Topic mastery summary */}
            {!schedLoading && (
              <div className="card flex flex-col gap-3">
                <h3 className="text-ink font-semibold text-sm">Topic progress</h3>
                {allBites.length === 0 ? (
                  <p className="text-muted text-xs">Generate a schedule to see topic progress here.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1 rounded-2xl bg-game-green-tint border border-game-green/20 px-3 py-2.5">
                      <p className="text-game-green font-bold text-lg leading-none">{reviewedSubjects.length}</p>
                      <p className="text-game-green text-xs font-medium">Mastered</p>
                      {reviewedSubjects.slice(0, 2).map(s => (
                        <p key={s} className="text-game-green/70 text-[10px] truncate">{s}</p>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1 rounded-2xl bg-game-yellow-tint border border-game-yellow/20 px-3 py-2.5">
                      <p className="text-game-yellow font-bold text-lg leading-none">{thisWeekSubjects.length}</p>
                      <p className="text-game-yellow text-xs font-medium">On Track</p>
                      {thisWeekSubjects.slice(0, 2).map(s => (
                        <p key={s} className="text-game-yellow/80 text-[10px] truncate">{s}</p>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1 rounded-2xl bg-game-orange-tint border border-game-orange/20 px-3 py-2.5">
                      <p className="text-game-orange font-bold text-lg leading-none">{needsAttentionSubjects.length}</p>
                      <p className="text-game-orange text-xs font-medium">Needs Attn</p>
                      {needsAttentionSubjects.slice(0, 2).map(s => (
                        <p key={s} className="text-game-orange/80 text-[10px] truncate">{s}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state: no schedule */}
            {!schedLoading && bTotal === 0 && (
              <div className="card flex flex-col items-center gap-4 py-8 text-center">
                <span className="text-5xl">📚</span>
                <div>
                  <p className="text-ink font-semibold text-base">
                    Ready to build {activeChild?.name ?? 'your child'}'s study plan?
                  </p>
                  <p className="text-muted text-sm mt-1">
                    Upload your school calendar and exam dates to get started.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => setShowUpload(true)}
                    className="btn-primary px-5 py-2.5 text-sm"
                  >
                    ⬆️ Upload files
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegen(true)}
                    disabled={!childId}
                    className="btn-secondary px-5 py-2.5 text-sm"
                  >
                    ✨ Generate schedule
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming sessions */}
            {upcomingBites.length > 0 && (
              <div className="card flex flex-col gap-3">
                <h3 className="text-ink font-semibold text-sm">Upcoming sessions</h3>
                <div className="flex flex-col gap-2">
                  {upcomingBites.map((bite, i) => (
                    <div key={i}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border-l-[3px] bg-surface ${subjectColor(bite.subject)}`}>
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

            {/* Sibling timeline — desktop */}
            {allChildren.length >= 2 && (
              <div className="md:block hidden">
                <SiblingTimeline />
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-5">

            {/* Streak + XP + Badge card */}
            {activeChild?.gamification_enabled !== false && (
              <div className="card flex flex-col gap-3">
                <h3 className="text-ink font-semibold text-sm">Achievements</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-2xl font-extrabold text-ink leading-none">
                      {stats ? stats.streak : '—'}
                    </p>
                    <p className="text-muted text-[10px]">🔥 streak</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-2xl font-extrabold text-ink leading-none">
                      {stats ? stats.total_xp : '—'}
                    </p>
                    <p className="text-muted text-[10px]">⚡ XP</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {stats?.recent_badge ? (
                      <>
                        <p className="text-2xl leading-none">{badgeEmoji(stats.recent_badge.subject)}</p>
                        <p className="text-muted text-[10px] capitalize">{stats.recent_badge.tier}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl leading-none text-muted">🏅</p>
                        <p className="text-muted text-[10px]">No badge yet</p>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/progress')}
                  className="btn-secondary text-xs px-3 py-2 self-start"
                >
                  View all →
                </button>
              </div>
            )}

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
                <p className="text-muted text-xs">No active signals. Keep going! 🌱</p>
              )}
            </div>

            {/* Sibling timeline — mobile */}
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
