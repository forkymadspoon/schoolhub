import type { ReactNode } from 'react';
import type { SENProfile } from '@schoolhub/types';

interface Props {
  senProfile: SENProfile;
  children: ReactNode;
}

/**
 * Page-level wrapper that applies SEN-specific CSS attributes and motion overrides.
 * Never replaces the grade-band variant — sits on top of it.
 *
 * ADHD:            reduced visual clutter, motion kept (not zeroed)
 * Autism_Spectrum: all motion zeroed via CSS [data-sen="Autism_Spectrum"]
 * Other_SEN:       reduced motion
 */
export function SENOverlay({ senProfile, children }: Props) {
  if (!senProfile) return <>{children}</>;

  return (
    <div
      data-sen={senProfile}
      className={
        senProfile === 'ADHD'
          ? 'adhd-overlay'
          : senProfile === 'Autism_Spectrum'
            ? 'autism-overlay'
            : 'other-sen-overlay'
      }
    >
      {children}
    </div>
  );
}
