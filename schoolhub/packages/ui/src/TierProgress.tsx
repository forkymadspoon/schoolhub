import type { GradeBand } from '@schoolhub/types';

interface Props {
  gradeBand: GradeBand;
  value: number; // 0–1
  label?: string;
  color?: 'green' | 'yellow' | 'orange';
}

/**
 * Grade-band–aware progress bar.
 * K2/LP stub until grade scope expands.
 */
export function TierProgress({ gradeBand, value, label, color = 'green' }: Props) {
  if (gradeBand === 'K2' || gradeBand === 'Lower_Primary') return null;

  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const bgColor =
    color === 'yellow' ? 'bg-game-yellow'
    : color === 'orange' ? 'bg-game-orange'
    : 'bg-game-green';

  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-2 bg-line rounded-pill overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full ${bgColor} rounded-pill transition-[width] duration-normal`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
