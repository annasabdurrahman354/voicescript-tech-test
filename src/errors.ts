export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NoAvailableReporterError extends AppError {
  constructor() {
    super('No available reporter found for this job', 422);
  }
}

export class InvalidTransitionError extends AppError {
  constructor(current: string, target: string) {
    super(`Cannot move job from "${current}" to "${target}"`, 409);
  }
}

