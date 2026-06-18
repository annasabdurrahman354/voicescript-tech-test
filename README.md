# Court Reporting Workflow Manager

A backend API for managing court reporting transcription jobs — built for the VoiceScript fullstack assessment.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up the database (one-time)
npx prisma migrate dev --name init

# 3. Seed sample reporters and editors
npm run prisma:seed

# 4. Start the development server
npm run dev
# → http://localhost:3000
```

## Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Runtime    | Node.js + TypeScript         |
| Framework  | Express v5                   |
| ORM        | Prisma v7                    |
| Database   | PostgreSQL (Prisma Postgres) |
| Validation | Zod                          |
| Testing    | Vitest                       |
| Linting    | ESLint + Prettier            |

## Architecture

The codebase follows a **layered architecture** with a strict dependency rule:

```
src/
├── domain/       ← Pure business logic. Zero Prisma/Express imports.
├── services/     ← Orchestration: calls domain fns + repositories.
├── repositories/ ← All Prisma calls. Nowhere else.
├── api/          ← Express routes, controllers, validation.
└── config/       ← Env validation, Prisma client singleton.
```

### Key design decisions

- **Domain layer is dependency-free** — `transitionJobStatus`, `calculatePayment`, and `rankReporters` are pure functions you can unit-test without a database or HTTP server.
- **State machine guard** — the job status transition is enforced by an explicit allowlist. Any invalid transition throws before a single database write happens.
- **Scoring-based reporter ranking** — reporters receive discrete scores (2 = same-city physical, 1 = remote, 0 = other-city physical) making the algorithm easy to extend.
- **Single error handler** — all domain errors bubble up to one centralized `errorHandler` middleware that maps them to correct HTTP status codes.

## API Endpoints

| Method  | Route                           | Description                                  |
| ------- | ------------------------------- | -------------------------------------------- |
| `GET`   | `/api/jobs`                     | List all jobs                                |
| `POST`  | `/api/jobs`                     | Create a job                                 |
| `GET`   | `/api/jobs/:id`                 | Get job detail                               |
| `PATCH` | `/api/jobs/:id/status`          | Advance job status (state machine validated) |
| `POST`  | `/api/jobs/:id/assign-reporter` | Auto-assign best available reporter          |
| `POST`  | `/api/jobs/:id/assign-editor`   | Assign a specific editor                     |
| `GET`   | `/api/jobs/:id/payment`         | Calculate and return job payment             |
| `GET`   | `/api/reporters`                | List all reporters                           |
| `GET`   | `/api/editors`                  | List all editors                             |
| `GET`   | `/api/health`                   | Health check                                 |

## Job Workflow

```
NEW → ASSIGNED → TRANSCRIBED → REVIEWED → COMPLETED
```

- `NEW → ASSIGNED`: triggered by `POST /assign-reporter` (auto-selects best reporter)
- `ASSIGNED → TRANSCRIBED`: manual status update
- `TRANSCRIBED → REVIEWED`: editor can be assigned at this stage
- `REVIEWED → COMPLETED`: final state
- Any other transition is rejected with `409 Conflict`

## Payment Calculation

```
Reporter payout = durationMin × ratePerMinute
Editor payout   = flatFee (per job)
Total payout    = reporter + editor
```

The calculation is a pure function in `src/domain/payment/payment-calculator.ts` — no database reads required.

## Running Tests

```bash
# Run all unit tests
npm test

# Run with coverage (domain layer)
npm run test:coverage
```

All 31 tests cover the three core domain functions:

- `transitionJobStatus` — 12 tests
- `calculatePayment` — 8 tests
- `rankReporters` / `selectBestReporter` — 11 tests

## Scripts

```bash
npm run dev           # Start with hot-reload (tsx watch)
npm run build         # Compile TypeScript
npm test              # Run unit tests
npm run lint          # ESLint
npm run format        # Prettier
npm run prisma:migrate # Run DB migrations
npm run prisma:seed   # Seed sample data
npm run prisma:studio  # Open Prisma Studio (DB GUI)
```
