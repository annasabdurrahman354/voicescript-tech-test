// src/api/validators/assignment.schema.ts
// Zod schemas for assignment request bodies.

import { z } from 'zod';

/**
 * Schema for POST /api/jobs/:id/assign-editor
 * Requires an explicit editorId to assign.
 */
export const assignEditorSchema = z.object({
  editorId: z.string().uuid('editorId must be a valid UUID'),
});

export type AssignEditorInput = z.infer<typeof assignEditorSchema>;
