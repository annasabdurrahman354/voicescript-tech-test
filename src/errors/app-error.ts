// src/errors/app-error.ts
// Custom error classes used across the application.
// The centralized error handler maps these to appropriate HTTP status codes.

/** Base class for all application-specific errors. */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
    // Ensures instanceof works correctly after transpilation
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 404 — A requested resource could not be found. */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/** 400 — The request is malformed or violates a business rule. */
export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * 409 — A job status transition was attempted that the state machine does not allow.
 * Lives here (not in domain/) so the domain layer stays dependency-free.
 */
export class InvalidTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(`Invalid transition: cannot move job from ${from} to ${to}`, 409);
  }
}

/** 422 — No available reporter could be found for a job. */
export class NoAvailableReporterError extends AppError {
  constructor() {
    super('No available reporter found for this job', 422);
  }
}
