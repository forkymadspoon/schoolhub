import type { ReactNode } from 'react';
import type { UserPlan } from '@schoolhub/types';

interface Props {
  minTier: 'scholar' | 'scholar_pro';
  currentPlan: UserPlan;
  children: ReactNode;
  /** For internal alpha, bypass is always true */
  bypassForAlpha?: boolean;
}

const TIER_RANK: Record<UserPlan, number> = {
  free_trial: 0,
  scholar: 1,
  scholar_pro: 2,
};

/**
 * Wraps tier-gated features. Bypassed for internal alpha (all features visible).
 * When gates are enforced post-alpha, renders an upgrade prompt instead of children.
 */
export function TierGate({ minTier, currentPlan, children, bypassForAlpha = true }: Props) {
  if (bypassForAlpha) return <>{children}</>;

  const required = TIER_RANK[minTier === 'scholar' ? 'scholar' : 'scholar_pro'];
  const actual = TIER_RANK[currentPlan];

  if (actual >= required) return <>{children}</>;

  return (
    <div className="bg-surface rounded-card shadow-card p-6 text-center">
      <p className="text-muted text-sm">
        Upgrade to{' '}
        <span className="font-bold text-ink capitalize">{minTier.replace('_', ' ')}</span> to unlock
        this feature.
      </p>
    </div>
  );
}
