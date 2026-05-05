import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { evaluateWellbeingSignals } from '../services/wellbeingEngine.js';
import { computeStreak } from '../services/streak.js';
import { sendMessage } from '../services/telegram.js';

const router = Router();

// Internal auth: requires INTERNAL_API_KEY header
function internalAuth(req: Request, res: Response, next: NextFunction) {
  if (req.headers['x-internal-key'] !== process.env.INTERNAL_API_KEY) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

router.use(internalAuth);

// POST /api/internal/wellbeing/evaluate — called by hourly cron
router.post('/wellbeing/evaluate', async (_req, res, next) => {
  try {
    const count = await evaluateWellbeingSignals();
    res.json({ ok: true, signals_created: count });
  } catch (e) { next(e); }
});

// POST /api/internal/curriculum/fetch
router.post('/curriculum/fetch', (_req, res) => {
  res.status(202).json({ message: 'Curriculum fetch queued' });
});

// POST /api/internal/digest/weekly — called by Sunday cron
router.post('/digest/weekly', async (_req, res, next) => {
  try {
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - mondayOffset);
    const weekStartISO = weekStart.toISOString().slice(0, 10);

    const { data: prefs } = await supabaseAdmin
      .from('notification_prefs')
      .select('parent_id, telegram_chat_id, mode')
      .not('telegram_chat_id', 'is', null)
      .in('mode', ['weekly_digest', 'realtime']);

    let sent = 0;

    for (const pref of prefs ?? []) {
      const p = pref as { parent_id: string; telegram_chat_id: string; mode: string };

      const { data: children } = await supabaseAdmin
        .from('children')
        .select('id, name')
        .eq('parent_id', p.parent_id);

      const lines: string[] = ['📚 SchoolHub Weekly Summary', ''];

      for (const child of children ?? []) {
        const c = child as { id: string; name: string };

        const [biteRes, streak_days, signalRes] = await Promise.all([
          supabaseAdmin
            .from('schedule_bites')
            .select('completed_at')
            .eq('child_id', c.id)
            .gte('planned_date', weekStartISO),
          computeStreak(c.id),
          supabaseAdmin
            .from('wellbeing_signals')
            .select('*', { count: 'exact', head: true })
            .eq('child_id', c.id)
            .is('resolved_at', null),
        ]);

        const allBites = biteRes.data ?? [];
        const total = allBites.length;
        const completed = allBites.filter(b => (b as { completed_at: string | null }).completed_at !== null).length;
        const openSignals = signalRes.count ?? 0;

        lines.push(`${c.name}: ${completed}/${total} bites · ${streak_days}-day streak 🔥`);
        if (openSignals > 0) {
          lines.push(`  ⚠ ${openSignals} wellbeing ${openSignals === 1 ? 'signal' : 'signals'} need${openSignals === 1 ? 's' : ''} attention`);
        }
      }

      // Next exam countdown (PSLE fallback)
      const { data: uploads } = await supabaseAdmin
        .from('uploads')
        .select('parsed_payload')
        .in('child_id', (children ?? []).map(c => (c as { id: string }).id))
        .eq('file_type', 'assessment_dates')
        .eq('status', 'parsed');

      const examEntries = (uploads ?? []).flatMap(u => {
        const payload = (u as { parsed_payload: unknown }).parsed_payload as Array<{ label: string; date: string }> | null;
        return payload ?? [];
      }).filter(e => typeof e.label === 'string' && !isNaN(Date.parse(e.date)));

      const nextExam = examEntries
        .map(e => ({ ...e, days: Math.ceil((new Date(e.date).getTime() - today.getTime()) / 86400000) }))
        .filter(e => e.days > 0)
        .sort((a, b) => a.days - b.days)[0]
        ?? { label: 'PSLE', days: Math.ceil((new Date('2026-10-01').getTime() - today.getTime()) / 86400000) };

      lines.push('');
      lines.push(`${nextExam.label} in ${nextExam.days} days`);

      try {
        await sendMessage(p.telegram_chat_id, lines.join('\n'));
        sent++;
      } catch (err) {
        console.error(`[digest] Failed to send to ${p.telegram_chat_id}: ${String(err)}`);
      }
    }

    res.json({ ok: true, sent });
  } catch (e) { next(e); }
});

// GET /api/internal/curriculum/status
router.get('/curriculum/status', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('parse_queue')
      .select('status, count:id.count()')
      .in('status', ['queued', 'parsing', 'failed']);
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export { router as internalRouter };
