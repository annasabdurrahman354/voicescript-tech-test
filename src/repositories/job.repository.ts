// src/repositories/job.repository.ts
// All Prisma calls for Job live here — nowhere else in the codebase.

import { prisma } from '../config/prisma-client';
import type { JobStatus, LocationType } from '@prisma/client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CreateJobData {
  caseName: string;
  durationMin: number;
  locationType: LocationType;
  city?: string;
}

// ── Query helpers ──────────────────────────────────────────────────────────────

/** Include reporter and editor relations in every detail query */
const withRelations = {
  reporter: true,
  editor: true,
  payment: true,
} as const;

// ── Repository functions ───────────────────────────────────────────────────────

/** Returns all jobs including their assigned reporter, editor, and payment. */
export function findAllJobs() {
  return prisma.job.findMany({
    include: withRelations,
    orderBy: { createdAt: 'desc' },
  });
}

/** Returns a single job by ID, or null if not found. */
export function findJobById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: withRelations,
  });
}

/** Creates a new job with status NEW. */
export function createJob(data: CreateJobData) {
  return prisma.job.create({
    data,
    include: withRelations,
  });
}

/** Updates just the status field of a job. */
export function updateJobStatus(id: string, status: JobStatus) {
  return prisma.job.update({
    where: { id },
    data: { status },
    include: withRelations,
  });
}

/** Assigns a reporter to a job and sets status to ASSIGNED in a single update. */
export function assignReporterAndSetStatus(jobId: string, reporterId: string) {
  return prisma.job.update({
    where: { id: jobId },
    data: { reporterId, status: 'ASSIGNED' },
    include: withRelations,
  });
}

/** Assigns an editor to a job without changing the status. */
export function assignEditor(jobId: string, editorId: string) {
  return prisma.job.update({
    where: { id: jobId },
    data: { editorId },
    include: withRelations,
  });
}
