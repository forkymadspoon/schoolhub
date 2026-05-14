import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import type { SENProfile, GradeLevel, GradeBand } from '@schoolhub/types';

const router = Router();

interface ExportedBite {
  id?: string;
  schedule_id?: string;
  child_id?: string;
  topic_id?: string;
  planned_date?: string;
  week_start?: string;
  completed_at?: string | null;
  duration_sec?: number | null;
  mood?: string | null;
}

interface ExportedBadge {
  id?: string;
  subject: string;
  tier: string;
  unlocked_at?: string;
}

interface ExportedXPEvent {
  id?: string;
  event_type: string;
  xp_delta: number;
  created_at?: string;
}

interface ExportedChild {
  id: string;
  name: string;
  grade_level: GradeLevel;
  grade_band: GradeBand;
  sen_profile: SENProfile;
  gamification_enabled: boolean;
  p1_intake_date?: string | null;
  schedule?: Record<string, unknown> | null;
  bites?: ExportedBite[];
  badges?: ExportedBadge[];
  xp_events?: ExportedXPEvent[];
  xp_total?: number;
}

interface ImportPayload {
  version: number;
  children: ExportedChild[];
}

// POST /api/data/import
router.post('/import', async (req, res, next) => {
  try {
    const userId = (req as typeof req & { userId: string }).userId;
    const body = req.body as ImportPayload;

    if (!body.version || !Array.isArray(body.children)) {
      res.status(400).json({ error: 'Invalid export file — missing version or children array' });
      return;
    }

    let importedCount = 0;

    for (const child of body.children) {
      const gradeBand: GradeBand =
        child.grade_level === 'K2' ? 'K2'
        : ['P1', 'P2', 'P3'].includes(child.grade_level) ? 'Lower_Primary'
        : 'Upper_Primary';

      const { data: childRow, error: childErr } = await supabaseAdmin
        .from('children')
        .upsert({
          id: child.id,
          parent_id: userId,
          name: child.name,
          grade_level: child.grade_level,
          grade_band: gradeBand,
          sen_profile: child.sen_profile ?? null,
          gamification_enabled: child.gamification_enabled ?? true,
          p1_intake_date: child.p1_intake_date ?? null,
        }, { onConflict: 'id' })
        .select('id')
        .single();

      if (childErr) throw childErr;
      const childId = (childRow as { id: string }).id;
      importedCount++;

      if (child.schedule && typeof child.schedule === 'object') {
        const schedule = child.schedule as Record<string, unknown>;
        if (schedule.id) {
          await supabaseAdmin.from('study_schedules').upsert({
            id: schedule.id,
            child_id: childId,
            schedule_json: schedule.schedule_json ?? schedule,
            schedule_hash: schedule.schedule_hash ?? 'imported',
            trigger_reason: 'imported',
            confirmed_by_parent: true,
            activates_at: schedule.activates_at ?? new Date().toISOString(),
          }, { onConflict: 'id', ignoreDuplicates: true });
        }
      }

      if (Array.isArray(child.bites) && child.bites.length > 0) {
        const biteRows = child.bites
          .filter(b => b.id && b.topic_id && b.planned_date)
          .map(b => ({
            id: b.id,
            schedule_id: b.schedule_id ?? child.schedule?.['id'] ?? null,
            child_id: childId,
            topic_id: b.topic_id,
            planned_date: b.planned_date,
            week_start: b.week_start ?? b.planned_date,
            completed_at: b.completed_at ?? null,
            duration_sec: b.duration_sec ?? null,
            mood: b.mood ?? null,
          }));
        if (biteRows.length > 0) {
          await supabaseAdmin.from('schedule_bites')
            .upsert(biteRows, { onConflict: 'id', ignoreDuplicates: true });
        }
      }

      if (Array.isArray(child.badges) && child.badges.length > 0) {
        const badgeRows = child.badges.map(b => ({
          child_id: childId,
          subject: b.subject,
          tier: b.tier,
          unlocked_at: b.unlocked_at ?? new Date().toISOString(),
        }));
        await supabaseAdmin.from('badges')
          .upsert(badgeRows, { onConflict: 'child_id, subject, tier', ignoreDuplicates: true });
      }

      if (Array.isArray(child.xp_events) && child.xp_events.length > 0) {
        const xpRows = child.xp_events
          .filter(x => x.id)
          .map(x => ({
            id: x.id,
            child_id: childId,
            event_type: x.event_type,
            xp_delta: x.xp_delta,
            created_at: x.created_at ?? new Date().toISOString(),
          }));
        if (xpRows.length > 0) {
          await supabaseAdmin.from('xp_events')
            .upsert(xpRows, { onConflict: 'id', ignoreDuplicates: true });
        }
      }
    }

    res.json({ ok: true, imported_children: importedCount });
  } catch (e) { next(e); }
});

export { router as dataRouter };
