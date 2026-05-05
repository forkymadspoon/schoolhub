import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import type { SiblingConflict, Intensity } from '@schoolhub/types';

const router = Router();

function isoWeekToMonday(isoWeek: string): Date {
  const parts = isoWeek.split('-W');
  const year = parseInt(parts[0] ?? '0', 10);
  const week = parseInt(parts[1] ?? '1', 10);
  const jan4 = new Date(year, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7; // Monday = 0
  const mon = new Date(jan4);
  mon.setDate(jan4.getDate() - jan4Day + (week - 1) * 7);
  return mon;
}

function currentIsoWeek(): string {
  const now = new Date();
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7;
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - jan4Day);
  const diff = now.getTime() - weekStart.getTime();
  const week = Math.floor(diff / (7 * 86400000)) + 1;
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

// GET /api/households/:parentId/timeline?week=2026-W18
router.get('/:parentId/timeline', async (req, res, next) => {
  try {
    const isoWeek = (req.query as { week?: string }).week ?? currentIsoWeek();
    const monday = isoWeekToMonday(isoWeek);
    const sunday = addDays(monday, 6);
    const weekStart = monday.toISOString().slice(0, 10);
    const weekEnd = sunday.toISOString().slice(0, 10);

    const { data: children, error: ce } = await supabaseAdmin
      .from('children')
      .select('id, name, grade_level')
      .eq('parent_id', req.params.parentId);
    if (ce) throw ce;

    type DayEntry = { date: string; intensity: Intensity; bite_count: number; total_minutes: number };

    const lanes = await Promise.all((children ?? []).map(async (child) => {
      const { data: rows } = await supabaseAdmin
        .from('schedule_bites')
        .select('planned_date, bites(duration_min)')
        .eq('child_id', (child as { id: string }).id)
        .gte('planned_date', weekStart)
        .lte('planned_date', weekEnd);

      const dayTotals = new Map<string, number>();
      for (const row of rows ?? []) {
        // Supabase returns joined `bites` as an array (even for FK → one relationship)
        const r = row as unknown as { planned_date: string; bites: Array<{ duration_min: number }> | null };
        const bitesArr = r.bites ?? [];
        const mins = bitesArr.reduce((s, b) => s + b.duration_min, 0);
        dayTotals.set(r.planned_date, (dayTotals.get(r.planned_date) ?? 0) + mins);
      }

      const daily: DayEntry[] = [];
      for (const [date, total_minutes] of dayTotals) {
        const bite_count = (rows ?? []).filter(r => (r as { planned_date: string }).planned_date === date).length;
        const intensity: Intensity = total_minutes < 30 ? 'low' : total_minutes <= 60 ? 'med' : 'high';
        daily.push({ date, intensity, bite_count, total_minutes });
      }
      daily.sort((a, b) => a.date.localeCompare(b.date));

      const weeklyTotal = [...dayTotals.values()].reduce((s, v) => s + v, 0);
      return { child_id: (child as { id: string }).id, name: (child as { name: string }).name, grade_level: (child as { grade_level: string }).grade_level, daily, weeklyTotal };
    }));

    // Conflict detection: overlapping high-intensity days
    const dateMap = new Map<string, Array<{ name: string; intensity: Intensity }>>();
    for (const lane of lanes) {
      for (const day of lane.daily) {
        const existing = dateMap.get(day.date) ?? [];
        existing.push({ name: lane.name, intensity: day.intensity });
        dateMap.set(day.date, existing);
      }
    }

    const conflicts: SiblingConflict[] = [];
    for (const [date, entries] of dateMap) {
      const highChildren = entries.filter(e => e.intensity === 'high');
      if (highChildren.length >= 2) {
        const names = highChildren.map(e => e.name);
        conflicts.push({
          date,
          type: 'overlapping_high_intensity',
          children: names,
          suggestion: `Consider spreading ${names.join(' or ')}'s bites across two days to reduce study load.`,
        });
      }
    }

    // Load balance suggestion
    const totals = lanes.map(l => l.weeklyTotal);
    const maxTotal = Math.max(...totals, 0);
    const minTotal = Math.min(...totals.filter(t => t > 0), Infinity);
    const load_balance_suggestions: string[] = [];
    if (minTotal !== Infinity && maxTotal > 1.5 * minTotal) {
      const busiest = lanes.find(l => l.weeklyTotal === maxTotal);
      const lightest = lanes.find(l => l.weeklyTotal === minTotal);
      if (busiest && lightest) {
        load_balance_suggestions.push(
          `${busiest.name} has significantly more study time than ${lightest.name} this week. Consider redistributing some of ${busiest.name}'s bites to lighter days.`
        );
      }
    }

    const childLanes = lanes.map(({ child_id, name, grade_level, daily }) => ({ child_id, name, grade_level, daily }));
    res.json({ week: isoWeek, children: childLanes, conflicts, load_balance_suggestions });
  } catch (e) { next(e); }
});

// POST /api/households/:parentId/timeline/apply
router.post('/:parentId/timeline/apply', (_req, res) => {
  res.json({ ok: true });
});

export { router as householdsRouter };
