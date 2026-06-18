// src/api/middleware/validate.ts
// Generic Zod validation middleware.
// Parses req.body against the provided schema and responds with 400 on failure.

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Returns an Express middleware that validates `req.body` against `schema`.
 * On success: overwrites `req.body` with the parsed (typed) data and calls `next()`.
 * On failure: responds 400 with a structured error describing which fields failed.
 *
 * Usage:
 *   router.post('/jobs', validate(createJobSchema), asyncHandler(controller.create));
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
