import FireIcon from '../../assets/icons/misc/fire.svg?react';

interface Props {
  streakDays: number;
}

export function StreakBanner({ streakDays }: Props) {
  return (
    <div className="card flex items-center gap-3 bg-game-yellow-tint border border-game-yellow/30">
      <FireIcon className="w-6 h-6 flex-shrink-0 animate-wiggle" />
      {streakDays === 0 ? (
        <p className="text-muted text-sm font-medium">Start your streak today!</p>
      ) : (
        <div>
          <p className="text-ink font-bold text-lg leading-none">{streakDays}</p>
          <p className="text-muted text-xs">day streak</p>
        </div>
      )}
    </div>
  );
}
