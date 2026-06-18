import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../lib/prisma';
import { getStatistics } from './statistics.service';

describe('Statistics Service Integration Tests', () => {
  beforeEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.job.deleteMany();
    await prisma.reporter.deleteMany();
    await prisma.editor.deleteMany();

    // 1. Create Jobs
    // 1 remote NEW
    await prisma.job.create({
      data: { caseName: 'Job A', durationMin: 60, locationType: 'REMOTE', city: null, status: 'NEW' },
    });
    // 1 physical ASSIGNED
    await prisma.job.create({
      data: { caseName: 'Job B', durationMin: 90, locationType: 'PHYSICAL', city: 'Jakarta', status: 'ASSIGNED' },
    });
    // 1 remote COMPLETED with payment
    const jobC = await prisma.job.create({
      data: { caseName: 'Job C', durationMin: 120, locationType: 'REMOTE', city: null, status: 'COMPLETED' },
    });
    await prisma.payment.create({
      data: {
        jobId: jobC.id,
        reporterPayout: 240000,
        editorPayout: 50000,
        totalPayout: 290000,
      },
    });

    // 2. Create Reporters: 3 available, 1 unavailable
    await prisma.reporter.create({ data: { name: 'Rep A', city: 'Jakarta', ratePerMinute: 2000, available: true } });
    await prisma.reporter.create({ data: { name: 'Rep B', city: 'Surabaya', ratePerMinute: 1800, available: true } });
    await prisma.reporter.create({ data: { name: 'Rep C', city: 'Bandung', ratePerMinute: 2200, available: true } });
    await prisma.reporter.create({ data: { name: 'Rep D', city: 'Jakarta', ratePerMinute: 2000, available: false } });

    // 3. Create Editors: 1 available, 1 unavailable
    await prisma.editor.create({ data: { name: 'Ed A', flatFee: 50000, available: true } });
    await prisma.editor.create({ data: { name: 'Ed B', flatFee: 60000, available: false } });
  });

  afterEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.job.deleteMany();
    await prisma.reporter.deleteMany();
    await prisma.editor.deleteMany();
  });

  it('aggregates statistics correctly', async () => {
    const stats = await getStatistics();

    // Verify Jobs
    expect(stats.jobs.total).toBe(3);
    expect(stats.jobs.byStatus.NEW).toBe(1);
    expect(stats.jobs.byStatus.ASSIGNED).toBe(1);
    expect(stats.jobs.byStatus.TRANSCRIBED).toBe(0);
    expect(stats.jobs.byStatus.REVIEWED).toBe(0);
    expect(stats.jobs.byStatus.COMPLETED).toBe(1);
    expect(stats.jobs.byLocation.REMOTE).toBe(2);
    expect(stats.jobs.byLocation.PHYSICAL).toBe(1);

    // Verify Reporters
    expect(stats.reporters.total).toBe(4);
    expect(stats.reporters.available).toBe(3);
    expect(stats.reporters.unavailable).toBe(1);

    // Verify Editors
    expect(stats.editors.total).toBe(2);
    expect(stats.editors.available).toBe(1);
    expect(stats.editors.unavailable).toBe(1);

    // Verify Payouts
    expect(stats.payouts.reporter).toBe(240000);
    expect(stats.payouts.editor).toBe(50000);
    expect(stats.payouts.total).toBe(290000);
  });
});
