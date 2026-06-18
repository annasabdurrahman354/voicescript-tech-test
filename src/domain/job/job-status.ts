// src/domain/job/job-status.ts
// Pure state machine for job status transitions.
// No Prisma, no Express — just data in, data out.

export const JOB_STATUSES = ['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/**
 * Explicit allowlist of valid transitions.
 * To add a new workflow step, just add it here — no other code needs to change.
 */
const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  NEW: ['ASSIGNED'],
  ASSIGNED: ['TRANSCRIBED'],
  TRANSCRIBED: ['REVIEWED'],
  REVIEWED: ['COMPLETED'],
  COMPLETED: [], // terminal state — no further transitions allowed
};

/**
 * Guard function that enforces the state machine rules.
 * Throws if the transition is invalid, returns the new status if valid.
 * Call this BEFORE any database write to fail fast.
 */
export function transitionJobStatus(current: JobStatus, target: JobStatus): JobStatus {
  if (!ALLOWED_TRANSITIONS[current].includes(target)) {
    throw new Error(`Invalid transition: cannot move job from ${current} to ${target}`);
  }
  return target;
}

/**
 * Non-throwing variant — useful for UI checks (e.g. "should this button be enabled?").
 */
export function canTransition(current: JobStatus, target: JobStatus): boolean {
  return ALLOWED_TRANSITIONS[current].includes(target);
}

/**
 * Returns the list of statuses that a job can validly move to from its current status.
 * Useful for building dynamic UI dropdowns.
 */
export function getNextStatuses(current: JobStatus): JobStatus[] {
  return ALLOWED_TRANSITIONS[current];
}
