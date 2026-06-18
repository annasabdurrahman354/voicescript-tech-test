import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../errors';

export interface FindEditorsParams {
  available?: boolean;
  search?: string;
  sortBy?: 'name' | 'flatfee';
}

export async function findAllEditors(params: FindEditorsParams = {}) {
  const where: any = {};

  if (params.available !== undefined) {
    where.available = params.available;
  }

  if (params.search) {
    where.name = {
      contains: params.search,
    };
  }

  const orderBy: any = {};
  if (params.sortBy) {
    const dbField = params.sortBy === 'flatfee' ? 'flatFee' : 'name';
    orderBy[dbField] = 'asc';
  } else {
    orderBy.name = 'asc';
  }

  return prisma.editor.findMany({
    where,
    orderBy,
  });
}

export async function findEditorById(id: string) {
  const editor = await prisma.editor.findUnique({
    where: { id },
  });
  if (!editor) {
    throw new NotFoundError(`Editor with id "${id}" not found`);
  }
  return editor;
}

export async function createEditor(data: { name: string; flatFee: number; available?: boolean }) {
  return prisma.editor.create({
    data: {
      name: data.name,
      flatFee: data.flatFee,
      available: data.available ?? true,
    },
  });
}
