import { z } from 'zod';

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

export const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED']),
});

export const assignEditorSchema = z.object({
  editorId: z.string().uuid('editorId must be a valid UUID'),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AssignEditorInput = z.infer<typeof assignEditorSchema>;
