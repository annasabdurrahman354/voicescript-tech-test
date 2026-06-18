import type { Request, Response } from 'express';
import { getStatistics } from './statistics.service';
import { ok } from '../../utils/response';

export async function getStatisticsController(req: Request, res: Response) {
  const stats = await getStatistics();
  return ok(res, stats);
}
