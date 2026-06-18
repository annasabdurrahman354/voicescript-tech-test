// src/services/assignment.service.ts
// Orchestrates reporter and editor assignment for jobs.
// Uses domain ranking logic + repositories to find and assign the best match.

import { NotFoundError, NoAvailableReporterError, BadRequestError } from '../errors/app-error';
import { transitionJobStatus, type JobStatus } from '../domain/job/job-status';
import { selectBestReporter } from '../domain/assignment/reporter-ranking';
import * as jobRepository from '../repositories/job.repository';
import * as reporterRepository from '../repositories/reporter.repository';
import * as editorRepository from '../repositories/editor.repository';

/**
 * Automatically selects and assigns the best available reporter to a job.
 *
 * Flow:
 * 1. Load job — fail if not found
 * 2. Validate status transition (NEW → ASSIGNED) — fail fast before any DB writes
 * 3. Load available reporters
 * 4. Rank reporters using pure domain logic (city preference, location type)
 * 5. Assign the top-ranked reporter and update job status atomically
 */
export async function assignReporterToJob(jobId: string) {
  const job = await jobRepository.findJobById(jobId);
  if (!job) throw new NotFoundError(`Job with id "${jobId}" not found`);

  // Validate the transition before touching the DB
  transitionJobStatus(job.status as JobStatus, 'ASSIGNED');

  const candidates = await reporterRepository.findAvailableReporters();
  const best = selectBestReporter(candidates, {
    locationType: job.locationType,
    jobCity: job.city ?? undefined,
  });

  if (!best) throw new NoAvailableReporterError();

  return jobRepository.assignReporterAndSetStatus(jobId, best.id);
}

/**
 * Assigns a specific editor to a job.
 * The job must have a reporter already (status >= ASSIGNED or TRANSCRIBED is expected).
 */
export async function assignEditorToJob(jobId: string, editorId: string) {
  const job = await jobRepository.findJobById(jobId);
  if (!job) throw new NotFoundError(`Job with id "${jobId}" not found`);

  // Editor assignment is only meaningful after the job has been transcribed
  if (job.status === 'NEW' || job.status === 'ASSIGNED') {
    throw new BadRequestError(
      'Cannot assign an editor until the job has been transcribed. ' +
        `Current status: ${job.status}`,
    );
  }

  const editor = await editorRepository.findEditorById(editorId);
  if (!editor) throw new NotFoundError(`Editor with id "${editorId}" not found`);
  if (!editor.available) {
    throw new BadRequestError(`Editor "${editor.name}" is not currently available`);
  }

  return jobRepository.assignEditor(jobId, editorId);
}
