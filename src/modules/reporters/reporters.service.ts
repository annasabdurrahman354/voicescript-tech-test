import { prisma } from '../../lib/prisma';

export async function findAllReporters() {
  return prisma.reporter.findMany({
    orderBy: { name: 'asc' },
  });
}
