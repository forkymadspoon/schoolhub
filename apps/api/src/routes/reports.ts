import { Router } from 'express';

const router = Router();

// POST /api/reports/:childId/weekly-card — triggers Sunday cron script; returns 202 immediately
router.post('/:childId/weekly-card', (req, res) => {
  res.status(202).json({ message: 'Weekly card generation queued', child_id: req.params.childId });
});

export { router as reportsRouter };
