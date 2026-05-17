import { useEffect, useState, useCallback } from 'react';
import type { Child } from '@schoolhub/types';
import { api } from '../../services/api';
import { useSchedule } from '../../hooks/useSchedule';
import { ScheduleRegenModal } from './ScheduleRegenModal';
import { DataUpload } from './DataUpload';
import { SiblingTimeline } from './SiblingTimeline';
import { SubjectIcon } from '../shared/SubjectIcon';
import FireIcon from '../../assets/icons/misc/fire.svg?react';
import BulbIcon from '../../assets/icons/interface/bulb.svg?react';
import CrossIcon from '../../assets/icons/interface/cross.svg?react';
import SyncIcon from '../../assets/icons/interface/sync.svg?react';
import UploadIcon from '../../assets/icons/interface/upload.svg?react';
import CalendarIcon from '../../assets/icons/interface/calendar.svg?react';
import TreeIcon from '../../assets/icons/interface/tree.svg?react';
import ArrowIcon from '../../assets/icons/interface/arrow.svg?react';
import { getNextBreak, formatBreakDate } from '../../data/singaporeCalendar';

interface ScheduleBite {
  topic_id: string;
  subject: string;
  duration_min: number;
  intensity: string;
  is_review: boolean;
  date: string;
}

interface TodayBiteRow {
  id: string;
  bite_id: string | null;
  planned_date: string;
  completed_at: string | null;
}

interface TodayResponse {
  bites: TodayBiteRow[];
  streak_days: number;
}

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

function intensityBg(intensity: string) {
  if (intensity === 'high') return 'bg-game-orange-tint border-game-orange/30';
  if (intensity === 'low')  return 'bg-game-green-tint border-game-green/30';
  return 'bg-primary-soft border-primary/20';
}

export function PlanPage() {
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [view, setView] = useState<'today' | 'timeline' | 'calendar'>('today');
  const [showRegen, setShowRegen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [todayData, setTodayData] = useState<TodayResponse | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    void api.get<Child[]>('/children').then(children => {
      const first = children[0];
      if (first) {
        setActiveChild(first);
        setChecklist([
          { id: '1', text: `${first.name}: 20–30 min focused practice on weak topics, 4–5×/week`, done: false },
          { id: '2', text: `${first.name}: Review key concepts before each study session`, done: false },
          { id: '3', text: `${first.name}: Protect 9+ hrs sleep and 1 unstructured day each week`, done: false },
        ]);
      }
    }).catch(() => null);
  }, []);

  const fetchToday = useCallback(() => {
    if (!activeChild) return;
    void api.get<TodayResponse>(`/bites/${activeChild.id}/today`)
      .then(setTodayData)
      .catch(() => null);
  }, [activeChild]);

  useEffect(() => { fetchToday(); }, [fetchToday]);

  const childId = activeChild?.id ?? null;
  const { schedule, loading: schedLoading, refresh } = useSchedule(childId);

  const weeks = schedule?.schedule_json
    ? (schedule.schedule_json as { weeks: Array<{ week_number: number; date_range: string; bites: ScheduleBite[]; notes: string }> }).weeks
    : [];

  const doneBites = todayData?.bites.filter(b => b.completed_at).length ?? 0;
  const totalBites = todayData?.bites.length ?? 0;
  const streakDays = todayData?.streak_days ?? 0;

  const toggleChecklist = (id: string) =>
    setChecklist(prev => prev.map(it => it.id === id ? { ...it, done: !it.done } : it));
  const removeChecklist = (id: string) =>
    setChecklist(prev => prev.filter(it => it.id !== id));

  return (
    <div className="flex flex-col gap-4">
      {/* My Checklist */}
      {checklist.length > 0 && (
        <div className="card flex flex-col gap-3">
          <div>
            <h2 className="text-ink font-bold text-sm">My checklist</h2>
            <p className="text-primary text-[11px] font-bold uppercase tracking-wide mt-0.5">
              This week · {activeChild?.name ?? ''}
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {checklist.map(item => (
              <li key={item.id} className="flex items-center gap-3 bg-bg border border-line rounded-2xl px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleChecklist(item.id)}
                  className="flex-shrink-0 cursor-pointer accent-primary"
                  style={{ width: '1em', height: '1em', fontSize: '0.875rem' }}
                  aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
                />
                <p className={`flex-1 text-sm leading-snug ${item.done ? 'line-through text-muted' : 'text-ink'}`}>
                  {item.text}
                </p>
                <button
                  type="button"
                  onClick={() => removeChecklist(item.id)}
                  className="text-muted hover:text-ink flex-shrink-0"
                  aria-label="Remove"
                >
                  <CrossIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tab switcher */}
      <div className="rounded-pill bg-surface border border-line p-1 flex text-xs font-semibold">
        {(['today', 'timeline', 'calendar'] as const).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-pill capitalize transition-colors ${
              view === v ? 'bg-primary text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {v === 'today' ? 'Today' : v === 'timeline' ? 'Timeline' : 'Calendar'}
          </button>
        ))}
      </div>

      {/* Today tab */}
      {view === 'today' && (
        <div className="flex flex-col gap-3">
          {/* Next Break card */}
          <NextBreakCard />

          {/* Streak banner */}
          <div className="rounded-card bg-primary px-4 py-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <FireIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-wide">
                {activeChild ? `${activeChild.name.toUpperCase()}'S STREAK` : 'YOUR STREAK'}
              </p>
              <p className="text-white font-bold text-2xl leading-tight">{streakDays} days</p>
            </div>
          </div>

          {/* Today's bite goal */}
          <div className="card flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-ink font-bold text-sm">
                  {totalBites > 0 ? `Today's ${totalBites}-bite goal` : "Today's study goal"}
                </p>
                <p className="text-muted text-xs mt-0.5">Small steps. Big wins.</p>
              </div>
              {totalBites > 0 && (
                <div className="text-right shrink-0">
                  <p className="text-primary font-bold text-xl leading-none">{doneBites}/{totalBites}</p>
                  <p className="text-muted text-xs mt-0.5">done</p>
                </div>
              )}
            </div>
            {totalBites > 0 && (
              <div className="h-1.5 bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((doneBites / totalBites) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Focus Mode card */}
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center flex-shrink-0">
              <BulbIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-ink font-semibold text-sm">Focus Mode</p>
              <p className="text-muted text-xs">ADHD-friendly · 1 task, no distractions</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline tab */}
      {view === 'timeline' && (
        <div className="flex flex-col gap-4">
          {/* Sibling overview grid */}
          <SiblingTimeline />

          {/* Actions + weekly plan */}
          <WeeklyPlanSection
            weeks={weeks}
            loading={schedLoading}
            onUpload={() => setShowUpload(true)}
            onRegen={() => setShowRegen(true)}
            canRegen={!!childId}
          />
        </div>
      )}

      {/* Calendar tab */}
      {view === 'calendar' && (
        <div className="card flex flex-col items-center py-12 gap-3">
          <CalendarIcon className="w-10 h-10 opacity-20" />
          <p className="text-muted text-sm">Calendar view coming soon.</p>
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
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40"
          onClick={() => setShowUpload(false)}
        >
          <div
            className="bg-surface rounded-t-card sm:rounded-card shadow-card w-full max-w-lg mx-0 sm:mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-ink font-semibold text-lg">Upload files</h2>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="text-muted hover:text-ink text-xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <DataUpload childId={activeChild.id} onComplete={() => setShowUpload(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

interface WeeklyPlanSectionProps {
  weeks: Array<{ week_number: number; date_range: string; bites: ScheduleBite[]; notes: string }>;
  loading: boolean;
  onUpload: () => void;
  onRegen: () => void;
  canRegen: boolean;
}

function WeeklyPlanSection({ weeks, loading, onUpload, onRegen, canRegen }: WeeklyPlanSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card flex flex-col gap-3">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-left"
      >
        <div>
          <h3 className="text-ink font-semibold text-sm">Weekly plan</h3>
          <p className="text-muted text-xs mt-0.5">Full bite-by-bite schedule</p>
        </div>
        <span className={`text-muted text-sm transition-transform ${open ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </button>

      {open && (
        <>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onUpload}
              className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <UploadIcon className="w-3.5 h-3.5" />
              Upload files
            </button>
            <button
              type="button"
              onClick={onRegen}
              disabled={!canRegen}
              className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <SyncIcon className="w-3.5 h-3.5" />
              Regenerate
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-16 bg-line rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : weeks.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">
              No schedule yet. Complete onboarding to generate one.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {weeks.map(week => (
                <div key={week.week_number} className="bg-bg border border-line rounded-2xl p-3 flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-ink font-semibold text-xs">Week {week.week_number}</p>
                    <span className="text-muted text-[10px]">{week.date_range}</span>
                  </div>
                  {week.notes && (
                    <p className="text-muted text-[10px] italic">{week.notes}</p>
                  )}
                  <div className="flex flex-col gap-1.5">
                    {week.bites.map((bite, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 ${intensityBg(bite.intensity)}`}
                      >
                        <SubjectIcon subject={bite.subject} className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-ink text-xs font-medium truncate">
                            {bite.subject}{bite.is_review ? ' — Review' : ''}
                          </p>
                          <p className="text-muted text-[10px]">{bite.date} · {bite.duration_min} min</p>
                        </div>
                        <span className="text-muted text-[10px] capitalize shrink-0">{bite.intensity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NextBreakCard() {
  const next = getNextBreak();
  if (!next) return null;

  const isToday = next.daysAway === 0;
  const label = isToday ? 'today' : `${next.daysAway} days`;

  return (
    <div className="card flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-game-green-tint flex items-center justify-center flex-shrink-0">
        <TreeIcon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-muted text-[10px] font-bold uppercase tracking-wide">Next Break</p>
        <p className="text-ink font-semibold text-sm truncate">{next.name}</p>
        <p className="text-muted text-xs">{formatBreakDate(next.date)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-primary font-bold text-lg leading-none">{isToday ? '🎉' : next.daysAway}</p>
        <p className="text-muted text-xs">{isToday ? '' : 'days'}</p>
      </div>
      <ArrowIcon className="w-4 h-4 text-muted opacity-40 flex-shrink-0" />
    </div>
  );
}
