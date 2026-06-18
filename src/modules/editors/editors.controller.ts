import type { Request, Response } from 'express';
import { findAllEditors } from './editors.service';
import { ok } from '../../utils/response';

export async function listEditorsController(_req: Request, res: Response) {
  const editors = await findAllEditors();
  return ok(res, editors);
}
