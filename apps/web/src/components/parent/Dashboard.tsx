import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useActiveChild } from '../../hooks/useActiveChild';
import type { Child, WellbeingSignal } from '@schoolhub/types';
import type { GradeLevel } from '@schoolhub/types';
import { useSchedule } from '../../hooks/useSchedule';
import { useWellbeing } from '../../hooks/useWellbeing';
import { useStats } from '../../hooks/useStats';
import { subscribeToChildEvents } from '../../services/realtime';
import { ScheduleRegenModal } from './ScheduleRegenModal';
import { WellbeingPanel } from './WellbeingPanel';
import CalendarIcon   from '../../assets/icons/interface/calendar.svg?react';
import ChecklistIcon  from '../../assets/icons/interface/checklist.svg?react';
import BellIcon       from '../../assets/icons/interface/bell.svg?react';
import TargetIcon     from '../../assets/icons/interface/target.svg?react';
import TreeIcon       from '../../assets/icons/interface/tree.svg?react';
import HeartIcon      from '../../assets/icons/interface/heart.svg?react';
import TickIcon       from '../../assets/icons/interface/tick.svg?react';
import SyncIcon       from '../../assets/icons/interface/sync.svg?react';
import CautionIcon    from '../../assets/icons/interface/caution.svg?react';
import BookmarkIcon   from '../../assets/icons/interface/bookmark.svg?react';
import { getNextBreak, formatBreakDate } from '../../data/singaporeCalendar';

// ── Helpers ───────────────────────────────────────────────────────────────────

const CHILD_EMOJIS = ['🦊', '🐼', '🦁', '🐯'];
const AVATAR_BG   = ['bg-primary-soft', 'bg-game-green-tint', 'bg-game-yellow-tint', 'bg-game-orange-tint'];
const AVATAR_TEXT = ['text-primary', 'text-game-green', 'text-ink', 'text-game-orange'];
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

function pct(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

// ── NextBreakDashCard ─────────────────────────────────────────────────────────

function NextBreakDashCard() {
  const next = getNextBreak();
  if (!next) return null;
  const isToday = next.daysAway === 0;
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
        <p className="text-primary font-bold text-xl leading-none">{isToday ? '🎉' : next.daysAway}</p>
        {!isToday && <p className="text-muted text-xs">days</p>}
      </div>
    </div>
  );
}

// ── TodaySiblingTimeline ──────────────────────────────────────────────────────

function TodaySiblingTimeline({ children, activeChild }: { children: Child[]; activeChild: Child | null }) {
  const displayChildren = children.length > 0 ? children : activeChild ? [activeChild] : [];
  const title = displayChildren.length > 1 ? 'Today · Sibling timeline' : "Today's schedule";
  const colCount = Math.max(displayChildren.length, 1);

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div>
        <h3 className="text-ink font-semibold text-sm">{title}</h3>
        <p className="text-muted text-xs mt-0.5">Side-by-side schedule</p>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${colCount * 72 + 32}px` }}>
          {/* Child column headers */}
          <div className="grid mb-2" style={{ gridTemplateColumns: `32px repeat(${colCount}, 1fr)` }}>
            <div />
            {displayChildren.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full ${AVATAR_BG[i % 4]} flex items-center justify-center`}>
                  <span className="text-xs leading-none">{CHILD_EMOJIS[i % CHILD_EMOJIS.length]}</span>
                </div>
                <p className="text-ink text-[10px] font-semibold truncate">{child.name}</p>
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {HOURS.map(h => (
            <div
              key={h}
              className="grid border-t border-line py-2"
              style={{ gridTemplateColumns: `32px repeat(${colCount}, 1fr)` }}
            >
              <span className="text-muted text-[10px] leading-none">{String(h).padStart(2, '0')}</span>
              {Array.from({ length: colCount }).map((_, i) => (
                <div key={i} className="h-3" />
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="text-muted text-[10px] text-center border-t border-line pt-2">
        Add tuition, CCA or activities in the Plan to see the side-by-side schedule.
      </p>
    </div>
  );
}

// ── GradeInsightCard ──────────────────────────────────────────────────────────

interface GradeInsight {
  eyebrow: string;
  headline: string;
  bullets: string[];
  note: string;
}

function gradeInsight(grade: GradeLevel): GradeInsight {
  if (grade === 'P6') return {
    eyebrow: 'PSLE PREP',
    headline: 'Every session counts this year',
    bullets: [
      'Focus on weak topics — 30 min, 5×/week',
      'Past paper practice from Term 2 onward',
      'Protect sleep — rest is part of the plan',
    ],
    note: 'Pace over pressure',
  };
  if (grade === 'P5') return {
    eyebrow: 'PSLE PREP · 1 YEAR OUT',
    headline: 'Steady habits beat last-minute cramming',
    bullets: [
      '20–30 min of focused practice on weak topics, 4–5×/week',
      'Start light timed practice on familiar paper sections',
      'Protect 9+ hrs sleep and 1 unstructured day each week',
    ],
    note: 'Pace over pressure',
  };
  if (grade === 'P4') return {
    eyebrow: 'LEARNING INSIGHT',
    headline: 'Science joins the mix — explore together',
    bullets: [
      'Short daily bites beat weekend cramming',
      'Explore Science concepts through real-world examples',
      'Reading widely strengthens every subject',
    ],
    note: 'Curiosity is the best study skill',
  };
  if (grade === 'P3') return {
    eyebrow: 'LEARNING INSIGHT',
    headline: 'Now is the time to build great habits',
    bullets: [
      'Consistent 20-min sessions work better than long ones',
      'Let them explain what they learned — it cements it',
      'Praise effort, not just correct answers',
    ],
    note: 'Habits formed now last for years',
  };
  if (grade === 'K2') return {
    eyebrow: 'P1 READINESS',
    headline: 'Play and routine are the foundation',
    bullets: [
      'Read together for 10 min every night',
      'Count, sing, and explore — it all counts',
      'Consistent bedtime matters more than worksheets',
    ],
    note: 'Confidence is the best P1 prep',
  };
  return {
    eyebrow: 'LEARNING INSIGHT',
    headline: 'Build the daily habit now',
    bullets: [
      '10–15 min of reading every night adds up fast',
      'Short, fun practice beats long sessions',
      'Ask "what was interesting today?" — not "what score?"',
    ],
    note: 'Love of learning is the real goal',
  };
}

function GradeInsightCard({
  gradeLevel,
  childName: _childName,
  onViewPlan,
}: {
  gradeLevel: GradeLevel;
  childName: string;
  onViewPlan: () => void;
}) {
  const insight = gradeInsight(gradeLevel);
  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center flex-shrink-0 mt-0.5">
          <BookmarkIcon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">{insight.eyebrow}</p>
          <p className="text-ink font-semibold text-sm leading-snug">{insight.headline}</p>
        </div>
      </div>
      <ul className="flex flex-col gap-1.5 pl-1">
        {insight.bullets.map(b => (
          <li key={b} className="flex items-start gap-2 text-muted text-xs leading-snug">
            <span className="text-primary mt-0.5 shrink-0">·</span>
            {b}
          </li>
        ))}
      </ul>
      <p className="text-muted text-[10px] flex items-center gap-1.5 border-t border-line pt-2">
        <span className="w-3.5 h-3.5 rounded-full border border-muted/40 flex items-center justify-center text-[8px] shrink-0">i</span>
        {insight.note}
      </p>
      <button type="button" onClick={onViewPlan} className="btn-primary text-xs py-2 w-full">
        View Plan →
      </button>
    </div>
  );
}

// ── WellbeingNudgeCard ────────────────────────────────────────────────────────

function WellbeingNudgeCard({
  signals,
  childName,
  acknowledge,
  onRefresh,
}: {
  signals: WellbeingSignal[];
  childName: string;
  acknowledge: (id: string, action: 'accepted' | 'modified' | 'dismissed') => Promise<void>;
  onRefresh: () => void;
}) {
  const open = signals.filter(s => !s.resolved_at);
  const first = open[0];

  function signalLabel(type: string) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  async function handleAck(action: 'accepted' | 'modified' | 'dismissed') {
    if (!first) return;
    await acknowledge(first.id, action);
    onRefresh();
  }

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center flex-shrink-0 mt-0.5">
          <HeartIcon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">WELLBEING NUDGE</p>
          <p className="text-ink font-semibold text-sm leading-snug">
            {first ? signalLabel(first.signal_type) : 'All clear'}
          </p>
        </div>
      </div>
      <p className="text-muted text-xs leading-relaxed">
        {first
          ? first.recommended_action
          : `No active signals — ${childName} is on track.`}
      </p>
      {first && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleAck('accepted')}
            className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
          >
            <TickIcon className="w-3 h-3" /> Accept
          </button>
          <button
            type="button"
            onClick={() => void handleAck('modified')}
            className="flex-1 btn-secondary py-2 text-xs"
          >
            Modify
          </button>
          <button
            type="button"
            onClick={() => void handleAck('dismissed')}
            className="flex-1 btn-secondary py-2 text-xs"
          >
            × Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showRegen, setShowRegen]           = useState(false);
  const [showWellbeing, setShowWellbeing]   = useState(false);
  const [planGenerating, setPlanGenerating] = useState(
    (location.state as { planGenerating?: boolean } | null)?.planGenerating ?? false
  );

  const { activeChild, allChildren } = useActiveChild();

  const childId = activeChild?.id ?? null;
  const { schedule, bitesThisWeek, loading: schedLoading, refresh: refreshSchedule } = useSchedule(childId);
  const { signals, acknowledge, refresh: refreshWellbeing } = useWellbeing(childId);
  const { stats } = useStats(childId);

  // Poll every 5s until schedule appears, then dismiss the banner
  useEffect(() => {
    if (!planGenerating || !childId) return;
    if (schedule !== null) { setPlanGenerating(false); return; }
    const id = setInterval(() => { refreshSchedule(); }, 5000);
    return () => clearInterval(id);
  }, [planGenerating, childId, schedule, refreshSchedule]);

  useEffect(() => {
    if (!childId) return;
    return subscribeToChildEvents(childId, event => {
      if (event.type === 'wellbeing.signal') refreshWellbeing();
    });
  }, [childId, refreshWellbeing]);

  const openSignals = signals.filter(s => !s.resolved_at).length;
  const bTotal   = bitesThisWeek?.total ?? 0;
  const bDone    = bitesThisWeek?.completed ?? 0;
  const progress = pct(bDone, bTotal);

  const statusLabel =
    bTotal === 0      ? 'GETTING STARTED' :
    progress >= 60    ? 'ON TRACK'         :
                        'NEEDS ATTENTION';

  function insightText() {
    if (bTotal === 0) return `Let's build ${activeChild?.name ?? 'your child'}'s first study plan.`;
    if ((stats?.streak ?? 0) > 0) return `${stats!.streak}-day streak — keep the momentum going.`;
    if (progress >= 80) return `Great pace! ${activeChild?.name ?? 'Your child'} is ahead of schedule.`;
    return 'Steady progress builds lasting results.';
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-bg flex flex-col" data-sen={activeChild?.sen_profile ?? undefined}>

      {/* Plan generating banner */}
      {planGenerating && (
        <div className="mx-4 md:mx-6 mt-4 rounded-card bg-primary-soft border border-primary/20 px-4 py-3 flex items-center gap-3">
          <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
          <p className="text-sm text-primary font-medium flex-1">
            Your plan is being generated in the background — this usually takes under a minute.
          </p>
          <button
            type="button"
            onClick={() => setPlanGenerating(false)}
            className="text-primary/50 hover:text-primary text-lg leading-none min-h-0 flex-shrink-0"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Two-column body */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_300px] overflow-hidden">

        {/* ═══ LEFT COLUMN ═══ */}
        <div className="flex flex-col gap-4 px-4 md:px-6 py-5 pb-24 md:pb-8 overflow-y-auto">

          {/* 1. Blue hero card */}
          <div className="rounded-card bg-primary px-5 py-6 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -right-2 top-16 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

            <div className="flex items-center justify-between z-10">
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{statusLabel}</p>
              {activeChild && <p className="text-white text-xs font-semibold">{activeChild.name}</p>}
            </div>

            {schedLoading ? (
              <div className="h-14 w-40 bg-white/20 rounded-xl animate-pulse" />
            ) : (
              <div className="z-10">
                <p className="text-white font-black leading-none text-5xl">
                  {progress}%
                  <span className="text-white/60 text-xl font-medium ml-2">this week</span>
                </p>
                <p className="text-white/70 text-sm mt-1.5">{bDone} of {bTotal} bites completed</p>
              </div>
            )}

            {bTotal > 0 && (
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden z-10">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <p className="text-white/80 text-sm leading-snug z-10">{insightText()}</p>
          </div>

          {/* 2. Quick actions */}
          <div className="grid grid-cols-4 gap-3">
            {([
              { Icon: CalendarIcon,  label: 'Calendar', bg: 'bg-primary-soft',     action: () => navigate('/plan'),          badge: 0 },
              { Icon: ChecklistIcon, label: 'Tasks',    bg: 'bg-game-yellow-tint', action: () => navigate('/plan'),          badge: 0 },
              { Icon: TargetIcon,    label: 'Exams',    bg: 'bg-game-orange-tint', action: () => navigate('/plan'),          badge: 0 },
              { Icon: BellIcon,      label: 'Alerts',   bg: 'bg-game-green-tint',  action: () => setShowWellbeing(true), badge: openSignals },
            ] as const).map(({ Icon, label, bg, action, badge }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="card flex flex-col items-center gap-1.5 py-3 px-1 hover:bg-primary-soft/30 transition-colors relative"
              >
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                {badge > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-game-orange flex items-center justify-center text-white text-[9px] font-bold">
                    {badge}
                  </span>
                )}
                <p className="text-ink text-xs font-medium">{label}</p>
              </button>
            ))}
          </div>

          {/* 3. Next Break */}
          <NextBreakDashCard />

          {/* 4. Topics */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-ink font-bold text-sm">
                {activeChild?.name ?? 'Your child'}'s topics
              </h2>
              <button type="button" onClick={() => navigate('/progress')}
                className="text-primary text-xs hover:underline">
                View all →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([
                { Icon: TickIcon,    bg: 'bg-game-green-tint',  count: 0, label: 'MASTERED'  },
                { Icon: SyncIcon,   bg: 'bg-game-yellow-tint', count: 0, label: 'WORKING'   },
                { Icon: CautionIcon, bg: 'bg-game-orange-tint', count: 0, label: 'ATTENTION' },
              ] as const).map(({ Icon, bg, count, label }) => (
                <div key={label} className="card flex flex-col gap-2 p-3">
                  <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-ink leading-none">{count}</p>
                  <p className="text-muted text-[10px] font-bold uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile-only: wellbeing nudge */}
          {activeChild && (
            <div className="md:hidden">
              <WellbeingNudgeCard
                signals={signals}
                childName={activeChild.name}
                acknowledge={acknowledge}
                onRefresh={refreshWellbeing}
              />
            </div>
          )}
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="hidden md:flex flex-col gap-4 px-4 py-5 border-l border-line bg-surface overflow-y-auto">

          {/* 1. Today · Sibling timeline */}
          <TodaySiblingTimeline children={allChildren} activeChild={activeChild} />

          {/* 2. Grade insight */}
          {activeChild && (
            <GradeInsightCard
              gradeLevel={activeChild.grade_level}
              childName={activeChild.name}
              onViewPlan={() => navigate('/plan')}
            />
          )}

          {/* 3. Wellbeing nudge */}
          {activeChild && (
            <WellbeingNudgeCard
              signals={signals}
              childName={activeChild.name}
              acknowledge={acknowledge}
              onRefresh={refreshWellbeing}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showRegen && activeChild && (
        <ScheduleRegenModal
          childId={activeChild.id}
          childName={activeChild.name}
          senProfile={activeChild.sen_profile}
          onClose={() => setShowRegen(false)}
          onConfirmed={() => { setShowRegen(false); refreshSchedule(); }}
        />
      )}


{showWellbeing && activeChild && (
        <WellbeingPanel
          childId={activeChild.id}
          childName={activeChild.name}
          onClose={() => setShowWellbeing(false)}
        />
      )}

    </div>
  );
}
