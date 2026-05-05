import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { computeStreak } from '../services/streak.js';
import type { Subject, BadgeTier } from '@schoolhub/types';

const router = Router();

// GET /api/bites/:childId/today
router.get('/:childId/today', async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [biteRows, streak_days] = await Promise.all([
      supabaseAdmin
        .from('schedule_bites')
        .select('*, bites(*), topics(topic_name)')
        .eq('child_id', req.params.childId)
        .eq('planned_date', today)
        .order('created_at')
        .then(({ data, error }) => { if (error) throw error; return data ?? []; }),
      computeStreak(req.params.childId),
    ]);
    res.json({ bites: biteRows, streak_days });
  } catch (e) { next(e); }
});

// POST /api/bites/:scheduleBiteId/complete  (:scheduleBiteId = schedule_bites.id)
router.post('/:scheduleBiteId/complete', async (req, res, next) => {
  try {
    const { duration_sec, mood, child_id } = req.body as {
      duration_sec: number;
      mood: 'struggling' | 'okay' | 'got_it';
      child_id: string;
    };

    const start = Date.now();
    const scheduleBiteId = req.params.scheduleBiteId;

    // Get the bite template ID before marking complete
    const { data: sbRow } = await supabaseAdmin
      .from('schedule_bites')
      .select('bite_id')
      .eq('id', scheduleBiteId)
      .eq('child_id', child_id)
      .maybeSingle();

    await supabaseAdmin
      .from('schedule_bites')
      .update({ completed_at: new Date().toISOString(), duration_sec, mood })
      .eq('id', scheduleBiteId)
      .eq('child_id', child_id);

    const XP_BITE = 10;
    await supabaseAdmin.from('xp_events').insert({
      child_id,
      event_type: 'bite_complete',
      xp_delta: XP_BITE,
    });

    const [xpResult, streak_days] = await Promise.all([
      supabaseAdmin.from('xp_events').select('xp_delta').eq('child_id', child_id),
      computeStreak(child_id),
    ]);
    const total_xp = (xpResult.data ?? []).reduce(
      (sum, r) => sum + (r as { xp_delta: number }).xp_delta, 0
    );

    // Streak milestone bonus XP
    if ([7, 14, 30].includes(streak_days)) {
      await supabaseAdmin.from('xp_events').insert({
        child_id,
        event_type: 'streak_milestone',
        xp_delta: 5,
      });
    }

    // Badge check (best-effort — won't fail the response)
    let newBadge: { child_id: string; subject: Subject; tier: BadgeTier } | null = null;
    const biteId = (sbRow as { bite_id: string | null } | null)?.bite_id;

    if (biteId) {
      try {
        const { data: topicRow } = await supabaseAdmin
          .from('bites')
          .select('topic_id')
          .eq('id', biteId)
          .maybeSingle();

        const topicId = (topicRow as { topic_id: string } | null)?.topic_id;
        if (topicId) {
          const { data: cvRefRow } = await supabaseAdmin
            .from('topics')
            .select('curriculum_version_id')
            .eq('id', topicId)
            .maybeSingle();

          const cvId = (cvRefRow as { curriculum_version_id: string } | null)?.curriculum_version_id;
          if (cvId) {
            const [cvRes, siblingTopics] = await Promise.all([
              supabaseAdmin.from('curriculum_versions').select('subject').eq('id', cvId).maybeSingle(),
              supabaseAdmin.from('topics').select('id').eq('curriculum_version_id', cvId),
            ]);

            const subject = (cvRes.data as { subject: Subject } | null)?.subject;
            const topicIds = (siblingTopics.data ?? []).map(t => (t as { id: string }).id);

            if (subject && topicIds.length > 0) {
              const { count: subjectCount } = await supabaseAdmin
                .from('schedule_bites')
                .select('*', { count: 'exact', head: true })
                .eq('child_id', child_id)
                .not('completed_at', 'is', null)
                .in('topic_id', topicIds);

              const tier: BadgeTier | null =
                (subjectCount ?? 0) >= 100 ? 'gold'
                : (subjectCount ?? 0) >= 30 ? 'silver'
                : (subjectCount ?? 0) >= 10 ? 'bronze'
                : null;

              if (tier) {
                const { data: existing } = await supabaseAdmin
                  .from('badges')
                  .select('id')
                  .eq('child_id', child_id)
                  .eq('subject', subject)
                  .eq('tier', tier)
                  .maybeSingle();

                if (!existing) {
                  await supabaseAdmin.from('badges').insert({
                    child_id, subject, tier,
                    unlocked_at: new Date().toISOString(),
                  });
                  newBadge = { child_id, subject, tier };
                }
              }
            }
          }
        }
      } catch { /* badge lookup failed — skip */ }
    }

    const elapsed = Date.now() - start;
    if (elapsed > 2000) console.warn(`XP award took ${elapsed}ms — exceeds 2s SLA`);

    const payload: Record<string, unknown> = { ok: true, xp_delta: XP_BITE, total_xp, streak_days, elapsed_ms: elapsed };
    if (newBadge) payload.badge = newBadge;
    res.json(payload);
  } catch (e) { next(e); }
});

export { router as bitesRouter };
