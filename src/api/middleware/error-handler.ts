// src/api/middleware/error-handler.ts
// Centralized error handler — the single place that maps errors to HTTP status codes.
// This keeps controllers clean and error handling consistent.

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/app-error';

/**
 * Express error-handling middleware (4-argument signature is required by Express).
 * Must be registered LAST in app.ts (after all routes).
 *
 * Mapping:
 * - AppError subclasses → use the statusCode set on the error
 * - Unknown errors      → 500 Internal Server Error (message hidden in production)
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // Known application errors — use the status code we set
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Domain errors thrown from pure functions (no AppError dependency in domain/)
  if (err.message.startsWith('Invalid transition:')) {
    res.status(409).json({ error: err.message });
    return;
  }

  // Unexpected errors — log for debugging, hide details from clients
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Internal server error' });
}
