import { Router } from 'express';
import { listReportersController } from './reporters.controller';

const router = Router();

router.get('/', listReportersController);

export default router;
