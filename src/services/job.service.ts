// src/services/job.service.ts
// Orchestrates job management: creates jobs and validates status transitions.
// Calls domain functions + repositories — no business rules defined here.

import { NotFoundError } from '../errors/app-error';
import { transitionJobStatus, type JobStatus } from '../domain/job/job-status';
import * as jobRepository from '../repositories/job.repository';
import type { LocationType } from '@prisma/client';

export interface CreateJobInput {
  caseName: string;
  durationMin: number;
  locationType: LocationType;
  city?: string;
}

/** Returns all jobs with their relations. */
export function getAllJobs() {
  return jobRepository.findAllJobs();
}

/** Returns a single job or throws NotFoundError. */
export async function getJobById(id: string) {
  const job = await jobRepository.findJobById(id);
  if (!job) throw new NotFoundError(`Job with id "${id}" not found`);
  return job;
}

/** Creates a new job with status NEW. */
export function createJob(input: CreateJobInput) {
  return jobRepository.createJob(input);
}

/**
 * Updates a job's status after validating the transition via the state machine.
 * Throws InvalidTransitionError (wrapped as AppError) if the transition is not allowed.
 */
export async function updateJobStatus(id: string, targetStatus: JobStatus) {
  const job = await jobRepository.findJobById(id);
  if (!job) throw new NotFoundError(`Job with id "${id}" not found`);

  // Validate via pure domain function — throws on invalid transition
  transitionJobStatus(job.status as JobStatus, targetStatus);

  return jobRepository.updateJobStatus(id, targetStatus);
}
