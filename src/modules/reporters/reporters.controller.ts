import type { Request, Response } from 'express';
import { findAllReporters } from './reporters.service';
import { ok } from '../../utils/response';

export async function listReportersController(_req: Request, res: Response) {
  const reporters = await findAllReporters();
  return ok(res, reporters);
}
