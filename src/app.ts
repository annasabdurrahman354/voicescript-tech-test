// src/app.ts
// Express application assembly — middleware, routes, and error handler.
// No business logic lives here; this file is purely structural.

import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './api/middleware/error-handler';
import jobRoutes from './api/routes/job.routes';
import reporterRoutes from './api/routes/reporter.routes';
import editorRoutes from './api/routes/editor.routes';

const app = express();

// ── Core middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Frontend dashboard ─────────────────────────────────────────────────────────
// Serves the static HTML dashboard from the /public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── API routes ─────────────────────────────────────────────────────────────────
app.use('/api/jobs', jobRoutes);
app.use('/api/reporters', reporterRoutes);
app.use('/api/editors', editorRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error handler ──────────────────────────────────────────────────────────────
// MUST be registered after all routes — Express identifies error handlers
// by their 4-argument signature (err, req, res, next).
app.use(errorHandler);

export { app };
