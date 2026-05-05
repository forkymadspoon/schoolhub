import { supabase } from './supabase';
import type { WSEvent, WellbeingSignalType, Subject, BadgeTier } from '@schoolhub/types';

// Requires xp_events, badges, and wellbeing_signals tables to be added to the
// supabase_realtime publication in the Supabase dashboard for events to fire.
export function subscribeToChildEvents(
  childId: string,
  onEvent: (e: WSEvent) => void,
): () => void {
  const channel = supabase
    .channel(`child-events:${childId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'xp_events', filter: `child_id=eq.${childId}` },
      (payload) => {
        const r = payload.new as { child_id: string; xp_delta: number };
        onEvent({ type: 'xp.awarded', child_id: r.child_id, xp_delta: r.xp_delta, total_xp: 0 });
      },
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'badges', filter: `child_id=eq.${childId}` },
      (payload) => {
        const r = payload.new as { child_id: string; subject: Subject; tier: BadgeTier };
        onEvent({ type: 'badge.unlocked', child_id: r.child_id, subject: r.subject, tier: r.tier });
      },
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'wellbeing_signals', filter: `child_id=eq.${childId}` },
      (payload) => {
        const r = payload.new as { signal_type: WellbeingSignalType };
        onEvent({ type: 'wellbeing.signal', child_id: childId, signal_type: r.signal_type });
      },
    )
    .subscribe();

  return () => { void supabase.removeChannel(channel); };
}
