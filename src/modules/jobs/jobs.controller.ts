import type { Request, Response } from 'express';
import {
  findAllJobs,
  findJobById,
  createJob,
  assignReporter,
  finishTranscription,
  assignEditor,
  finishJob,
  getSuggestedReporter,
} from './jobs.service';
import type { JobStatus } from '../../domain/jobStatus';
import type { LocationType } from '@prisma/client';
import { ok, created } from '../../utils/response';
import { getString, getInt } from '../../utils/parse';

export async function listJobsController(req: Request, res: Response) {
  const status = req.query.status as JobStatus | undefined;
  const locationType = req.query.locationType as LocationType | undefined;
  const search = req.query.search ? getString(req.query.search) : undefined;
  const sortByQuery = req.query.sortBy ? getString(req.query.sortBy) : undefined;

  let sortBy: 'caseName' | 'durationMin' | 'city' | undefined = undefined;
  if (sortByQuery === 'caseName' || sortByQuery === 'durationMin' || sortByQuery === 'city') {
    sortBy = sortByQuery;
  }

  const jobs = await findAllJobs({ status, locationType, search, sortBy });
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

export async function getSuggestedReporterController(req: Request, res: Response) {
  const jobId = getString(req.params.id);
  const suggested = await getSuggestedReporter(jobId);
  return ok(res, suggested);
}

export async function assignReporterController(req: Request, res: Response) {
  const jobId = getString(req.params.id);
  const reporterId = req.body.reporterId ? getString(req.body.reporterId) : undefined;
  const updatedJob = await assignReporter(jobId, reporterId);
  return ok(res, updatedJob);
}

export async function finishTranscriptionController(req: Request, res: Response) {
  const jobId = getString(req.params.id);
  const updatedJob = await finishTranscription(jobId);
  return ok(res, updatedJob);
}

export async function assignEditorController(req: Request, res: Response) {
  const jobId = getString(req.params.id);
  const editorId = getString(req.body.editorId);
  const updatedJob = await assignEditor(jobId, editorId);
  return ok(res, updatedJob);
}

export async function finishJobController(req: Request, res: Response) {
  const jobId = getString(req.params.id);
  const updatedJob = await finishJob(jobId);
  return ok(res, updatedJob);
}
