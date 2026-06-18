import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../lib/prisma';
import { findAllReporters, createReporter, findReporterById } from './reporters.service';

describe('Reporter Service Integration Tests', () => {
  beforeEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.job.deleteMany();
    await prisma.reporter.deleteMany();
    await prisma.editor.deleteMany();

    await prisma.reporter.create({
      data: { name: 'Alice Reporter', city: 'Jakarta', available: true, ratePerMinute: 2000 },
    });
    await prisma.reporter.create({
      data: { name: 'Bob Reporter', city: 'Bandung', available: false, ratePerMinute: 3000 },
    });
    await prisma.reporter.create({
      data: { name: 'Charlie Reporter', city: 'Surabaya', available: true, ratePerMinute: 2500 },
    });
  });

  afterEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.job.deleteMany();
    await prisma.reporter.deleteMany();
    await prisma.editor.deleteMany();
  });

  it('filters by availability correctly', async () => {
    const availableReporters = await findAllReporters({ available: true });
    expect(availableReporters.length).toBe(2);
    expect(availableReporters.map((r) => r.name)).toContain('Alice Reporter');
    expect(availableReporters.map((r) => r.name)).toContain('Charlie Reporter');
  });

  it('searches by name or city correctly', async () => {
    // search by name
    const searchName = await findAllReporters({ search: 'Charlie' });
    expect(searchName.length).toBe(1);
    expect(searchName[0].name).toBe('Charlie Reporter');

    // search by city
    const searchCity = await findAllReporters({ search: 'Bandung' });
    expect(searchCity.length).toBe(1);
    expect(searchCity[0].name).toBe('Bob Reporter');
  });

  it('sorts correctly', async () => {
    const sortedByRate = await findAllReporters({ sortBy: 'ratePerMinute' });
    expect(sortedByRate[0].ratePerMinute).toBe(2000);
    expect(sortedByRate[1].ratePerMinute).toBe(2500);
    expect(sortedByRate[2].ratePerMinute).toBe(3000);

    const sortedByCity = await findAllReporters({ sortBy: 'city' });
    expect(sortedByCity[0].city).toBe('Bandung');
    expect(sortedByCity[1].city).toBe('Jakarta');
    expect(sortedByCity[2].city).toBe('Surabaya');
  });

  it('finds reporter by ID and creates reporter', async () => {
    const newReporter = await createReporter({ name: 'David Reporter', city: 'Medan', ratePerMinute: 1800 });
    const fetched = await findReporterById(newReporter.id);
    expect(fetched.name).toBe('David Reporter');
    expect(fetched.city).toBe('Medan');
    expect(fetched.available).toBe(true);
  });
});
