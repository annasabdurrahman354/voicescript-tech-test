import { Router } from 'express';
import {
  listJobsController,
  getJobController,
  createJobController,
  updateStatusController,
} from './jobs.controller';
import {
  assignReporterController,
  assignEditorController,
} from '../assignments/assignments.controller';
import { getPaymentController } from '../payments/payments.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createJobSchema, updateStatusSchema, assignEditorSchema } from './job.schema';

const router = Router();

// Job CRUD
router.get('/', listJobsController);
router.get('/:id', getJobController);
router.post('/', validateRequest(createJobSchema), createJobController);

// Status Management
router.patch('/:id/status', validateRequest(updateStatusSchema), updateStatusController);

// Assignment Endpoints
router.post('/:id/assign-reporter', assignReporterController);
router.post('/:id/assign-editor', validateRequest(assignEditorSchema), assignEditorController);

// Payment Endpoints
router.get('/:id/payment', getPaymentController);

export default router;
