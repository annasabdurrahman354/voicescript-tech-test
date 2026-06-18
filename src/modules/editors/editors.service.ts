import { prisma } from '../../lib/prisma';

export async function findAllEditors() {
  return prisma.editor.findMany({
    orderBy: { name: 'asc' },
  });
}
