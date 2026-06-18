import { prisma } from '../../lib/prisma';
import { transitionJobStatus, type JobStatus } from '../../domain/jobStatus';
import { selectBestReporter } from '../../domain/reporterRanking';
import { withRelations } from '../jobs/jobs.service';
import { NotFoundError, BadRequestError, NoAvailableReporterError } from '../../errors';

export async function assignReporter(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });
  if (!job) {
    throw new NotFoundError(`Job with id "${jobId}" not found`);
  }

  // Validate transition NEW -> ASSIGNED
  transitionJobStatus(job.status as JobStatus, 'ASSIGNED');

  const availableReporters = await prisma.reporter.findMany({
    where: { available: true },
    orderBy: { name: 'asc' },
  });

  const bestReporter = selectBestReporter(availableReporters, {
    locationType: job.locationType,
    jobCity: job.city ?? undefined,
  });

  if (!bestReporter) {
    throw new NoAvailableReporterError();
  }

  return prisma.job.update({
    where: { id: jobId },
    data: {
      reporterId: bestReporter.id,
      status: 'ASSIGNED',
    },
    include: withRelations,
  });
}

export async function assignEditor(jobId: string, editorId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });
  if (!job) {
    throw new NotFoundError(`Job with id "${jobId}" not found`);
  }

  if (job.status === 'NEW' || job.status === 'ASSIGNED') {
    throw new BadRequestError(
      `Cannot assign an editor until the job has been transcribed. Current status: ${job.status}`,
    );
  }

  const editor = await prisma.editor.findUnique({
    where: { id: editorId },
  });
  if (!editor) {
    throw new NotFoundError(`Editor with id "${editorId}" not found`);
  }
  if (!editor.available) {
    throw new BadRequestError(`Editor "${editor.name}" is not currently available`);
  }

  return prisma.job.update({
    where: { id: jobId },
    data: { editorId },
    include: withRelations,
  });
}
