import { Router } from 'express';
import { addHours } from 'date-fns';
import { supabaseAdmin } from '../services/supabase.js';
import { generateSchedule, type ScheduleGenerateContext, type TopicInput } from '@schoolhub/ai';
import type { GradeBand, SENProfile, Subject, TriggerReason } from '@schoolhub/types';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchScheduleContext(
  childId: string,
  child: { grade_level: string; grade_band: string; sen_profile: string | null; parent_id: string },
  overrides: { weeklyMinutes?: number; subjects?: Subject[]; examDates?: Array<{ label: string; date: string; subject: string | null }>; startDate?: string } = {},
): Promise<ScheduleGenerateContext> {
  // Fetch topics for the child's grade level
  const { data: topicRows } = await supabaseAdmin
    .from('topics')
    .select('id, topic_name, estimated_hours, exam_weight_percentage, difficulty_level, prerequisites, curriculum_versions!inner(level, subject)')
    .eq('curriculum_versions.level', child.grade_level);

  // Supabase returns joined rows as any[] without generated types; use Record<string, unknown>
  const topics: TopicInput[] = (topicRows ?? []).map((t: Record<string, unknown>) => {
    const cv = t.curriculum_versions;
    const subject = (Array.isArray(cv) ? (cv[0] as Record<string, unknown>)?.subject : (cv as Record<string, unknown>)?.subject) as string ?? '';
    return {
      id: t.id as string,
      topic_name: t.topic_name as string,
      subject,
      estimated_hours: t.estimated_hours as number,
      exam_weight_percentage: t.exam_weight_percentage as number,
      difficulty_level: t.difficulty_level as number,
      prerequisites: (t.prerequisites as string[]) ?? [],
    };
  });

  const subjects: Subject[] = overrides.subjects ??
    ([...new Set(topics.map(t => t.subject))] as Subject[]);

  // Fetch exam dates from parsed assessment uploads for this child
  const { data: assessmentUploads } = await supabaseAdmin
    .from('uploads')
    .select('parsed_payload')
    .eq('child_id', childId)
    .eq('file_type', 'assessment_dates')
    .eq('status', 'parsed');

  const examDates = overrides.examDates ?? (assessmentUploads ?? []).flatMap((u: { parsed_payload: unknown }) => {
    const payload = u.parsed_payload as { dates?: Array<{ label: string; date: string; subject: string | null }> } | null;
    return payload?.dates ?? [];
  });

  // Fetch holiday dates from school calendar uploads (parent-scoped)
  const { data: calendarUploads } = await supabaseAdmin
    .from('uploads')
    .select('parsed_payload')
    .eq('parent_id', child.parent_id)
    .eq('file_type', 'school_calendar')
    .eq('status', 'parsed');

  const holidayDates = (calendarUploads ?? []).flatMap((u: { parsed_payload: unknown }) => {
    const payload = u.parsed_payload as { events?: Array<{ type: string; date: string }> } | null;
    return (payload?.events ?? []).filter(e => e.type === 'holiday').map(e => e.date);
  });

  return {
    gradeBand: child.grade_band as GradeBand,
    senProfile: child.sen_profile as SENProfile,
    gradeLevel: child.grade_level,
    weeklyStudyMinutes: overrides.weeklyMinutes ?? 120,
    subjects: subjects.length > 0 ? subjects : (['English', 'Mathematics', 'Science'] as Subject[]),
    topics,
    examDates,
    holidayDates,
    startDate: overrides.startDate ?? new Date().toISOString().slice(0, 10),
  };
}

function buildReasonText(trigger: TriggerReason, name: string, meta: Record<string, unknown>): string {
  switch (trigger) {
    case 'low_completion':
      return `${name} completed ${String(meta.pct ?? '?')}% of bites this week, so we've lightened next week's load.`;
    case 'exam_change':
      return `${name}'s ${String(meta.subject ?? '')} exam moved to ${String(meta.date ?? '?')}, so we've shifted revision weeks.`;
    case 'calendar_change':
      return "A school holiday was added, so we've redistributed bites around it.";
    case 'sen_change':
      return `${name}'s learning profile was updated, so bites have been repaced to match.`;
    case 'manual':
    default:
      return 'You requested a schedule refresh.';
  }
}

// ─── POST /api/schedules/generate (initial — called from OnboardingWizard) ───

router.post('/generate', async (req, res, next) => {
  try {
    const {
      child_id: childId,
      subjects,
      exam_dates: examDates = [],
      weekly_minutes: weeklyMinutes = 120,
      trigger_reason: trigger = 'initial',
    } = req.body as {
      child_id: string;
      subjects?: Subject[];
      exam_dates?: Array<{ label: string; date: string; subject: string | null }>;
      weekly_minutes?: number;
      trigger_reason?: TriggerReason;
    };

    const { data: child, error: ce } = await supabaseAdmin
      .from('children').select('*').eq('id', childId).single();
    if (ce || !child) { res.status(404).json({ error: 'Child not found' }); return; }

    const ctx = await fetchScheduleContext(childId, child, {
      ...(subjects !== undefined && { subjects }),
      ...(examDates !== undefined && { examDates }),
      ...(weeklyMinutes !== undefined && { weeklyMinutes }),
    });
    const scheduleOutput = await generateSchedule(ctx, child.name as string);

    const isASD = child.sen_profile === 'Autism_Spectrum';
    const activates_at = isASD ? addHours(new Date(), 48).toISOString() : new Date().toISOString();

    const { data: saved, error: se } = await supabaseAdmin
      .from('study_schedules')
      .insert({
        child_id: childId,
        schedule_json: scheduleOutput,
        schedule_hash: scheduleOutput.hash,
        trigger_reason: trigger,
        activates_at,
        confirmed_by_parent: false,
      })
      .select('id')
      .single();
    if (se) throw se;

    res.status(201).json({ schedule_id: saved.id, hash: scheduleOutput.hash, activates_at });
  } catch (e) { next(e); }
});

// ─── POST /api/schedules/:childId/regenerate ─────────────────────────────────

router.post('/:childId/regenerate', async (req, res, next) => {
  try {
    const { childId } = req.params;
    const { trigger = 'manual', weekly_minutes: weeklyMinutes } = req.body as {
      trigger?: TriggerReason;
      weekly_minutes?: number;
    };

    const { data: child, error: ce } = await supabaseAdmin
      .from('children').select('*').eq('id', childId).single();
    if (ce || !child) { res.status(404).json({ error: 'Child not found' }); return; }

    const ctx = await fetchScheduleContext(childId, child, {
      ...(weeklyMinutes !== undefined && { weeklyMinutes }),
    });
    const scheduleOutput = await generateSchedule(ctx, child.name as string);

    const isASD = child.sen_profile === 'Autism_Spectrum';
    const activates_at = isASD ? addHours(new Date(), 48).toISOString() : new Date().toISOString();

    // Fetch previous confirmed schedule for delta
    const { data: prev } = await supabaseAdmin
      .from('study_schedules')
      .select('schedule_json, schedule_hash')
      .eq('child_id', childId)
      .eq('confirmed_by_parent', true)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const newCount = scheduleOutput.weeks.reduce((s, w) => s + w.bites.length, 0);
    const oldCount = prev
      ? (prev.schedule_json as { weeks: Array<{ bites: unknown[] }> }).weeks.reduce((s, w) => s + w.bites.length, 0)
      : 0;

    const { data: saved, error: se } = await supabaseAdmin
      .from('study_schedules')
      .insert({
        child_id: childId,
        schedule_json: scheduleOutput,
        schedule_hash: scheduleOutput.hash,
        trigger_reason: trigger,
        activates_at,
        confirmed_by_parent: false,
      })
      .select('id')
      .single();
    if (se) throw se;

    res.json({
      preview: {
        reason_text: buildReasonText(trigger, child.name as string, req.body as Record<string, unknown>),
        added_bites: Math.max(0, newCount - oldCount),
        removed_bites: Math.max(0, oldCount - newCount),
        shifted_bites: 0,
        old_schedule_hash: prev?.schedule_hash ?? '',
        new_schedule_hash: scheduleOutput.hash,
        weeks_changed: scheduleOutput.weeks.map(w => w.week_number),
      },
      activation: { mode: isASD ? 'delayed_48h' : 'immediate', activates_at },
      schedule_id: saved.id,
    });
  } catch (e) { next(e); }
});

// ─── POST /api/schedules/:childId/confirm ────────────────────────────────────

router.post('/:childId/confirm', async (req, res, next) => {
  try {
    const { new_schedule_hash } = req.body as { new_schedule_hash: string };
    const { error } = await supabaseAdmin
      .from('study_schedules')
      .update({ confirmed_by_parent: true })
      .eq('child_id', req.params.childId)
      .eq('schedule_hash', new_schedule_hash);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ─── GET /api/schedules/:childId/history ─────────────────────────────────────

router.get('/:childId/history', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('study_schedules')
      .select('id, generated_at, trigger_reason, schedule_hash, activates_at, confirmed_by_parent')
      .eq('child_id', req.params.childId)
      .order('generated_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// ─── GET /api/schedules/:childId/active ──────────────────────────────────────

router.get('/:childId/active', async (req, res, next) => {
  try {
    const { childId } = req.params;

    const scheduleSelect = 'id, schedule_json, schedule_hash, activates_at, confirmed_by_parent, trigger_reason, generated_at';

    const { data: confirmed } = await supabaseAdmin
      .from('study_schedules')
      .select(scheduleSelect)
      .eq('child_id', childId)
      .eq('confirmed_by_parent', true)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let schedule = confirmed;
    if (!schedule) {
      const { data: latest } = await supabaseAdmin
        .from('study_schedules')
        .select(scheduleSelect)
        .eq('child_id', childId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      schedule = latest;
    }

    if (!schedule) { res.status(404).json({ error: 'No schedule found' }); return; }

    // Current week bites (Sunday–Saturday)
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    const weekStartISO = sunday.toISOString().slice(0, 10);

    const { data: bites } = await supabaseAdmin
      .from('schedule_bites')
      .select('completed_at')
      .eq('child_id', childId)
      .gte('planned_date', weekStartISO);

    const total = bites?.length ?? 0;
    const completed = bites?.filter(b => (b as { completed_at: string | null }).completed_at).length ?? 0;

    res.json({ schedule, bites_this_week: { total, completed } });
  } catch (e) { next(e); }
});

export { router as schedulesRouter };
