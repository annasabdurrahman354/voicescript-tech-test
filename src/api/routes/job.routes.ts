// src/api/routes/job.routes.ts
// Registers all job-related routes and wires up validation + handlers.

import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { validate } from '../middleware/validate';
import { createJobSchema, updateStatusSchema } from '../validators/job.schema';
import { assignEditorSchema } from '../validators/assignment.schema';
import * as jobController from '../controllers/job.controller';

const router = Router();

// Job CRUD
router.get('/', asyncHandler(jobController.listJobs));
router.get('/:id', asyncHandler(jobController.getJob));
router.post('/', validate(createJobSchema), asyncHandler(jobController.createJob));

// Status management
router.patch('/:id/status', validate(updateStatusSchema), asyncHandler(jobController.updateStatus));

// Assignment
router.post('/:id/assign-reporter', asyncHandler(jobController.assignReporter));
router.post(
  '/:id/assign-editor',
  validate(assignEditorSchema),
  asyncHandler(jobController.assignEditor),
);

// Payment
router.get('/:id/payment', asyncHandler(jobController.getPayment));

export default router;
