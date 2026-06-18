// src/services/payment.service.ts
// Calculates and persists the payment for a completed job.

import { NotFoundError, BadRequestError } from '../errors/app-error';
import { calculatePayment } from '../domain/payment/payment-calculator';
import * as jobRepository from '../repositories/job.repository';
import * as paymentRepository from '../repositories/payment.repository';

/**
 * Calculates and stores (or updates) the payment for a job.
 *
 * Requirements:
 * - Job must exist
 * - Job must have a reporter assigned (reporter rate is required for calculation)
 * - Editor fee defaults to 0 if no editor assigned yet
 *
 * Returns the saved Payment record.
 */
export async function calculateJobPayment(jobId: string) {
  const job = await jobRepository.findJobById(jobId);
  if (!job) throw new NotFoundError(`Job with id "${jobId}" not found`);

  if (!job.reporter) {
    throw new BadRequestError(
      'Cannot calculate payment: job has no assigned reporter yet.',
    );
  }

  // Pure domain calculation — no DB, no side effects
  const result = calculatePayment({
    durationMin: job.durationMin,
    reporterRatePerMinute: job.reporter.ratePerMinute,
    editorFlatFee: job.editor?.flatFee ?? 0,
  });

  // Persist with upsert so recalculation is safe
  return paymentRepository.upsertPaymentForJob(jobId, result);
}

/** Returns the existing payment record for a job, or null if not yet calculated. */
export async function getJobPayment(jobId: string) {
  const job = await jobRepository.findJobById(jobId);
  if (!job) throw new NotFoundError(`Job with id "${jobId}" not found`);

  return paymentRepository.findPaymentByJobId(jobId);
}
