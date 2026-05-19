import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';
import { errorMiddleware } from './middleware/error.js';
import { childrenRouter } from './routes/children.js';
import { schedulesRouter } from './routes/schedules.js';
import { uploadsRouter } from './routes/uploads.js';
import { bitesRouter } from './routes/bites.js';
import { wellbeingRouter } from './routes/wellbeing.js';
import { householdsRouter } from './routes/households.js';
import { reportsRouter } from './routes/reports.js';
import { notificationsRouter } from './routes/notifications.js';
import { curriculaRouter } from './routes/curricula.js';
import { internalRouter } from './routes/internal.js';
import { dataRouter } from './routes/data.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

const ALWAYS_ALLOWED = ['https://schoolhub-azure.vercel.app'];
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      ...ALWAYS_ALLOWED,
      ...(process.env.ALLOWED_ORIGIN ?? '')
        .split(',')
        .map(o => o.trim().replace(/\/$/, ''))
        .filter(Boolean),
    ]
  : true; // allow all origins in local dev
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10mb' }));

// Public
app.get('/health', (_req, res) => res.json({ ok: true }));

// Authenticated routes
app.use('/api/curricula',      authMiddleware, curriculaRouter);
app.use('/api/children',       authMiddleware, childrenRouter);
app.use('/api/schedules',      authMiddleware, schedulesRouter);
app.use('/api/uploads',        authMiddleware, uploadsRouter);
app.use('/api/bites',          authMiddleware, bitesRouter);
app.use('/api/households',     authMiddleware, householdsRouter);
app.use('/api/children',       authMiddleware, wellbeingRouter);
app.use('/api/notifications',  authMiddleware, notificationsRouter);
app.use('/api/reports',        authMiddleware, reportsRouter);
app.use('/api/data',           authMiddleware, dataRouter);

// Internal cron endpoints (service-role key, not user JWT)
app.use('/api/internal',       internalRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
