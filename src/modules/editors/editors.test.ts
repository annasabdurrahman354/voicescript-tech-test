import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../lib/prisma';
import { findAllEditors, createEditor, findEditorById } from './editors.service';

describe('Editor Service Integration Tests', () => {
  beforeEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.job.deleteMany();
    await prisma.reporter.deleteMany();
    await prisma.editor.deleteMany();

    await prisma.editor.create({
      data: { name: 'Alice Editor', available: true, flatFee: 40000 },
    });
    await prisma.editor.create({
      data: { name: 'Bob Editor', available: false, flatFee: 60000 },
    });
    await prisma.editor.create({
      data: { name: 'Charlie Editor', available: true, flatFee: 50000 },
    });
  });

  afterEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.job.deleteMany();
    await prisma.reporter.deleteMany();
    await prisma.editor.deleteMany();
  });

  it('filters by availability correctly', async () => {
    const availableEditors = await findAllEditors({ available: true });
    expect(availableEditors.length).toBe(2);
    expect(availableEditors.map((e) => e.name)).toContain('Alice Editor');
    expect(availableEditors.map((e) => e.name)).toContain('Charlie Editor');

    const unavailableEditors = await findAllEditors({ available: false });
    expect(unavailableEditors.length).toBe(1);
    expect(unavailableEditors[0].name).toBe('Bob Editor');
  });

  it('searches by name correctly', async () => {
    const searchedEditors = await findAllEditors({ search: 'Charlie' });
    expect(searchedEditors.length).toBe(1);
    expect(searchedEditors[0].name).toBe('Charlie Editor');
  });

  it('sorts by flatfee and name correctly', async () => {
    const sortedByFee = await findAllEditors({ sortBy: 'flatfee' });
    expect(sortedByFee[0].flatFee).toBe(40000);
    expect(sortedByFee[1].flatFee).toBe(50000);
    expect(sortedByFee[2].flatFee).toBe(60000);

    const sortedByName = await findAllEditors({ sortBy: 'name' });
    expect(sortedByName[0].name).toBe('Alice Editor');
    expect(sortedByName[1].name).toBe('Bob Editor');
    expect(sortedByName[2].name).toBe('Charlie Editor');
  });

  it('finds editor by ID and creates editor', async () => {
    const newEditor = await createEditor({ name: 'David Editor', flatFee: 35000 });
    const fetched = await findEditorById(newEditor.id);
    expect(fetched.name).toBe('David Editor');
    expect(fetched.flatFee).toBe(35000);
    expect(fetched.available).toBe(true);
  });
});
