// src/domain/job/job-status.test.ts
import { describe, it, expect } from 'vitest';
import { transitionJobStatus, canTransition, getNextStatuses } from './job-status';

describe('transitionJobStatus', () => {
  // ── Valid transitions ──────────────────────────────────────────────────────

  it('allows NEW → ASSIGNED', () => {
    expect(transitionJobStatus('NEW', 'ASSIGNED')).toBe('ASSIGNED');
  });

  it('allows ASSIGNED → TRANSCRIBED', () => {
    expect(transitionJobStatus('ASSIGNED', 'TRANSCRIBED')).toBe('TRANSCRIBED');
  });

  it('allows TRANSCRIBED → REVIEWED', () => {
    expect(transitionJobStatus('TRANSCRIBED', 'REVIEWED')).toBe('REVIEWED');
  });

  it('allows REVIEWED → COMPLETED', () => {
    expect(transitionJobStatus('REVIEWED', 'COMPLETED')).toBe('COMPLETED');
  });

  // ── Invalid transitions ────────────────────────────────────────────────────

  it('throws when skipping a step (NEW → TRANSCRIBED)', () => {
    expect(() => transitionJobStatus('NEW', 'TRANSCRIBED')).toThrow(
      'Invalid transition: cannot move job from NEW to TRANSCRIBED',
    );
  });

  it('throws when trying to go backwards (ASSIGNED → NEW)', () => {
    expect(() => transitionJobStatus('ASSIGNED', 'NEW')).toThrow();
  });

  it('throws from terminal state COMPLETED → anything', () => {
    expect(() => transitionJobStatus('COMPLETED', 'NEW')).toThrow();
    expect(() => transitionJobStatus('COMPLETED', 'ASSIGNED')).toThrow();
    expect(() => transitionJobStatus('COMPLETED', 'REVIEWED')).toThrow();
  });

  it('throws on same-state transition (NEW → NEW)', () => {
    expect(() => transitionJobStatus('NEW', 'NEW')).toThrow();
  });
});

describe('canTransition', () => {
  it('returns true for valid transitions', () => {
    expect(canTransition('NEW', 'ASSIGNED')).toBe(true);
    expect(canTransition('REVIEWED', 'COMPLETED')).toBe(true);
  });

  it('returns false for invalid transitions without throwing', () => {
    expect(canTransition('NEW', 'TRANSCRIBED')).toBe(false);
    expect(canTransition('COMPLETED', 'NEW')).toBe(false);
    expect(canTransition('NEW', 'NEW')).toBe(false);
  });
});

describe('getNextStatuses', () => {
  it('returns the single valid next status for NEW', () => {
    expect(getNextStatuses('NEW')).toEqual(['ASSIGNED']);
  });

  it('returns empty array for COMPLETED (terminal state)', () => {
    expect(getNextStatuses('COMPLETED')).toEqual([]);
  });
});
