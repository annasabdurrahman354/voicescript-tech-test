import { prisma } from '../../lib/prisma';
import { calculatePayment } from '../../domain/paymentCalculator';
import { NotFoundError, BadRequestError } from '../../errors';

export async function getOrCalculatePayment(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      reporter: true,
      editor: true,
    },
  });
  if (!job) {
    throw new NotFoundError(`Job with id "${jobId}" not found`);
  }

  if (!job.reporter) {
    throw new BadRequestError('Cannot calculate payment job has no assigned reporter yet.');
  }

  const result = calculatePayment({
    durationMin: job.durationMin,
    reporterRatePerMinute: job.reporter.ratePerMinute,
    editorFlatFee: job.editor?.flatFee ?? 0,
  });

  return prisma.payment.upsert({
    where: { jobId },
    update: {
      reporterPayout: result.reporterPayout,
      editorPayout: result.editorPayout,
      totalPayout: result.totalPayout,
      calculatedAt: new Date(),
    },
    create: {
      jobId,
      reporterPayout: result.reporterPayout,
      editorPayout: result.editorPayout,
      totalPayout: result.totalPayout,
    },
  });
}
