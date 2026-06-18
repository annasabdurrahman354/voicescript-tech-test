import { z } from 'zod';

export const createEditorSchema = z.object({
  name: z.string().min(1, 'name is required'),
  flatFee: z.number().int().nonnegative('flatFee must be a non-negative integer'),
});

export type CreateEditorInput = z.infer<typeof createEditorSchema>;
