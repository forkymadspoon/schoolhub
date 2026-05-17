import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Child } from '@schoolhub/types';
import { api } from '../../services/api';
import { useSchedule } from '../../hooks/useSchedule';
import { useWellbeing } from '../../hooks/useWellbeing';
import { useStats } from '../../hooks/useStats';
import { subscribeToChildEvents } from '../../services/realtime';
import { ExamCountdownWidget } from '../shared/ExamCountdownWidget';
import { PsleChip } from '../shared/PsleChip';
import { SubjectIcon } from '../shared/SubjectIcon';
import NoteIcon from '../../assets/icons/interface/note.svg?react';
import { ScheduleRegenModal } from './ScheduleRegenModal';
import { WellbeingPanel } from './WellbeingPanel';
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

function subjectColor(subject: string) {
  if (subject === 'Mathematics') return { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', dot: 'bg-primary', bar: '#198ECC' };
  if (subject === 'English')     return { bg: 'bg-accent/40',  border: 'border-accent/50',  text: 'text-primary-dark', dot: 'bg-primary-dark', bar: '#146E9F' };
  if (subject === 'Science')     return { bg: 'bg-game-green-tint', border: 'border-game-green/30', text: 'text-game-green', dot: 'bg-game-green', bar: '#87C83C' };
  if (subject === 'Chinese')     return { bg: 'bg-game-yellow-tint', border: 'border-game-yellow/30', text: 'text-game-yellow', dot: 'bg-game-yellow', bar: '#F4CC48' };
  return { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', dot: 'bg-primary', bar: '#198ECC' };
}

function intensityChip(intensity: string) {
  if (intensity === 'high') return 'bg-game-orange-tint text-game-orange';
  if (intensity === 'low')  return 'bg-game-green-tint text-game-green';
  return 'bg-primary-soft text-primary';
}


function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric' });
}

interface ScheduleBite {
  topic_id: string;
  subject: string;
  duration_min: number;
  intensity: string;
  is_review: boolean;
  date: string;
}

// ── MiniCalendar ──────────────────────────────────────────────────────────────

function MiniCalendar({ biteDates, selected, onSelect }: {
  biteDates: Set<string>;
  selected: string;
  onSelect: (date: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthLabel = now.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });

  // First Monday on or before the 1st of the month
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // 0=Mon…6=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function isoFor(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return (
    <div>
      <p className="text-ink font-semibold text-sm mb-3">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-y-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted pb-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = isoFor(day);
          const isToday    = iso === today;
          const isSelected = iso === selected;
          const hasBite    = biteDates.has(iso);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(iso)}
              className={`relative flex flex-col items-center justify-center rounded-lg py-0.5 text-xs font-medium transition-colors
                ${isSelected && !isToday ? 'bg-primary-soft text-primary ring-1 ring-primary' : ''}
                ${isToday ? 'bg-primary text-white' : 'hover:bg-bg text-ink'}
              `}
            >
              {day}
              {hasBite && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isToday ? 'bg-white/70' : 'bg-primary'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [activeChild, setActiveChild]         = useState<Child | null>(null);
  const [allChildren, setAllChildren]         = useState<Child[]>([]);
  const [showRegen, setShowRegen]             = useState(false);
  const [showUpload, setShowUpload]           = useState(false);
  const [showWellbeing, setShowWellbeing]     = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [selectedDate, setSelectedDate]       = useState<string>(today);

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
  const bTotal    = bitesThisWeek?.total ?? 0;
  const bDone     = bitesThisWeek?.completed ?? 0;
  const progress  = pct(bDone, bTotal);

  const allBites: ScheduleBite[] = schedule?.schedule_json
    ? (schedule.schedule_json as { weeks: Array<{ bites: ScheduleBite[] }> })
        .weeks.flatMap(w => w.bites)
    : [];

  // Next 20 bites from today
  const upcomingBites = allBites.filter(b => b.date >= today).slice(0, 20);

  // This week range
  const thisWeekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().slice(0, 10);
  })();
  const thisWeekEnd = (() => {
    const d = new Date(thisWeekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  })();
  const thisWeekBites = allBites.filter(b => b.date >= thisWeekStart && b.date <= thisWeekEnd);

  // Weekly progress per subject
  const subjectList = [...new Set(thisWeekBites.map(b => b.subject))];
  const subjectProgress = subjectList.map(subject => {
    const subjectBites = thisWeekBites.filter(b => b.subject === subject);
    const done = subjectBites.filter(b => b.is_review).length;
    return { subject, done, total: subjectBites.length, pct: pct(done, subjectBites.length) };
  });

  // Calendar bite dates
  const biteDates = new Set(allBites.map(b => b.date));

  // Selected day's sessions
  const selectedDayBites = allBites.filter(b => b.date === selectedDate);

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
    <div className="min-h-screen bg-bg flex flex-col" data-sen={activeChild?.sen_profile ?? undefined}>

      {/* ── Mobile header ── */}
      <header className="md:hidden bg-surface border-b border-line px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <img src="/logo.svg" alt="SchoolHub" className="w-32 h-auto" />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowNotifSettings(true)}
            className="btn-secondary text-xs px-3 py-2">Notifications</button>
          <button type="button" onClick={() => setShowUpload(true)}
            className="btn-secondary text-xs px-3 py-2">Upload</button>
        </div>
      </header>

      {/* ── Desktop header ── */}
      <header className="hidden md:flex items-center justify-between px-8 border-b border-line bg-surface sticky top-0 z-10 h-[90px]">
        <div className="flex flex-col gap-1.5">
          <p className="text-muted text-xs">
            {new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-ink font-bold text-xl">{greeting()}</h1>
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
              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-pill text-sm font-semibold transition-colors border border-dashed border-line text-muted hover:border-primary hover:text-primary min-h-0"
              >
                + Add child
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowNotifSettings(true)}
            className="btn-secondary text-sm px-4 py-2">Notifications</button>
          <button type="button" onClick={() => setShowUpload(true)}
            className="btn-secondary text-sm px-4 py-2">Upload files</button>
        </div>
      </header>

      {/* ── Mobile: child pills ── */}
      <div className="md:hidden flex items-center gap-2 flex-wrap px-4 pt-3">
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
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-pill text-sm font-semibold transition-colors border border-dashed border-line text-muted hover:border-primary hover:text-primary min-h-0"
        >
          + Add child
        </button>
      </div>

      {/* ── Main two-column body ── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_280px] overflow-hidden">

        {/* ═══════════ LEFT COLUMN ═══════════ */}
        <div className="flex flex-col gap-5 px-4 md:px-8 py-5 pb-24 md:pb-8 overflow-y-auto">

          {/* Exam countdown / PSLE context chip */}
          {activeChild && (
            <div className="flex items-center gap-2 flex-wrap">
              <PsleChip gradeLevel={activeChild.grade_level} />
              <ExamCountdownWidget childId={activeChild.id} gradeLevel={activeChild.grade_level} />
            </div>
          )}

          {/* Compact hero card */}
          <div className="card flex items-center gap-4 py-4 px-5">
            <div className="flex-1 min-w-0">
              <p className="text-muted text-[11px] font-semibold uppercase tracking-wide mb-1">This week</p>
              {schedLoading ? (
                <div className="h-6 w-24 bg-line rounded-lg animate-pulse mb-2" />
              ) : (
                <p className="text-2xl font-extrabold text-ink leading-none mb-2">
                  {bDone}<span className="text-muted text-base font-medium">/{bTotal} bites</span>
                </p>
              )}
              {bTotal > 0 && (
                <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: progress >= 80 ? '#87C83C' : progress >= 50 ? '#F4CC48' : '#198ECC',
                    }}
                  />
                </div>
              )}
            </div>
            {bTotal > 0 ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/plan')}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  View plan →
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegen(true)}
                  disabled={!childId}
                  className="btn-secondary px-3 py-2 text-sm"
                  aria-label="Regenerate schedule"
                >↺</button>
              </div>
            ) : (
              !schedLoading && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button type="button" onClick={() => setShowUpload(true)} className="btn-primary py-2 px-4 text-sm">
                    ⬆️ Upload files
                  </button>
                  <button type="button" onClick={() => setShowRegen(true)} disabled={!childId} className="btn-secondary py-2 px-4 text-sm">
                    ✨ Generate
                  </button>
                </div>
              )
            )}
          </div>

          {/* Schedule list */}
          <div className="card flex flex-col gap-0 overflow-hidden p-0">
            <div className="px-5 py-3 border-b border-line flex items-center justify-between">
              <h3 className="text-ink font-semibold text-sm">Upcoming sessions</h3>
              {upcomingBites.length > 0 && (
                <span className="text-muted text-xs">{upcomingBites.length} sessions</span>
              )}
            </div>

            {schedLoading ? (
              <div className="flex flex-col gap-0">
                {[1, 2, 3].map(i => (
                  <div key={i} className="px-5 py-3 border-b border-line last:border-0 flex items-center gap-3">
                    <div className="w-14 h-10 bg-line rounded-lg animate-pulse flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-3.5 w-28 bg-line rounded animate-pulse" />
                      <div className="h-3 w-16 bg-line rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingBites.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center px-5">
                <NoteIcon className="w-10 h-10" />
                <p className="text-ink font-semibold text-sm">
                  Ready to build {activeChild?.name ?? 'your child'}'s study plan?
                </p>
                <p className="text-muted text-xs">Upload your school calendar and exam dates to get started.</p>
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setShowUpload(true)} className="btn-primary px-4 py-2 text-xs">⬆️ Upload files</button>
                  <button type="button" onClick={() => setShowRegen(true)} disabled={!childId} className="btn-secondary px-4 py-2 text-xs">✨ Generate schedule</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {upcomingBites.map((bite, i) => {
                  const c = subjectColor(bite.subject);
                  const isSelected = bite.date === selectedDate;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedDate(bite.date)}
                      className={`flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-bg ${isSelected ? 'bg-primary-soft/50' : ''}`}
                    >
                      {/* Date chip */}
                      <div className={`flex-shrink-0 w-14 rounded-xl px-1.5 py-2 text-center ${c.bg} border ${c.border}`}>
                        <p className={`text-[10px] font-bold uppercase ${c.text}`}>
                          {new Date(bite.date + 'T00:00:00').toLocaleDateString('en-SG', { weekday: 'short' })}
                        </p>
                        <p className={`text-lg font-extrabold leading-tight ${c.text}`}>
                          {new Date(bite.date + 'T00:00:00').getDate()}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-ink text-sm font-semibold truncate">{bite.subject}</p>
                        <p className="text-muted text-xs">{bite.duration_min} min{bite.is_review ? ' · Review' : ''}</p>
                      </div>

                      {/* Intensity */}
                      <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-pill ${intensityChip(bite.intensity)}`}>
                        {bite.intensity}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly progress bars */}
          {subjectProgress.length > 0 && (
            <div className="card flex flex-col gap-3">
              <h3 className="text-ink font-semibold text-sm">This week's progress</h3>
              <div className="flex flex-col gap-3">
                {subjectProgress.map(({ subject, done, total, pct: p }) => {
                  const c = subjectColor(subject);
                  return (
                    <div key={subject} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                          <p className="text-ink text-xs font-medium">{subject}</p>
                        </div>
                        <p className="text-muted text-xs">{done}/{total} · {p}%</p>
                      </div>
                      <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${p}%`, background: c.bar }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ RIGHT COLUMN ═══════════ */}
        <div className="hidden md:flex flex-col gap-5 px-5 py-5 border-l border-line bg-surface overflow-y-auto">

          {/* Mini calendar */}
          <div className="card p-4">
            <MiniCalendar
              biteDates={biteDates}
              selected={selectedDate}
              onSelect={setSelectedDate}
            />
          </div>

          {/* Selected day's sessions */}
          <div className="card flex flex-col gap-3 p-4">
            <h3 className="text-ink font-semibold text-sm">
              {selectedDate === today ? "Today's sessions" : fmtDate(selectedDate)}
            </h3>
            {selectedDayBites.length === 0 ? (
              <p className="text-muted text-xs">No sessions {selectedDate === today ? 'today' : 'on this day'}.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedDayBites.map((bite, i) => {
                  const c = subjectColor(bite.subject);
                  return (
                    <div key={i} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border ${c.bg} ${c.border}`}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${c.text}`}>{bite.subject}</p>
                        <p className="text-muted text-[11px]">{bite.duration_min} min</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${intensityChip(bite.intensity)}`}>
                        {bite.intensity}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Achievements */}
          {activeChild?.gamification_enabled !== false && (
            <div className="card flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-ink font-semibold text-sm">Achievements</h3>
                <button type="button" onClick={() => navigate('/progress')}
                  className="text-primary text-xs hover:underline">View all →</button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col gap-0.5">
                  <p className="text-xl font-extrabold text-ink leading-none">{stats ? stats.streak : '—'}</p>
                  <p className="text-muted text-[10px]">🔥 streak</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xl font-extrabold text-ink leading-none">{stats ? stats.total_xp : '—'}</p>
                  <p className="text-muted text-[10px]">⚡ XP</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  {stats?.recent_badge ? (
                    <>
                      <SubjectIcon subject={stats.recent_badge.subject} className="w-5 h-5" />
                      <p className="text-muted text-[10px] capitalize">{stats.recent_badge.tier}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl leading-none text-muted">🏅</p>
                      <p className="text-muted text-[10px]">No badge yet</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Wellbeing */}
          <div className="card flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-ink font-semibold text-sm">Wellbeing</h3>
              <div className="flex items-center gap-1.5">
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
                <button type="button" onClick={() => setShowWellbeing(true)}
                  className="btn-secondary text-xs px-3 py-1.5 self-start">
                  View details →
                </button>
              </>
            ) : (
              <p className="text-muted text-xs">No active signals. Keep going! 🌱</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile: right-panel items stacked below ── */}
      <div className="md:hidden flex flex-col gap-4 px-4 pb-24">
        {/* Achievements */}
        {activeChild?.gamification_enabled !== false && (
          <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-ink font-semibold text-sm">Achievements</h3>
              <button type="button" onClick={() => navigate('/progress')} className="text-primary text-xs hover:underline">View all →</button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col gap-0.5">
                <p className="text-2xl font-extrabold text-ink leading-none">{stats ? stats.streak : '—'}</p>
                <p className="text-muted text-[10px]">🔥 streak</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-2xl font-extrabold text-ink leading-none">{stats ? stats.total_xp : '—'}</p>
                <p className="text-muted text-[10px]">⚡ XP</p>
              </div>
              <div className="flex flex-col gap-0.5">
                {stats?.recent_badge ? (
                  <>
                    <SubjectIcon subject={stats.recent_badge.subject} className="w-6 h-6" />
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
          </div>
        )}
        {/* Wellbeing */}
        <div className="card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-ink font-semibold text-sm">Wellbeing</h3>
            <div className="flex items-center gap-2">
              <span className={openSignals === 0 ? 'status-dot status-dot-green' : openSignals <= 2 ? 'status-dot status-dot-yellow' : 'status-dot status-dot-red'} />
              <span className="text-muted text-xs">{openSignals === 0 ? 'All good' : `${openSignals} signal${openSignals > 1 ? 's' : ''}`}</span>
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
              <button type="button" onClick={() => setShowWellbeing(true)} className="btn-secondary text-xs px-4 py-2 self-start">View details →</button>
            </>
          ) : (
            <p className="text-muted text-xs">No active signals. Keep going! 🌱</p>
          )}
        </div>
      </div>

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
                className="text-muted hover:text-ink text-xl leading-none" aria-label="Close">×</button>
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
                className="text-muted hover:text-ink text-xl leading-none" aria-label="Close">×</button>
            </div>
            <DataUpload childId={activeChild.id} onComplete={() => setShowUpload(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
