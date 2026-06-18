import { describe, it, expect } from 'vitest';
import { calculatePayment } from './paymentCalculator';
import { BadRequestError } from '../errors';

describe('calculatePayment', () => {
  // Standard cases
  it('calculates correct total for a standard job', () => {
    const result = calculatePayment({
      durationMin: 60,
      reporterRatePerMinute: 2000,
      editorFlatFee: 50000,
    });
    expect(result).toEqual({
      reporterPayout: 120000, // 60 × 2000
      editorPayout: 50000,
      totalPayout: 170000,
    });
  });

  it('returns zero reporter payout for a zero-duration job', () => {
    const result = calculatePayment({
      durationMin: 0,
      reporterRatePerMinute: 2000,
      editorFlatFee: 50000,
    });
    expect(result.reporterPayout).toBe(0);
    expect(result.totalPayout).toBe(50000); // only editor fee
  });

  it('returns zero editor payout when no editor is assigned (flatFee = 0)', () => {
    const result = calculatePayment({
      durationMin: 30,
      reporterRatePerMinute: 2000,
      editorFlatFee: 0,
    });
    expect(result.editorPayout).toBe(0);
    expect(result.totalPayout).toBe(60000); // 30 × 2000
  });

  it('handles large numbers without precision loss (long hearing)', () => {
    const result = calculatePayment({
      durationMin: 480,
      reporterRatePerMinute: 5000,
      editorFlatFee: 100000,
    });
    expect(result.reporterPayout).toBe(2400000); // 480 × 5000
    expect(result.totalPayout).toBe(2500000);
  });

  it('works when both reporter and editor payouts are zero', () => {
    const result = calculatePayment({
      durationMin: 0,
      reporterRatePerMinute: 0,
      editorFlatFee: 0,
    });
    expect(result).toEqual({ reporterPayout: 0, editorPayout: 0, totalPayout: 0 });
  });

  // Validation errors
  it('throws on negative duration', () => {
    expect(() =>
      calculatePayment({ durationMin: -5, reporterRatePerMinute: 2000, editorFlatFee: 0 }),
    ).toThrow(BadRequestError);
  });

  it('throws on negative reporter rate', () => {
    expect(() =>
      calculatePayment({ durationMin: 60, reporterRatePerMinute: -100, editorFlatFee: 0 }),
    ).toThrow(BadRequestError);
  });

  it('throws on negative editor flat fee', () => {
    expect(() =>
      calculatePayment({ durationMin: 60, reporterRatePerMinute: 2000, editorFlatFee: -1 }),
    ).toThrow(BadRequestError);
  });
});
