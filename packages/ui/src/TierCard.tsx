import type { ReactNode } from 'react';
import type { GradeBand } from '@schoolhub/types';

interface Props {
  gradeBand: GradeBand;
  children: ReactNode;
  className?: string;
}

/**
 * Grade-band–aware card wrapper.
 * K2/Lower_Primary variants are stubbed (returns null) until grade scope expands.
 * Upper_Primary renders the standard card layout.
 */
export function TierCard({ gradeBand, children, className = '' }: Props) {
  if (gradeBand === 'K2' || gradeBand === 'Lower_Primary') {
    // Stub — implement when K2/LP scope is unlocked
    return null;
  }

  return (
    <div className={`bg-surface rounded-card shadow-card p-5 ${className}`}>
      {children}
    </div>
  );
}
