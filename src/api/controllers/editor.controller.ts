// src/api/controllers/editor.controller.ts
import type { Request, Response } from 'express';
import * as editorRepository from '../../repositories/editor.repository';

/** GET /api/editors — list all editors */
export async function listEditors(_req: Request, res: Response) {
  const editors = await editorRepository.findAllEditors();
  res.json(editors);
}
