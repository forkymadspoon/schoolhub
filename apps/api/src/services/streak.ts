import { supabaseAdmin } from './supabase.js';

export async function computeStreak(childId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('schedule_bites')
    .select('planned_date')
    .eq('child_id', childId)
    .not('completed_at', 'is', null);

  if (!data || data.length === 0) return 0;

  const unique = [...new Set(
    data.map(r => (r as { planned_date: string }).planned_date)
  )].sort().reverse();

  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let expected = today;

  for (const d of unique) {
    if (d === expected) {
      streak++;
      const prev = new Date(expected);
      prev.setDate(prev.getDate() - 1);
      expected = prev.toISOString().slice(0, 10);
    } else if (d < expected) {
      break;
    }
  }
  return streak;
}
