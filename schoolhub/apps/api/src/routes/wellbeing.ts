import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import type { AcknowledgementType } from '@schoolhub/types';

const router = Router();

// GET /api/children/:id/wellbeing
router.get('/:id/wellbeing', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('wellbeing_signals')
      .select('*')
      .eq('child_id', req.params.id)
      .is('resolved_at', null)
      .order('triggered_at', { ascending: false });
    if (error) throw error;

    const status =
      data.length === 0 ? 'green'
      : data.some((s) => ['overload_risk', 'exam_anxiety'].includes(s.signal_type)) ? 'red'
      : 'amber';

    res.json({ status, signals: data });
  } catch (e) { next(e); }
});

// POST /api/children/:id/wellbeing/:signalId/ack
router.post('/:id/wellbeing/:signalId/ack', async (req, res, next) => {
  try {
    const userId = (req as typeof req & { userId: string }).userId;
    const { action } = req.body as { action: AcknowledgementType };

    const { data, error } = await supabaseAdmin
      .from('wellbeing_signals')
      .update({
        acknowledged_by: userId,
        acknowledgement: action,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', req.params.signalId)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export { router as wellbeingRouter };
