import { z } from 'zod';

export const createReporterSchema = z.object({
  name: z.string().min(1, 'name is required'),
  city: z.string().min(1, 'city is required'),
  ratePerMinute: z.number().int().nonnegative('ratePerMinute must be a non-negative integer'),
});

export type CreateReporterInput = z.infer<typeof createReporterSchema>;
