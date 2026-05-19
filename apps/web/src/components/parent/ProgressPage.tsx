import { useEffect, useState } from 'react';
import type { Child } from '@schoolhub/types';
import { api } from '../../services/api';
import { useSchedule } from '../../hooks/useSchedule';
import { useActiveChild } from '../../hooks/useActiveChild';
import { useStats } from '../../hooks/useStats';
import { SubjectIcon } from '../shared/SubjectIcon';
import FireIcon from '../../assets/icons/misc/fire.svg?react';

const SUBJECTS = ['English', 'Mathematics', 'Science'];

const BADGE_TIERS = [
  { tier: 'bronze', label: 'First 10 bites', threshold: 10 },
  { tier: 'silver', label: '30 bites', threshold: 30 },
  { tier: 'gold', label: '100 bites', threshold: 100 },
];


const TIER_COLORS: Record<string, string> = {
  bronze: 'bg-[#F4C68020] border-[#F4C680]',
  silver: 'bg-[#C0C0C020] border-[#C0C0C0]',
  gold: 'bg-game-yellow-tint border-game-yellow',
};

function pct(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function ProgressPage() {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id ?? null;
  const { bitesThisWeek, loading: schedLoading } = useSchedule(childId);
  const { stats, loading: statsLoading } = useStats(childId);

  const bDone = bitesThisWeek?.completed ?? 0;
  const bTotal = bitesThisWeek?.total ?? 0;
  const progress = pct(bDone, bTotal);

  // Determine which badges are unlocked from recent_badge + total_xp heuristic
  // Real data: in future this would come from a /children/:id/badges endpoint.
  // For now, derive from stats gracefully.
  const recentBadge = stats?.recent_badge ?? null;

  const loading = schedLoading || statsLoading;

  return (
    <div className="flex flex-col gap-5">
      {/* Completion summary */}
      <div className="card flex flex-col gap-3">
        <h3 className="text-ink font-semibold text-sm">This week</h3>
        {loading ? (
          <div className="h-8 w-32 bg-line rounded-lg animate-pulse" />
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-ink">{bDone}</p>
                <p className="text-muted text-xs">bites done</p>
              </div>
              <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-ink">{bTotal}</p>
                <p className="text-muted text-xs">total</p>
              </div>
            </div>
            {bTotal === 0 && (
              <p className="text-xs text-muted text-center italic">
                Complete bites in the student view to see progress here.
              </p>
            )}
          </>
        )}
      </div>

      {/* XP + Streak */}
      <div className="card flex items-center gap-6">
        <div className="text-center flex-1">
          <p className="text-3xl font-extrabold text-ink leading-none">
            {statsLoading ? '—' : (stats?.streak ?? 0)}
          </p>
          <p className="text-muted text-xs mt-0.5 inline-flex items-center gap-1"><FireIcon className="w-3.5 h-3.5" /> day streak</p>
        </div>
        <div className="w-px h-10 bg-line" />
        <div className="text-center flex-1">
          <p className="text-3xl font-extrabold text-ink leading-none">
            {statsLoading ? '—' : (stats?.total_xp ?? 0)}
          </p>
          <p className="text-muted text-xs mt-0.5">total XP</p>
        </div>
      </div>

      {/* Badges */}
      <div className="card flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-ink font-semibold text-sm">Badges</h3>
          {recentBadge && (
            <span className="text-muted text-xs">
              <span className="inline-flex items-center gap-1">Latest: <SubjectIcon subject={recentBadge.subject} className="w-3.5 h-3.5 inline" /> {recentBadge.subject} {recentBadge.tier}</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {SUBJECTS.flatMap(subject =>
            BADGE_TIERS.map(({ tier, label: _label }) => {
              const unlocked =
                recentBadge?.subject === subject && recentBadge?.tier === tier;
              return (
                <div
                  key={`${subject}-${tier}`}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 ${
                    unlocked ? TIER_COLORS[tier] : 'opacity-40 bg-primary-soft/30 border-line'
                  }`}
                >
                  <SubjectIcon subject={subject} className="w-6 h-6" />
                  <p className="text-ink text-[10px] font-semibold text-center capitalize">{tier}</p>
                  <p className="text-muted text-[9px] text-center">{subject}</p>
                </div>
              );
            })
          )}
        </div>
        <p className="text-muted text-[10px]">
          Bronze · 10 bites &nbsp;·&nbsp; Silver · 30 bites &nbsp;·&nbsp; Gold · 100 bites per subject
        </p>
      </div>

      {/* Weekly report card */}
      <div className="card flex flex-col gap-3 opacity-60">
        <div className="flex items-center justify-between">
          <h3 className="text-ink font-semibold text-sm">Weekly report card</h3>
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-pill">Scholar+</span>
        </div>
        <p className="text-muted text-xs">
          A shareable 1080×1350 progress card is generated every Sunday at 22:00 SGT and available Monday morning.
        </p>
        <button type="button" disabled className="btn-secondary text-sm py-2 self-start opacity-40">
          Upgrade to unlock
        </button>
      </div>
    </div>
  );
}
