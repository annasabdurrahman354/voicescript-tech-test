import { prisma } from '../../lib/prisma';
import { transitionJobStatus, type JobStatus } from '../../domain/jobStatus';
import { NotFoundError } from '../../errors';
import type { LocationType } from '@prisma/client';

export const withRelations = {
  reporter: true,
  editor: true,
  payment: true,
} as const;

export async function findAllJobs() {
  return prisma.job.findMany({
    include: withRelations,
    orderBy: { createdAt: 'desc' },
  });
}

export async function findJobById(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: withRelations,
  });
  if (!job) {
    throw new NotFoundError(`Job with id "${id}" not found`);
  }
  return job;
}

export async function createJob(data: {
  caseName: string;
  durationMin: number;
  locationType: LocationType;
  city?: string;
}) {
  return prisma.job.create({
    data: {
      caseName: data.caseName,
      durationMin: data.durationMin,
      locationType: data.locationType,
      city: data.city ?? null,
    },
    include: withRelations,
  });
}

export async function updateJobStatus(id: string, targetStatus: JobStatus) {
  const job = await prisma.job.findUnique({
    where: { id },
  });
  if (!job) {
    throw new NotFoundError(`Job with id "${id}" not found`);
  }

  // Enforce transition rules
  transitionJobStatus(job.status as JobStatus, targetStatus);

  return prisma.job.update({
    where: { id },
    data: { status: targetStatus },
    include: withRelations,
  });
}
