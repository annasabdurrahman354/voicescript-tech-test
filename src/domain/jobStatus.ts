import { InvalidTransitionError } from '../errors';

export const JOB_STATUSES = ['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  NEW: ['ASSIGNED'],
  ASSIGNED: ['TRANSCRIBED'],
  TRANSCRIBED: ['REVIEWED'],
  REVIEWED: ['COMPLETED'],
  COMPLETED: [],
};

function formatStatus(status: JobStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function transitionJobStatus(current: JobStatus, target: JobStatus): JobStatus {
  if (!ALLOWED_TRANSITIONS[current].includes(target)) {
    throw new InvalidTransitionError(formatStatus(current), formatStatus(target));
  }
  return target;
}
