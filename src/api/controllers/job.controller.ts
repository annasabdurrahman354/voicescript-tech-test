// src/api/controllers/job.controller.ts
// Thin HTTP handlers — parse request, call service, shape response.
// No business logic lives here.

import type { Request, Response } from 'express';
import * as jobService from '../../services/job.service';
import * as assignmentService from '../../services/assignment.service';
import * as paymentService from '../../services/payment.service';
import type { JobStatus } from '../../domain/job/job-status';
import type { LocationType } from '@prisma/client';

/** GET /api/jobs — list all jobs */
export async function listJobs(_req: Request, res: Response) {
  const jobs = await jobService.getAllJobs();
  res.json(jobs);
}

/** GET /api/jobs/:id — get job detail */
export async function getJob(req: Request, res: Response) {
  const job = await jobService.getJobById(req.params['id'] as string);
  res.json(job);
}

/** POST /api/jobs — create a new job */
export async function createJob(req: Request, res: Response) {
  const job = await jobService.createJob({
    caseName: req.body.caseName as string,
    durationMin: req.body.durationMin as number,
    locationType: req.body.locationType as LocationType,
    city: req.body.city as string | undefined,
  });
  res.status(201).json(job);
}

/** PATCH /api/jobs/:id/status — advance job status through state machine */
export async function updateStatus(req: Request, res: Response) {
  const job = await jobService.updateJobStatus(
    req.params['id'] as string,
    req.body.status as JobStatus,
  );
  res.json(job);
}

/** POST /api/jobs/:id/assign-reporter — auto-assign best available reporter */
export async function assignReporter(req: Request, res: Response) {
  const job = await assignmentService.assignReporterToJob(req.params['id'] as string);
  res.json(job);
}

/** POST /api/jobs/:id/assign-editor — assign a specific editor */
export async function assignEditor(req: Request, res: Response) {
  const job = await assignmentService.assignEditorToJob(
    req.params['id'] as string,
    req.body.editorId as string,
  );
  res.json(job);
}

/** GET /api/jobs/:id/payment — calculate and return payment for the job */
export async function getPayment(req: Request, res: Response) {
  const payment = await paymentService.calculateJobPayment(req.params['id'] as string);
  res.json(payment);
}
