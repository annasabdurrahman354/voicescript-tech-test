import { describe, it, expect } from 'vitest';
import { transitionJobStatus } from './jobStatus';
import { InvalidTransitionError } from '../errors';

describe('transitionJobStatus', () => {
  // Valid transitions
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

  // Invalid transitions
  it('throws when skipping a step (NEW → TRANSCRIBED)', () => {
    expect(() => transitionJobStatus('NEW', 'TRANSCRIBED')).toThrow(InvalidTransitionError);
    expect(() => transitionJobStatus('NEW', 'TRANSCRIBED')).toThrow(
      'Cannot move job from "New" to "Transcribed"',
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
