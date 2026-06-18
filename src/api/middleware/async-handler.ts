// src/api/middleware/async-handler.ts
// Wraps async route handlers so thrown errors automatically flow to Express's
// error handler middleware instead of causing unhandled promise rejections.

import type { Request, Response, NextFunction } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async Express handler, catching any rejected promise and forwarding
 * it to `next(err)` so the centralized error handler can process it.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }));
 */
export function asyncHandler(handler: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
