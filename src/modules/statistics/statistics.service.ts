import { prisma } from '../../lib/prisma';

export async function getStatistics() {
  const [
    totalJobs,
    statusGroups,
    locationGroups,
    totalReporters,
    availableReporters,
    totalEditors,
    availableEditors,
    completedPayouts,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.job.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.job.groupBy({ by: ['locationType'], _count: { id: true } }),
    prisma.reporter.count(),
    prisma.reporter.count({ where: { available: true } }),
    prisma.editor.count(),
    prisma.editor.count({ where: { available: true } }),
    prisma.payment.aggregate({
      where: { job: { status: 'COMPLETED' } },
      _sum: {
        reporterPayout: true,
        editorPayout: true,
        totalPayout: true,
      },
    }),
  ]);

  const jobsByStatus = {
    NEW: 0,
    ASSIGNED: 0,
    TRANSCRIBED: 0,
    REVIEWED: 0,
    COMPLETED: 0,
  };
  for (const group of statusGroups) {
    if (group.status in jobsByStatus) {
      jobsByStatus[group.status as keyof typeof jobsByStatus] = group._count.id;
    }
  }

  const jobsByLocation = {
    PHYSICAL: 0,
    REMOTE: 0,
  };
  for (const group of locationGroups) {
    if (group.locationType in jobsByLocation) {
      jobsByLocation[group.locationType as keyof typeof jobsByLocation] = group._count.id;
    }
  }

  return {
    jobs: {
      total: totalJobs,
      byStatus: jobsByStatus,
      byLocation: jobsByLocation,
    },
    reporters: {
      total: totalReporters,
      available: availableReporters,
      unavailable: totalReporters - availableReporters,
    },
    editors: {
      total: totalEditors,
      available: availableEditors,
      unavailable: totalEditors - availableEditors,
    },
    payouts: {
      reporter: completedPayouts._sum.reporterPayout ?? 0,
      editor: completedPayouts._sum.editorPayout ?? 0,
      total: completedPayouts._sum.totalPayout ?? 0,
    },
  };
}
