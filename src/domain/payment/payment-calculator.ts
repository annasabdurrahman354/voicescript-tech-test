// src/domain/payment/payment-calculator.ts
// Pure payment calculation functions.
// No database access, no side effects — fully deterministic given the same inputs.

export interface PaymentInput {
  durationMin: number;
  reporterRatePerMinute: number; // IDR per minute
  editorFlatFee: number; // IDR flat fee (0 if no editor assigned yet)
}

export interface PaymentResult {
  reporterPayout: number; // IDR
  editorPayout: number; // IDR
  totalPayout: number; // IDR
}

/**
 * Calculates the total payout for a job.
 *
 * Rules:
 * - Reporter is paid per minute: durationMin × ratePerMinute
 * - Editor is paid a flat fee per job
 * - Total is the sum of both
 */
export function calculatePayment(input: PaymentInput): PaymentResult {
  if (input.durationMin < 0) {
    throw new Error('Duration cannot be negative');
  }
  if (input.reporterRatePerMinute < 0) {
    throw new Error('Reporter rate cannot be negative');
  }
  if (input.editorFlatFee < 0) {
    throw new Error('Editor flat fee cannot be negative');
  }

  const reporterPayout = input.durationMin * input.reporterRatePerMinute;
  const editorPayout = input.editorFlatFee;
  const totalPayout = reporterPayout + editorPayout;

  return { reporterPayout, editorPayout, totalPayout };
}
