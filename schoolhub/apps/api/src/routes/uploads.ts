import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../services/supabase.js';
import { parseFile } from '@schoolhub/parsers';
import { parseUploadPDF } from '@schoolhub/ai';
import type { UploadFileType } from '@schoolhub/types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/uploads
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const userId = (req as typeof req & { userId: string }).userId;
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

    const { file_type, child_id } = req.body as { file_type: UploadFileType; child_id?: string };

    // Store to Supabase Storage
    const storagePath = `uploads/${userId}/${Date.now()}_${req.file.originalname}`;
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('schoolhub-uploads')
      .upload(storagePath, req.file.buffer, { contentType: req.file.mimetype });
    if (uploadErr) throw uploadErr;

    const { data: row, error: dbErr } = await supabaseAdmin
      .from('uploads')
      .insert({
        parent_id: userId,
        child_id: child_id ?? null,
        file_type,
        original_filename: req.file.originalname,
        storage_path: storagePath,
        status: 'queued',
      })
      .select()
      .single();
    if (dbErr) throw dbErr;

    // Enqueue parse job
    await supabaseAdmin.from('parse_queue').insert({
      source_type: 'upload',
      source_id: row.id,
      status: 'queued',
    });

    // Kick off async parse (fire-and-forget; client polls GET /api/uploads/:id)
    void parseFile(req.file.buffer, file_type, req.file.originalname, parseUploadPDF)
      .then(async (payload: unknown) => {
        await supabaseAdmin.from('uploads').update({ status: 'parsed', parsed_payload: payload }).eq('id', row.id);
        await supabaseAdmin.from('parse_queue').update({ status: 'parsed' }).eq('source_id', row.id);
      })
      .catch(async (err: unknown) => {
        const errors = [{ field: 'file', reason: String(err) }];
        await supabaseAdmin.from('uploads').update({ status: 'failed', error_json: { errors } }).eq('id', row.id);
      });

    res.status(201).json({ upload_id: row.id, status: 'queued', file_type });
  } catch (e) { next(e); }
});

// GET /api/uploads/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('uploads').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// POST /api/uploads/:id/correct
router.post('/:id/correct', async (req, res, next) => {
  try {
    const { corrections } = req.body as { corrections: Record<string, unknown> };
    const { data, error } = await supabaseAdmin
      .from('uploads')
      .update({ parsed_payload: corrections, status: 'parsed', error_json: null })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export { router as uploadsRouter };
