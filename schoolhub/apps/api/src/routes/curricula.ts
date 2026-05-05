import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';

const router = Router();

// GET /api/curricula?level=P4&subject=Mathematics
router.get('/', async (req, res, next) => {
  try {
    const { level, subject } = req.query as { level?: string; subject?: string };
    let q = supabaseAdmin.from('curriculum_versions').select('*').eq('status', 'parsed');
    if (level)   q = q.eq('level', level);
    if (subject) q = q.eq('subject', subject);
    const { data, error } = await q.order('release_date', { ascending: false });
    if (error) throw error;
    res.json({ success: true, curricula: data });
  } catch (e) { next(e); }
});

// GET /api/curricula/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('curriculum_versions').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export { router as curriculaRouter };
