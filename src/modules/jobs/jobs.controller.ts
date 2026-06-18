import type { Request, Response } from 'express';
import { findAllJobs, findJobById, createJob, updateJobStatus } from './jobs.service';
import type { JobStatus } from '../../domain/jobStatus';
import type { LocationType } from '@prisma/client';
import { ok, created } from '../../utils/response';
import { getString, getInt } from '../../utils/parse';

export async function listJobsController(_req: Request, res: Response) {
  const jobs = await findAllJobs();
  return ok(res, jobs);
}

export async function getJobController(req: Request, res: Response) {
  const id = getString(req.params.id);
  const job = await findJobById(id);
  return ok(res, job);
}

export async function createJobController(req: Request, res: Response) {
  const job = await createJob({
    caseName: getString(req.body.caseName),
    durationMin: getInt(req.body.durationMin),
    locationType: req.body.locationType as LocationType,
    city: req.body.city ? getString(req.body.city) : undefined,
  });
  return created(res, job);
}

export async function updateStatusController(req: Request, res: Response) {
  const id = getString(req.params.id);
  const status = req.body.status as JobStatus;
  const job = await updateJobStatus(id, status);
  return ok(res, job);
}
