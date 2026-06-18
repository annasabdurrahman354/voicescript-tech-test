import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // Express error-handling middleware.
  // Must be registered LAST in app.ts (after all routes).
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Internal server error' });
}
