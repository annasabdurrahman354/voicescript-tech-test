// src/repositories/payment.repository.ts
// All Prisma calls for Payment live here.

import { prisma } from '../config/prisma-client';
import type { PaymentResult } from '../domain/payment/payment-calculator';

/**
 * Creates or updates the payment record for a job.
 * Uses upsert so it's safe to call multiple times (e.g. if reporter is re-assigned).
 */
export function upsertPaymentForJob(jobId: string, result: PaymentResult) {
  return prisma.payment.upsert({
    where: { jobId },
    update: {
      reporterPayout: result.reporterPayout,
      editorPayout: result.editorPayout,
      totalPayout: result.totalPayout,
      calculatedAt: new Date(),
    },
    create: {
      jobId,
      reporterPayout: result.reporterPayout,
      editorPayout: result.editorPayout,
      totalPayout: result.totalPayout,
    },
  });
}

/** Returns the payment record for a job, or null if not yet calculated. */
export function findPaymentByJobId(jobId: string) {
  return prisma.payment.findUnique({ where: { jobId } });
}
