import { BadRequestError } from '../errors';

export interface PaymentInput {
  durationMin: number;
  reporterRatePerMinute: number;
  editorFlatFee: number;
}

export interface PaymentResult {
  reporterPayout: number;
  editorPayout: number;
  totalPayout: number;
}

export function calculatePayment(input: PaymentInput): PaymentResult {
  if (input.durationMin < 0) {
    throw new BadRequestError('Duration cannot be negative');
  }
  if (input.reporterRatePerMinute < 0) {
    throw new BadRequestError('Reporter rate cannot be negative');
  }
  if (input.editorFlatFee < 0) {
    throw new BadRequestError('Editor flat fee cannot be negative');
  }

  const reporterPayout = input.durationMin * input.reporterRatePerMinute;
  const editorPayout = input.editorFlatFee;
  const totalPayout = reporterPayout + editorPayout;

  return { reporterPayout, editorPayout, totalPayout };
}
