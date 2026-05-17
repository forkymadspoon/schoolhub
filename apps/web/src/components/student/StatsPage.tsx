import { SubjectIcon } from '../shared/SubjectIcon';
import FireIcon from '../../assets/icons/misc/fire.svg?react';

const BADGES = [
  { subject: 'English',     tier: 'bronze', done: 0, target: 10 },
  { subject: 'Mathematics', tier: 'bronze', done: 0, target: 10 },
  { subject: 'Science',     tier: 'bronze', done: 0, target: 10 },
];

export function StatsPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* XP + streak summary */}
      <div className="card flex gap-4">
        <div className="flex-1 text-center">
          <p className="text-3xl font-extrabold text-primary">0</p>
          <p className="text-muted text-xs">XP total</p>
        </div>
        <div className="w-px bg-line self-stretch" />
        <div className="flex-1 text-center">
          <p className="text-3xl font-extrabold text-ink">0</p>
          <p className="text-muted text-xs inline-flex items-center gap-1">day streak <FireIcon className="w-3.5 h-3.5" /></p>
        </div>
        <div className="w-px bg-line self-stretch" />
        <div className="flex-1 text-center">
          <p className="text-3xl font-extrabold text-ink">0</p>
          <p className="text-muted text-xs">bites done</p>
        </div>
      </div>

      {/* Badges */}
      <div className="card flex flex-col gap-4">
        <h3 className="text-ink font-semibold text-sm">Badges</h3>
        <div className="flex flex-col gap-3">
          {BADGES.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <SubjectIcon subject={b.subject} className="w-6 h-6 opacity-40" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <p className="text-ink text-sm font-medium">{b.subject} — {b.tier}</p>
                  <p className="text-muted text-xs">{b.done}/{b.target}</p>
                </div>
                <div className="h-2 bg-line rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.round((b.done / b.target) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-muted text-xs text-center">Complete bites to earn badges!</p>
      </div>

      {/* Leaderboard — Scholar Pro gate */}
      <div className="card flex flex-col gap-3 opacity-60">
        <div className="flex items-center justify-between">
          <h3 className="text-ink font-semibold text-sm">Leaderboard</h3>
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-pill">Scholar+</span>
        </div>
        <p className="text-muted text-xs">Anonymous opt-in leaderboard. Upgrade to join.</p>
      </div>
    </div>
  );
}
