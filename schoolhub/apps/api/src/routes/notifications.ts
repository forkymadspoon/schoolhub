import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';

const router = Router();

// GET /api/notifications/config
router.get('/config', async (req, res, next) => {
  try {
    const userId = (req as typeof req & { userId: string }).userId;
    const { data } = await supabaseAdmin
      .from('notification_prefs')
      .select('*')
      .eq('parent_id', userId)
      .maybeSingle();

    if (data) {
      res.json(data);
    } else {
      res.json({
        parent_id: userId,
        channel: 'telegram',
        mode: 'weekly_digest',
        telegram_chat_id: null,
        fallback_sms: false,
      });
    }
  } catch (e) { next(e); }
});

// POST /api/notifications/config
router.post('/config', async (req, res, next) => {
  try {
    const userId = (req as typeof req & { userId: string }).userId;
    const { channel, mode, fallback_sms } = req.body as {
      channel: 'telegram' | 'sms';
      mode: 'weekly_digest' | 'daily_progress' | 'realtime';
      fallback_sms?: boolean;
    };
    const { data, error } = await supabaseAdmin
      .from('notification_prefs')
      .upsert({ parent_id: userId, channel, mode, fallback_sms: fallback_sms ?? false }, { onConflict: 'parent_id' })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// POST /api/notifications/telegram/link
router.post('/telegram/link', async (req, res, next) => {
  try {
    const userId = (req as typeof req & { userId: string }).userId;
    const { telegram_chat_id } = req.body as { telegram_chat_id: string };
    const { data, error } = await supabaseAdmin
      .from('notification_prefs')
      .upsert({ parent_id: userId, telegram_chat_id }, { onConflict: 'parent_id' })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export { router as notificationsRouter };
