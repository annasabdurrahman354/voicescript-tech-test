import { Router } from 'express';
import { listEditorsController } from './editors.controller';

const router = Router();

router.get('/', listEditorsController);

export default router;
