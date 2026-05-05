import type { WellbeingSignal } from '@schoolhub/types';
import { useWellbeing } from '../../hooks/useWellbeing';

const SIGNAL_LABELS: Record<string, string> = {
  overload_risk: 'Overload risk',
  burnout_risk: 'Burnout risk',
  comprehension_plateau: 'Comprehension plateau',
  activity_imbalance: 'Activity imbalance',
  exam_anxiety: 'Exam anxiety',
};

interface Props {
  childId: string;
  childName: string;
  onClose: () => void;
}

export function WellbeingPanel({ childId, childName, onClose }: Props) {
  const { signals, loading, acknowledge } = useWellbeing(childId);
  const openSignals = signals.filter(s => !s.resolved_at);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-card shadow-card w-full max-w-lg mx-4 p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-ink font-semibold text-lg">Wellbeing — {childName}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink text-xl leading-none transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && openSignals.length === 0 && (
          <p className="text-muted text-sm text-center py-6">
            No active signals — {childName} is on track.
          </p>
        )}

        {openSignals.map(signal => (
          <SignalCard
            key={signal.id}
            signal={signal}
            onAck={(action) => void acknowledge(signal.id, action)}
          />
        ))}

        <p className="text-muted text-xs text-center border-t border-line pt-3 mt-auto">
          These are suggestions only. You always have the final say.
        </p>
      </div>
    </div>
  );
}

function SignalCard({
  signal,
  onAck,
}: {
  signal: WellbeingSignal;
  onAck: (action: 'accepted' | 'modified' | 'dismissed') => void;
}) {
  if (signal.resolved_at) return null;

  const label = SIGNAL_LABELS[signal.signal_type] ?? signal.signal_type.replace(/_/g, ' ');

  return (
    <div className="rounded-card border border-game-yellow/40 bg-game-yellow-tint p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-base" role="img" aria-label="warning">⚠</span>
        <p className="text-ink font-semibold text-sm capitalize">{label}</p>
      </div>
      <p className="text-muted text-xs leading-relaxed">{signal.recommended_action}</p>
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onAck('accepted')}
          className="btn-primary text-xs px-4 py-2"
          aria-label={`Accept suggestion for ${label}`}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => onAck('modified')}
          className="btn-secondary text-xs px-4 py-2"
          aria-label={`Modify suggestion for ${label}`}
        >
          Modify
        </button>
        <button
          type="button"
          onClick={() => onAck('dismissed')}
          className="btn-secondary text-xs px-4 py-2"
          aria-label={`Dismiss suggestion for ${label}`}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
