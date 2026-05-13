import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { computeStreak } from '../services/streak.js';
import type { SENProfile, GradeLevel } from '@schoolhub/types';

const router = Router();

// GET /api/children — list children for authenticated parent
router.get('/', async (req, res, next) => {
  try {
    const userId = (req as typeof req & { userId: string }).userId;
    const { data, error } = await supabaseAdmin
      .from('children')
      .select('*')
      .eq('parent_id', userId)
      .order('created_at');
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/children/:id
router.get('/:id', async (req, res, next) => {
  try {
    const userId = (req as typeof req & { userId: string }).userId;
    const { data, error } = await supabaseAdmin
      .from('children')
      .select('*')
      .eq('id', req.params.id)
      .eq('parent_id', userId)
      .single();
    if (error) throw error;
    if (!data) { res.status(404).json({ error: 'Child not found' }); return; }
    res.json(data);
  } catch (e) { next(e); }
});

// POST /api/children
router.post('/', async (req, res, next) => {
  try {
    const { userId, userEmail } = req as typeof req & { userId: string; userEmail: string };
    // Ensure public.users row exists (auth.users → public.users sync)
    const { error: upsertErr } = await supabaseAdmin.from('users').upsert(
      { id: userId, email: userEmail, role: 'parent' },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    if (upsertErr) throw new Error(`User sync failed: ${upsertErr.message}`);

    const { name, grade_level, sen_profile = null, gamification_enabled = true } = req.body as {
      name: string;
      grade_level: GradeLevel;
      sen_profile?: SENProfile;
      gamification_enabled?: boolean;
    };

    const grade_band =
      grade_level === 'K2' ? 'K2'
      : ['P1', 'P2', 'P3'].includes(grade_level) ? 'Lower_Primary'
      : 'Upper_Primary';

    const { data, error } = await supabaseAdmin
      .from('children')
      .insert({ parent_id: userId, name, grade_level, grade_band, sen_profile, gamification_enabled })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

// PATCH /api/children/:id/sen-profile
router.patch('/:id/sen-profile', async (req, res, next) => {
  try {
    const { sen_profile } = req.body as { sen_profile: SENProfile };
    const { data, error } = await supabaseAdmin
      .from('children')
      .update({ sen_profile })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ ...data, regeneration_required: true });
  } catch (e) { next(e); }
});

// PATCH /api/children/:id/gamification
router.patch('/:id/gamification', async (req, res, next) => {
  try {
    const { enabled } = req.body as { enabled: boolean };
    const { data, error } = await supabaseAdmin
      .from('children')
      .update({ gamification_enabled: enabled })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/children/:id/countdown
router.get('/:id/countdown', async (req, res, next) => {
  try {
    const today = new Date();

    const { data: uploads } = await supabaseAdmin
      .from('uploads')
      .select('parsed_payload')
      .eq('child_id', req.params.id)
      .eq('file_type', 'assessment_dates')
      .eq('status', 'parsed');

    const entries = (uploads ?? []).flatMap((u) => {
      const payload = (u as { parsed_payload: unknown }).parsed_payload as Array<{ label: string; date: string }> | null;
      return payload ?? [];
    }).filter((e) => typeof e.label === 'string' && !isNaN(Date.parse(e.date)));

    const derived = entries
      .map((e) => {
        const days_remaining = Math.ceil((new Date(e.date).getTime() - today.getTime()) / 86400000);
        const colour = days_remaining > 60 ? 'green' as const : days_remaining > 30 ? 'yellow' as const : 'red' as const;
        return { label: e.label, date: e.date, days_remaining, colour };
      })
      .filter((i) => i.days_remaining > 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Fall back to hardcoded PSLE if no uploads found
    const items = derived.length > 0 ? derived : (() => {
      const psleDays = Math.ceil((new Date('2026-10-01').getTime() - today.getTime()) / 86400000);
      return [{ label: 'PSLE', date: '2026-10-01', days_remaining: psleDays, colour: psleDays > 60 ? 'green' as const : psleDays > 30 ? 'yellow' as const : 'red' as const }];
    })();

    res.json({ items });
  } catch (e) { next(e); }
});

// GET /api/children/:id/stats — streak, XP, most recent badge
router.get('/:id/stats', async (req, res, next) => {
  try {
    const childId = req.params.id;

    const [streak, xpResult, badgeResult] = await Promise.all([
      computeStreak(childId),
      supabaseAdmin
        .from('xp_events')
        .select('xp_delta')
        .eq('child_id', childId),
      supabaseAdmin
        .from('badges')
        .select('subject, tier, unlocked_at')
        .eq('child_id', childId)
        .order('unlocked_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const total_xp = (xpResult.data ?? []).reduce(
      (sum, row) => sum + ((row as { xp_delta: number }).xp_delta ?? 0), 0
    );

    const recent_badge = badgeResult.data
      ? { subject: (badgeResult.data as { subject: string }).subject, tier: (badgeResult.data as { tier: string }).tier }
      : null;

    res.json({ streak, total_xp, recent_badge });
  } catch (e) { next(e); }
});

export { router as childrenRouter };
