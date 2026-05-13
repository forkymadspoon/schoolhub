/**
 * Rule-based wellbeing signal engine.
 * Claude is NOT used here. Suggestions only — parent always overrides.
 * Runs hourly via POST /api/internal/wellbeing/evaluate.
 *
 * Signal definitions from PRD v3.0 §7.3.
 * SEN-adjusted thresholds from schoolhub-product-design-skill.md.
 */
import { supabaseAdmin } from './supabase.js';
import type { SENProfile, WellbeingSignalType } from '@schoolhub/types';

interface SignalRow {
  child_id: string;
  signal_type: WellbeingSignalType;
  recommended_action: string;
}

export async function evaluateWellbeingSignals(): Promise<number> {
  const { data: children } = await supabaseAdmin
    .from('children')
    .select('id, sen_profile, gamification_enabled');

  if (!children?.length) return 0;

  const signals: SignalRow[] = [];

  for (const child of children) {
    const sen = child.sen_profile as SENProfile;
    const detected = await detectSignals(child.id, sen);
    signals.push(...detected);
  }

  if (signals.length === 0) return 0;

  // Deduplicate: skip if same signal already open for child
  const { data: existing } = await supabaseAdmin
    .from('wellbeing_signals')
    .select('child_id, signal_type')
    .is('resolved_at', null);

  const existingSet = new Set(
    (existing ?? []).map((r: { child_id: string; signal_type: string }) => `${r.child_id}:${r.signal_type}`),
  );

  const newSignals = signals.filter(
    (s) => !existingSet.has(`${s.child_id}:${s.signal_type}`),
  );

  if (newSignals.length > 0) {
    await supabaseAdmin.from('wellbeing_signals').insert(newSignals);
  }

  return newSignals.length;
}

async function detectSignals(childId: string, sen: SENProfile): Promise<SignalRow[]> {
  const results: SignalRow[] = [];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

  // ── BURNOUT RISK: streak drops 3+ consecutive days (2 for ADHD) ──────────
  const streakDropThreshold = sen === 'ADHD' ? 2 : 3;
  const { data: recentBites } = await supabaseAdmin
    .from('schedule_bites')
    .select('planned_date, completed_at')
    .eq('child_id', childId)
    .gte('planned_date', weekAgo.slice(0, 10))
    .order('planned_date', { ascending: false });

  if (recentBites) {
    let consecutiveMissed = 0;
    for (const b of recentBites) {
      if (!b.completed_at) { consecutiveMissed++; }
      else { break; }
    }
    if (consecutiveMissed >= streakDropThreshold) {
      results.push({
        child_id: childId,
        signal_type: 'burnout_risk',
        recommended_action: 'Pause gamification pressure. Suggest 2-day break.',
      });
    }
  }

  // ── COMPREHENSION PLATEAU: same topic failed 3+ bites ────────────────────
  const { data: moodData } = await supabaseAdmin
    .from('schedule_bites')
    .select('topic_id, mood')
    .eq('child_id', childId)
    .eq('mood', 'struggling')
    .gte('planned_date', weekAgo.slice(0, 10));

  if (moodData) {
    const counts: Record<string, number> = {};
    for (const b of moodData) {
      if (b.topic_id) counts[b.topic_id] = (counts[b.topic_id] ?? 0) + 1;
    }
    if (Object.values(counts).some((c) => c >= 3)) {
      results.push({
        child_id: childId,
        signal_type: 'comprehension_plateau',
        recommended_action: 'Flag weak topic. Recommend prerequisite bite.',
      });
    }
  }

  // ── ACTIVITY IMBALANCE: 7+ consecutive days studied (5 for SEN) ──────────
  const activityThreshold = sen !== null ? 5 : 7;
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000).toISOString().slice(0, 10);
  const { data: studyDays } = await supabaseAdmin
    .from('schedule_bites')
    .select('planned_date')
    .eq('child_id', childId)
    .not('completed_at', 'is', null)
    .gte('planned_date', twoWeeksAgo);

  if (studyDays) {
    const uniqueDays = new Set(studyDays.map((b: { planned_date: string }) => b.planned_date));
    const sortedDays = [...uniqueDays].sort().reverse();
    let streak = 0;
    let prev: Date | null = null;
    for (const d of sortedDays) {
      const cur = new Date(d);
      if (!prev || (prev.getTime() - cur.getTime()) === 86400000) {
        streak++;
        prev = cur;
      } else { break; }
    }
    if (streak >= activityThreshold) {
      results.push({
        child_id: childId,
        signal_type: 'activity_imbalance',
        recommended_action: 'Prompt holistic activity: outdoor play, creative time, or family time.',
      });
    }
  }

  // ── OVERLOAD RISK: study hours > 2× weekly default ───────────────────────
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  thisWeekStart.setHours(0, 0, 0, 0);

  const { data: weekBites } = await supabaseAdmin
    .from('schedule_bites')
    .select('duration_sec, planned_date')
    .eq('child_id', childId)
    .not('completed_at', 'is', null)
    .gte('planned_date', thisWeekStart.toISOString().slice(0, 10));

  if (weekBites && weekBites.length > 0) {
    const totalMinutes = weekBites.reduce(
      (sum: number, b: { duration_sec: number | null }) => sum + (b.duration_sec ?? 0) / 60,
      0,
    );
    // Default 2 hrs/day × 5 school days = 600 min; > 2× = overload
    const defaultWeeklyMinutes = 600;
    if (totalMinutes > defaultWeeklyMinutes * 2) {
      results.push({
        child_id: childId,
        signal_type: 'overload_risk',
        recommended_action: 'Suggest 20% bite reduction and 1 rest day.',
      });
    }
  }

  // ── EXAM ANXIETY: exam in <14 days + completion rate drops ───────────────
  const fourteenDaysAhead = new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10);
  const { data: upcomingExams } = await supabaseAdmin
    .from('schedule_bites')
    .select('planned_date, topic_id')
    .eq('child_id', childId)
    .lte('planned_date', fourteenDaysAhead)
    .gte('planned_date', now.toISOString().slice(0, 10))
    .limit(1);

  const hasNearExam = (upcomingExams?.length ?? 0) > 0;

  if (hasNearExam && recentBites) {
    const completedCount = recentBites.filter((b: { completed_at: string | null }) => b.completed_at).length;
    const totalCount = recentBites.length;
    const completionRate = totalCount > 0 ? completedCount / totalCount : 1;

    if (completionRate < 0.5) {
      results.push({
        child_id: childId,
        signal_type: 'exam_anxiety',
        recommended_action: 'Reduce new topics. Focus revision only. Suggest breathing exercise resource.',
      });
    }
  }

  return results;
}
