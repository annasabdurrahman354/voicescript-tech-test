// src/api/controllers/reporter.controller.ts
import type { Request, Response } from 'express';
import * as reporterRepository from '../../repositories/reporter.repository';

/** GET /api/reporters — list all reporters */
export async function listReporters(_req: Request, res: Response) {
  const reporters = await reporterRepository.findAllReporters();
  res.json(reporters);
}
