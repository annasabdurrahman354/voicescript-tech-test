// src/api/routes/reporter.routes.ts
import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import * as reporterController from '../controllers/reporter.controller';

const router = Router();

router.get('/', asyncHandler(reporterController.listReporters));

export default router;
