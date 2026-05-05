import type { SENProfile } from '@schoolhub/types';

export function useSENProfile(sen: SENProfile) {
  return {
    isADHD:   sen === 'ADHD',
    isAutism: sen === 'Autism_Spectrum',
    isOther:  sen === 'Other_SEN',
    hasSEN:   sen !== null,
    /** Hard bite duration cap in minutes */
    biteCap:  sen === 'ADHD' ? 5 : 10,
    /** ASD: schedule changes need 48h advance notice */
    needs48hDelay: sen === 'Autism_Spectrum',
    /** Leaderboard hidden by default for all SEN profiles */
    hideLeaderboard: sen !== null,
    /** data-attribute for CSS motion zeroing */
    dataSen: sen ?? undefined,
  };
}
