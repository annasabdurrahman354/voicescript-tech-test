import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../errors';

export interface FindReportersParams {
  available?: boolean;
  search?: string;
  sortBy?: 'name' | 'city' | 'ratePerMinute';
}

export async function findAllReporters(params: FindReportersParams = {}) {
  const where: any = {};

  if (params.available !== undefined) {
    where.available = params.available;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { city: { contains: params.search } },
    ];
  }

  const orderBy: any = {};
  if (params.sortBy) {
    orderBy[params.sortBy] = 'asc';
  } else {
    orderBy.name = 'asc';
  }

  return prisma.reporter.findMany({
    where,
    orderBy,
  });
}

export async function findReporterById(id: string) {
  const reporter = await prisma.reporter.findUnique({
    where: { id },
  });
  if (!reporter) {
    throw new NotFoundError(`Reporter with id "${id}" not found`);
  }
  return reporter;
}

export async function createReporter(data: {
  name: string;
  city: string;
  ratePerMinute: number;
  available?: boolean;
}) {
  return prisma.reporter.create({
    data: {
      name: data.name,
      city: data.city,
      ratePerMinute: data.ratePerMinute,
      available: data.available ?? true,
    },
  });
}
