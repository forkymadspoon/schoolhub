const BADGES = [
  { subject: 'English',     tier: 'bronze', label: 'First 10 bites', locked: false, emoji: '📖' },
  { subject: 'Mathematics', tier: 'bronze', label: 'First 10 bites', locked: true,  emoji: '🔢' },
  { subject: 'Science',     tier: 'bronze', label: 'First 10 bites', locked: true,  emoji: '🔬' },
  { subject: 'English',     tier: 'silver', label: '30 bites',        locked: true,  emoji: '📖' },
  { subject: 'Mathematics', tier: 'silver', label: '30 bites',        locked: true,  emoji: '🔢' },
  { subject: 'Science',     tier: 'silver', label: '30 bites',        locked: true,  emoji: '🔬' },
];

const tierColor: Record<string, string> = {
  bronze: 'bg-[#F4C68020] border-[#F4C680]',
  silver: 'bg-[#C0C0C020] border-[#C0C0C0]',
  gold:   'bg-game-yellow-tint border-game-yellow',
};

export function ProgressPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Completion summary */}
      <div className="card flex flex-col gap-3">
        <h3 className="text-ink font-semibold text-sm">This week</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-ink">0</p>
            <p className="text-muted text-xs">bites done</p>
          </div>
          <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full w-0" />
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-muted">0</p>
            <p className="text-muted text-xs">total</p>
          </div>
        </div>
        <p className="text-xs text-muted text-center italic">
          Complete bites in the student view to see progress here.
        </p>
      </div>

      {/* Badges */}
      <div className="card flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-ink font-semibold text-sm">Badges</h3>
          <span className="text-muted text-xs">0 XP total</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((b, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 ${
                b.locked ? 'opacity-40 bg-primary-soft/30 border-line' : tierColor[b.tier]
              }`}
            >
              <span className="text-2xl">{b.emoji}</span>
              <p className="text-ink text-[10px] font-semibold text-center capitalize">{b.tier}</p>
              <p className="text-muted text-[9px] text-center">{b.subject}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress report card */}
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
