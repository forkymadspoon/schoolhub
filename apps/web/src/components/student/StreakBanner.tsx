interface Props {
  streakDays: number;
}

export function StreakBanner({ streakDays }: Props) {
  return (
    <div className="card flex items-center gap-3 bg-game-yellow-tint border border-game-yellow/30">
      <span className="text-2xl" role="img" aria-label="flame">🔥</span>
      {streakDays === 0 ? (
        <p className="text-muted text-sm font-medium">Start your streak today!</p>
      ) : (
        <div>
          <p className="text-ink font-bold text-lg leading-none">{streakDays}</p>
          <p className="text-muted text-xs">{streakDays === 1 ? 'day streak' : 'day streak'}</p>
        </div>
      )}
    </div>
  );
}
