// src/repositories/editor.repository.ts
// All Prisma calls for Editor live here.

import { prisma } from '../config/prisma-client';

/** Returns all editors. */
export function findAllEditors() {
  return prisma.editor.findMany({ orderBy: { name: 'asc' } });
}

/** Returns only editors currently marked available. */
export function findAvailableEditors() {
  return prisma.editor.findMany({
    where: { available: true },
    orderBy: { name: 'asc' },
  });
}

/** Returns a single editor by ID, or null. */
export function findEditorById(id: string) {
  return prisma.editor.findUnique({ where: { id } });
}
