import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './config/swagger';
import jobRoutes from './modules/jobs/jobs.routes';
import reporterRoutes from './modules/reporters/reporters.routes';
import editorRoutes from './modules/editors/editors.routes';
import statisticsRoutes from './modules/statistics/statistics.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

setupSwagger(app);

app.use('/api/jobs', jobRoutes);
app.use('/api/reporters', reporterRoutes);
app.use('/api/editors', editorRoutes);
app.use('/api/statistics', statisticsRoutes);

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Returns `200 OK` with the current ISO timestamp when the API is reachable.
 *     responses:
 *       200:
 *         description: Service is up
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/HealthResponse' }
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to React app for non-API routes
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(errorHandler);

export { app };
