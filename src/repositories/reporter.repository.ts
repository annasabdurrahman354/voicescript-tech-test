// src/repositories/reporter.repository.ts
// All Prisma calls for Reporter live here.

import { prisma } from '../config/prisma-client';

/** Returns all reporters. */
export function findAllReporters() {
  return prisma.reporter.findMany({ orderBy: { name: 'asc' } });
}

/** Returns only reporters currently marked available. */
export function findAvailableReporters() {
  return prisma.reporter.findMany({
    where: { available: true },
    orderBy: { name: 'asc' },
  });
}

/** Returns a single reporter by ID, or null. */
export function findReporterById(id: string) {
  return prisma.reporter.findUnique({ where: { id } });
}
