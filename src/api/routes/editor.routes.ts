// src/api/routes/editor.routes.ts
import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import * as editorController from '../controllers/editor.controller';

const router = Router();

router.get('/', asyncHandler(editorController.listEditors));

export default router;
