import { prisma } from '../../lib/prisma';
import { transitionJobStatus, type JobStatus } from '../../domain/jobStatus';
import { NotFoundError, BadRequestError, NoAvailableReporterError } from '../../errors';
import type { LocationType, Reporter } from '@prisma/client';

export const withRelations = {
  reporter: true,
  editor: true,
  payment: true,
} as const;

export interface FindJobsParams {
  status?: JobStatus;
  locationType?: LocationType;
  search?: string;
  sortBy?: 'caseName' | 'durationMin' | 'city';
}

export async function findAllJobs(params: FindJobsParams = {}) {
  const where: any = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.locationType) {
    where.locationType = params.locationType;
  }

  if (params.search) {
    where.OR = [
      { caseName: { contains: params.search } },
      { city: { contains: params.search } },
    ];
  }

  const orderBy: any = {};
  if (params.sortBy) {
    orderBy[params.sortBy] = 'asc';
  } else {
    orderBy.createdAt = 'desc';
  }

  return prisma.job.findMany({
    where,
    include: withRelations,
    orderBy,
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

export async function getSuggestedReporter(jobId: string): Promise<Reporter | null> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });
  if (!job) {
    throw new NotFoundError(`Job with id "${jobId}" not found`);
  }

  if (job.locationType === 'PHYSICAL') {
    if (!job.city) return null;
    return prisma.reporter.findFirst({
      where: {
        city: job.city,
        available: true,
      },
      orderBy: {
        ratePerMinute: 'asc',
      },
    });
  } else {
    return prisma.reporter.findFirst({
      where: {
        available: true,
      },
      orderBy: {
        ratePerMinute: 'asc',
      },
    });
  }
}

export async function assignReporter(jobId: string, reporterId?: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { payment: true },
  });
  if (!job) {
    throw new NotFoundError(`Job with id "${jobId}" not found`);
  }

  transitionJobStatus(job.status as JobStatus, 'ASSIGNED');

  let targetReporterId = reporterId;
  if (!targetReporterId) {
    const suggested = await getSuggestedReporter(jobId);
    if (!suggested) {
      throw new NoAvailableReporterError();
    }
    targetReporterId = suggested.id;
  }

  const reporter = await prisma.reporter.findUnique({
    where: { id: targetReporterId },
  });
  if (!reporter) {
    throw new NotFoundError(`Reporter with id "${targetReporterId}" not found`);
  }
  if (!reporter.available) {
    throw new BadRequestError(`Reporter "${reporter.name}" is not currently available`);
  }

  const reporterPayout = reporter.ratePerMinute * job.durationMin;

  return prisma.$transaction(async (tx) => {
    await tx.reporter.update({
      where: { id: targetReporterId },
      data: { available: false },
    });

    await tx.job.update({
      where: { id: jobId },
      data: {
        reporterId: targetReporterId,
        status: 'ASSIGNED',
      },
    });

    await tx.payment.upsert({
      where: { jobId },
      update: {
        reporterPayout,
        editorPayout: job.payment?.editorPayout ?? 0,
        totalPayout: reporterPayout + (job.payment?.editorPayout ?? 0),
        calculatedAt: new Date(),
      },
      create: {
        jobId,
        reporterPayout,
        editorPayout: 0,
        totalPayout: reporterPayout,
      },
    });

    return tx.job.findUnique({
      where: { id: jobId },
      include: withRelations,
    });
  });
}

export async function finishTranscription(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });
  if (!job) {
    throw new NotFoundError(`Job with id "${jobId}" not found`);
  }

  transitionJobStatus(job.status as JobStatus, 'TRANSCRIBED');

  if (!job.reporterId) {
    throw new BadRequestError(`Job "${jobId}" is not assigned to a reporter`);
  }

  const reporterId = job.reporterId;

  return prisma.$transaction(async (tx) => {
    await tx.reporter.update({
      where: { id: reporterId },
      data: { available: true },
    });

    await tx.job.update({
      where: { id: jobId },
      data: { status: 'TRANSCRIBED' },
    });

    return tx.job.findUnique({
      where: { id: jobId },
      include: withRelations,
    });
  });
}

export async function assignEditor(jobId: string, editorId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { payment: true },
  });
  if (!job) {
    throw new NotFoundError(`Job with id "${jobId}" not found`);
  }

  transitionJobStatus(job.status as JobStatus, 'REVIEWED');

  const editor = await prisma.editor.findUnique({
    where: { id: editorId },
  });
  if (!editor) {
    throw new NotFoundError(`Editor with id "${editorId}" not found`);
  }
  if (!editor.available) {
    throw new BadRequestError(`Editor "${editor.name}" is not currently available`);
  }

  const editorPayout = editor.flatFee;
  const reporterPayout = job.payment?.reporterPayout ?? 0;

  return prisma.$transaction(async (tx) => {
    await tx.editor.update({
      where: { id: editorId },
      data: { available: false },
    });

    await tx.job.update({
      where: { id: jobId },
      data: {
        editorId,
        status: 'REVIEWED',
      },
    });

    await tx.payment.upsert({
      where: { jobId },
      update: {
        editorPayout,
        totalPayout: reporterPayout + editorPayout,
        calculatedAt: new Date(),
      },
      create: {
        jobId,
        reporterPayout,
        editorPayout,
        totalPayout: reporterPayout + editorPayout,
      },
    });

    return tx.job.findUnique({
      where: { id: jobId },
      include: withRelations,
    });
  });
}

export async function finishJob(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { payment: true },
  });
  if (!job) {
    throw new NotFoundError(`Job with id "${jobId}" not found`);
  }

  transitionJobStatus(job.status as JobStatus, 'COMPLETED');

  if (!job.editorId) {
    throw new BadRequestError(`Job "${jobId}" is not assigned to an editor`);
  }

  const editorId = job.editorId;
  const reporterPayout = job.payment?.reporterPayout ?? 0;
  const editorPayout = job.payment?.editorPayout ?? 0;
  const totalPayout = reporterPayout + editorPayout;

  return prisma.$transaction(async (tx) => {
    await tx.editor.update({
      where: { id: editorId },
      data: { available: true },
    });

    await tx.job.update({
      where: { id: jobId },
      data: { status: 'COMPLETED' },
    });

    await tx.payment.upsert({
      where: { jobId },
      update: {
        totalPayout,
        calculatedAt: new Date(),
      },
      create: {
        jobId,
        reporterPayout,
        editorPayout,
        totalPayout,
        calculatedAt: new Date(),
      },
    });

    return tx.job.findUnique({
      where: { id: jobId },
      include: withRelations,
    });
  });
}
