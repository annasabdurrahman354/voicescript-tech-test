// src/api/validators/job.schema.ts
// Zod schemas for job-related request bodies.

import { z } from 'zod';

/**
 * Schema for POST /api/jobs
 * - city is required when locationType is PHYSICAL
 */
export const createJobSchema = z
  .object({
    caseName: z.string().min(1, 'caseName is required'),
    durationMin: z.number().int().positive('durationMin must be a positive integer'),
    locationType: z.enum(['PHYSICAL', 'REMOTE']),
    city: z.string().min(1).optional(),
  })
  .refine((data) => data.locationType === 'REMOTE' || Boolean(data.city), {
    message: 'city is required for PHYSICAL jobs',
    path: ['city'],
  });

/**
 * Schema for PATCH /api/jobs/:id/status
 * Accepts only the statuses defined in the workflow.
 */
export const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED']),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
