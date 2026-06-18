import { z } from 'zod';

export const createJobSchema = z
  .object({
    caseName: z.string().min(1, 'caseName is required'),
    durationMin: z.number().int().positive('durationMin must be a positive integer'),
    locationType: z.enum(['PHYSICAL', 'REMOTE']),
    city: z.string().min(1).nullable().optional(),
  })
  .refine((data) => data.locationType === 'REMOTE' || Boolean(data.city), {
    message: 'city is required for PHYSICAL jobs',
    path: ['city'],
  });

export const assignReporterSchema = z.object({
  reporterId: z.string().uuid('reporterId must be a valid UUID').optional(),
});

export const assignEditorSchema = z.object({
  editorId: z.string().uuid('editorId must be a valid UUID'),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type AssignReporterInput = z.infer<typeof assignReporterSchema>;
export type AssignEditorInput = z.infer<typeof assignEditorSchema>;
