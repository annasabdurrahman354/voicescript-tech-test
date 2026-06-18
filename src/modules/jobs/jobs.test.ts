import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../lib/prisma';
import {
  findAllJobs,
  createJob,
  getSuggestedReporter,
  assignReporter,
  finishTranscription,
  assignEditor,
  finishJob,
} from './jobs.service';

describe('Job Service Integration Tests', () => {
  beforeEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.job.deleteMany();
    await prisma.reporter.deleteMany();
    await prisma.editor.deleteMany();

    await prisma.job.create({
      data: { caseName: 'Alpha Case', durationMin: 20, locationType: 'PHYSICAL', city: 'Jakarta', status: 'NEW' },
    });
    await prisma.job.create({
      data: { caseName: 'Beta Case', durationMin: 40, locationType: 'REMOTE', city: null, status: 'ASSIGNED' },
    });
    await prisma.job.create({
      data: { caseName: 'Gamma Case', durationMin: 30, locationType: 'PHYSICAL', city: 'Surabaya', status: 'TRANSCRIBED' },
    });
  });

  afterEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.job.deleteMany();
    await prisma.reporter.deleteMany();
    await prisma.editor.deleteMany();
  });

  it('filters by status and locationType correctly', async () => {
    const newJobs = await findAllJobs({ status: 'NEW' });
    expect(newJobs.length).toBe(1);
    expect(newJobs[0].caseName).toBe('Alpha Case');

    const remoteJobs = await findAllJobs({ locationType: 'REMOTE' });
    expect(remoteJobs.length).toBe(1);
    expect(remoteJobs[0].caseName).toBe('Beta Case');
  });

  it('searches by caseName or city correctly', async () => {
    const searchCase = await findAllJobs({ search: 'Beta' });
    expect(searchCase.length).toBe(1);
    expect(searchCase[0].caseName).toBe('Beta Case');

    const searchCity = await findAllJobs({ search: 'Surabaya' });
    expect(searchCity.length).toBe(1);
    expect(searchCity[0].caseName).toBe('Gamma Case');
  });

  it('sorts correctly', async () => {
    const sortedByDuration = await findAllJobs({ sortBy: 'durationMin' });
    expect(sortedByDuration[0].durationMin).toBe(20);
    expect(sortedByDuration[1].durationMin).toBe(30);
    expect(sortedByDuration[2].durationMin).toBe(40);

    const sortedByCaseName = await findAllJobs({ sortBy: 'caseName' });
    expect(sortedByCaseName[0].caseName).toBe('Alpha Case');
    expect(sortedByCaseName[1].caseName).toBe('Beta Case');
    expect(sortedByCaseName[2].caseName).toBe('Gamma Case');
  });

  it('creates job with optional city for remote jobs', async () => {
    const remoteJob = await createJob({
      caseName: 'Remote Test',
      durationMin: 50,
      locationType: 'REMOTE',
    });
    expect(remoteJob.caseName).toBe('Remote Test');
    expect(remoteJob.city).toBeNull();
  });
});

describe('Jobs Workflow Integration Tests', () => {
  let reporterId: string;
  let editorId: string;
  let jobId: string;

  beforeEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.job.deleteMany();
    await prisma.reporter.deleteMany();
    await prisma.editor.deleteMany();

    const reporter = await prisma.reporter.create({
      data: { name: 'Test Reporter', city: 'Jakarta', available: true, ratePerMinute: 2000 },
    });
    reporterId = reporter.id;

    const editor = await prisma.editor.create({
      data: { name: 'Test Editor', available: true, flatFee: 50000 },
    });
    editorId = editor.id;

    const job = await prisma.job.create({
      data: {
        caseName: 'Test Case',
        durationMin: 30,
        locationType: 'PHYSICAL',
        city: 'Jakarta',
        status: 'NEW',
      },
    });
    jobId = job.id;
  });

  afterEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.job.deleteMany();
    await prisma.reporter.deleteMany();
    await prisma.editor.deleteMany();
  });

  it('ranks suggested reporters correctly', async () => {
    const suggestions = await getSuggestedReporter(jobId);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].id).toBe(reporterId);
  });

  it('performs full assignment and workflow transitions correctly', async () => {
    // 1. Assign Reporter
    let job = await assignReporter(jobId, reporterId);
    expect(job?.status).toBe('ASSIGNED');
    expect(job?.reporterId).toBe(reporterId);

    // Verify reporter is now unavailable
    const reporter = await prisma.reporter.findUnique({ where: { id: reporterId } });
    expect(reporter?.available).toBe(false);

    // Verify payment was initiated
    const payment = await prisma.payment.findUnique({ where: { jobId } });
    expect(payment).toBeDefined();
    expect(payment?.reporterPayout).toBe(60000); // 30 mins * 2000 rate
    expect(payment?.editorPayout).toBe(0);
    expect(payment?.totalPayout).toBe(60000);

    // 2. Finish Transcription
    job = await finishTranscription(jobId);
    expect(job?.status).toBe('TRANSCRIBED');

    // Verify reporter is available again
    const reporterAfter = await prisma.reporter.findUnique({ where: { id: reporterId } });
    expect(reporterAfter?.available).toBe(true);

    // 3. Assign Editor
    job = await assignEditor(jobId, editorId);
    expect(job?.status).toBe('REVIEWED');
    expect(job?.editorId).toBe(editorId);

    // Verify editor is now unavailable
    const editor = await prisma.editor.findUnique({ where: { id: editorId } });
    expect(editor?.available).toBe(false);

    // Verify payment updated with editor payout
    const paymentAfterEditor = await prisma.payment.findUnique({ where: { jobId } });
    expect(paymentAfterEditor?.editorPayout).toBe(50000);
    expect(paymentAfterEditor?.totalPayout).toBe(110000); // 60000 + 50000

    // 4. Finish Job
    job = await finishJob(jobId);
    expect(job?.status).toBe('COMPLETED');

    // Verify editor is available again
    const editorAfter = await prisma.editor.findUnique({ where: { id: editorId } });
    expect(editorAfter?.available).toBe(true);

    // Verify payment finalized
    const finalPayment = await prisma.payment.findUnique({ where: { jobId } });
    expect(finalPayment?.totalPayout).toBe(110000);
    expect(finalPayment?.calculatedAt).toBeDefined();
  });

  it('enforces status machine rules', async () => {
    // Cannot skip steps: try to finish transcription without assigning reporter
    await expect(finishTranscription(jobId)).rejects.toThrow();

    // Cannot assign editor before transcription
    await expect(assignEditor(jobId, editorId)).rejects.toThrow();
  });
});
