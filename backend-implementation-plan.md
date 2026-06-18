# Court Reporting Workflow Manager — Backend Implementation Plan



**Stack:** Node.js · TypeScript · Express · MySQL · Prisma · Zod · Vitest · ESLint/Prettier

**Core principle:** Domain logic is the spine. State transitions, payment calculation, and reporter-matching are pure functions with zero Prisma/Express imports. Everything else (routes, controllers, repositories) is a thin shell around that core.

---

## 1. Architecture Overview



```text
src/
├── domain/                    # PURE business logic — no I/O, no framework imports
│   ├── job/
│   │   ├── job-status.ts          # status enum + state machine / guard
│   │   ├── job-status.test.ts
│   │   ├── job.types.ts
│   │   └── job.test.ts
│   ├── payment/
│   │   ├── payment-calculator.ts  # pure calculation functions
│   │   ├── payment-calculator.test.ts
│   │   └── payment.types.ts
│   └── assignment/
│       ├── reporter-ranking.ts    # pure ranking/matching function
│       ├── reporter-ranking.test.ts
│       └── assignment.types.ts
│
├── services/                  # Orchestration layer — calls domain fns + repositories
│   ├── job.service.ts
│   ├── assignment.service.ts
│   └── payment.service.ts
│
├── repositories/              # ALL Prisma calls live here, nowhere else
│   ├── job.repository.ts
│   ├── reporter.repository.ts
│   └── editor.repository.ts
│
├── api/                       # Express layer — HTTP only, no business logic
│   ├── routes/
│   │   ├── job.routes.ts
│   │   ├── reporter.routes.ts
│   │   └── editor.routes.ts
│   ├── controllers/
│   │   ├── job.controller.ts
│   │   ├── reporter.controller.ts
│   │   └── editor.controller.ts
│   ├── validators/             # Zod schemas
│   │   ├── job.schema.ts
│   │   └── assignment.schema.ts
│   └── middleware/
│       ├── error-handler.ts
│       ├── validate.ts         # generic Zod-validation middleware
│       └── async-handler.ts
│
├── config/
│   ├── env.ts                  # Zod-validated environment variables
│   └── prisma-client.ts        # single PrismaClient instance
│
├── errors/
│   └── app-error.ts            # custom error classes (e.g. InvalidTransitionError)
│
├── app.ts                      # Express app assembly (middleware, routes)
└── server.ts                   # entrypoint — starts HTTP server

prisma/
├── schema.prisma
└── seed.ts

tests/
└── setup.ts                    # Vitest global setup if needed

```

**Why this shape:**

* `domain/` has **zero dependencies** on Prisma, Express, or any I/O. This is what makes status transitions, payment math, and ranking logic unit-testable in total isolation — no mocks, no DB, no HTTP, just inputs and outputs.


* `services/` is the only layer allowed to call both `domain/` and `repositories/`. It composes pure logic with persistence.


* `repositories/` is the **only** place `prisma.*` calls are allowed to appear. If you ever `grep -r "prisma\." src/domain` and get a hit, that's an architecture violation.


* `api/` never imports `repositories/` directly — only `services/`. Controllers stay thin: parse request → call service → shape response.



---

## 2. Data Model (Prisma Schema)



```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum JobStatus {
  NEW
  ASSIGNED
  TRANSCRIBED
  REVIEWED
  COMPLETED
}

enum LocationType {
  PHYSICAL
  REMOTE
}

model Job {
  id            String       @id @default(uuid())
  caseName      String
  durationMin   Int
  locationType  LocationType
  city          String?      // required if PHYSICAL, used for reporter matching
  status        JobStatus    @default(NEW)

  reporterId    String?
  reporter      Reporter?    @relation(fields: [reporterId], references: [id])

  editorId      String?
  editor        Editor?      @relation(fields: [editorId], references: [id])

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  payment       Payment?
}

model Reporter {
  id            String   @id @default(uuid())
  name          String
  city          String
  available     Boolean  @default(true)
  ratePerMinute Int      // IDR, e.g. 2000
  jobs          Job[]
}

model Editor {
  id        String   @id @default(uuid())
  name      String
  available Boolean  @default(true)
  flatFee   Int      // IDR per job
  jobs      Job[]
}

model Payment {
  id              String   @id @default(uuid())
  jobId           String   @unique
  job             Job      @relation(fields: [jobId], references: [id])
  reporterPayout  Int
  editorPayout    Int
  totalPayout     Int
  calculatedAt    DateTime @default(now())
}

```

---

## 3. Domain Logic (the core of the assessment)



### 3.1 Job Status State Machine



```typescript
// domain/job/job-status.ts
export const JOB_STATUSES = ['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED'] as const;
export type JobStatus = typeof JOB_STATUSES[number];

// Explicit allow-list of transitions — easy to read, easy to extend
const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  NEW: ['ASSIGNED'],
  ASSIGNED: ['TRANSCRIBED'],
  TRANSCRIBED: ['REVIEWED'],
  REVIEWED: ['COMPLETED'],
  COMPLETED: [],
};

export class InvalidTransitionError extends Error {
  constructor(from: JobStatus, to: JobStatus) {
    super(`Invalid transition: cannot move job from ${from} to ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

/** Pure guard function — throws on invalid transition, returns new status on success */
export function transitionJobStatus(current: JobStatus, target: JobStatus): JobStatus {
  if (!ALLOWED_TRANSITIONS[current].includes(target)) {
    throw new InvalidTransitionError(current, target);
  }
  return target;
}

export function canTransition(current: JobStatus, target: JobStatus): boolean {
  return ALLOWED_TRANSITIONS[current].includes(target);
}

```

**Test cases to cover (`job-status.test.ts`):**

* ✅ NEW → ASSIGNED succeeds


* ✅ ASSIGNED → TRANSCRIBED succeeds


* ❌ NEW → TRANSCRIBED throws `InvalidTransitionError` (skipping a step)


* ❌ COMPLETED → anything throws (terminal state)


* ❌ Same-state transition (e.g. NEW → NEW) throws


* ✅ `canTransition` returns boolean without throwing, for UI-side checks



### 3.2 Payment Calculation



```typescript
// domain/payment/payment-calculator.ts
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

/** Pure function — no DB, no side effects, fully deterministic */
export function calculatePayment(input: PaymentInput): PaymentResult {
  if (input.durationMin < 0) {
    throw new Error('Duration cannot be negative');
  }
  const reporterPayout = input.durationMin * input.reporterRatePerMinute;
  const editorPayout = input.editorFlatFee;
  return {
    reporterPayout,
    editorPayout,
    totalPayout: reporterPayout + editorPayout,
  };
}

```

**Test cases to cover (`payment-calculator.test.ts`):**

* ✅ Standard case: 60 min × 2000 IDR/min + flat fee = correct total


* ✅ Zero duration → reporter payout is 0, total = editor fee only


* ✅ No editor assigned yet (editorFlatFee = 0) → total = reporter payout only


* ❌ Negative duration throws


* ✅ Large numbers don't overflow / round incorrectly (test with realistic large minute counts)



### 3.3 Reporter Ranking / Matching (Updated with Scoring System)

```typescript
// domain/assignment/reporter-ranking.ts
export interface RankableReporter {
  id: string;
  name: string;
  city: string;
  available: boolean;
}

export interface RankingCriteria {
  locationType: 'PHYSICAL' | 'REMOTE';
  jobCity?: string;
}

/**
 * Pure ranking function. Returns reporters sorted by suitability using a scoring system:
 * - Unavailable reporters are excluded entirely
 * - Uses scoreReporter() to assign discrete points: 2 (same-city physical), 1 (remote), 0 (different-city physical)
 */
export function rankReporters(
  reporters: RankableReporter[],
  criteria: RankingCriteria
): RankableReporter[] {
  const availableReporters = reporters.filter((r) => r.available);

  return availableReporters.sort((a, b) => {
    const scoreA = scoreReporter(criteria, a);
    const scoreB = scoreReporter(criteria, b);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // sort descending by score
    }
    
    // Fallback: deterministic alphabetical sort by name
    return a.name.localeCompare(b.name);
  });
}

/**
 * Helper function that assigns discrete points based on location matching.
 * This makes the ranking system highly extensible for future criteria (e.g., preferred reporter, ratings).
 */
function scoreReporter(criteria: RankingCriteria, reporter: RankableReporter): number {
  if (criteria.locationType === 'PHYSICAL' && criteria.jobCity && reporter.city === criteria.jobCity) {
    return 2; // Exact city match for physical jobs
  }
  if (criteria.locationType === 'REMOTE') {
    return 1; // Remote jobs consider all available reporters equally eligible
  }
  return 0; // Physical job, different city — fallback option
}

export function selectBestReporter(
  reporters: RankableReporter[],
  criteria: RankingCriteria
): RankableReporter | null {
  const ranked = rankReporters(reporters, criteria);
  return ranked[0] ?? null;
}

```

**Test cases to cover (`reporter-ranking.test.ts`):**

* ✅ PHYSICAL job: same-city reporter ranked above other-city reporter


* ✅ PHYSICAL job: no same-city reporter available → falls back to remote-capable ranking, doesn't return empty


* ✅ REMOTE job: city is ignored, reporters sorted deterministically


* ✅ Unavailable reporters are filtered out entirely, never ranked


* ✅ Empty reporter list → `selectBestReporter` returns `null`, doesn't throw



---

## 4. Services Layer (orchestration)



Services call domain functions, then call repositories. **No business rules live here** — only sequencing.

```typescript
// services/assignment.service.ts
export async function assignReporterToJob(jobId: string) {
  const job = await jobRepository.findById(jobId);
  if (!job) throw new NotFoundError('Job not found');

  transitionJobStatus(job.status, 'ASSIGNED'); // throws if invalid — fail fast before DB writes

  const candidates = await reporterRepository.findAvailable();
  const best = selectBestReporter(candidates, {
    locationType: job.locationType,
    jobCity: job.city ?? undefined,
  });
  if (!best) throw new NoAvailableReporterError();

  return jobRepository.assignReporterAndUpdateStatus(jobId, best.id, 'ASSIGNED');
}

```

```typescript
// services/payment.service.ts
export async function calculateJobPayment(jobId: string) {
  const job = await jobRepository.findByIdWithRelations(jobId);
  if (!job?.reporter) throw new BadRequestError('Job has no assigned reporter');

  const result = calculatePayment({
    durationMin: job.durationMin,
    reporterRatePerMinute: job.reporter.ratePerMinute,
    editorFlatFee: job.editor?.flatFee ?? 0,
  });

  return paymentRepository.upsertForJob(jobId, result);
}

```

This separation is what makes the domain layer testable without ever touching a database — services are the seam where pure logic meets persistence.

---

## 5. API Layer



### 5.1 Endpoints



| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/jobs` | Create a job |
| GET | `/api/jobs` | List jobs (with status, assignments) |
| GET | `/api/jobs/:id` | Get job detail |
| PATCH | `/api/jobs/:id/status` | Update job status (validated via state machine) |
| POST | `/api/jobs/:id/assign-reporter` | Trigger reporter assignment logic |
| POST | `/api/jobs/:id/assign-editor` | Assign editor |
| GET | `/api/jobs/:id/payment` | Calculate/fetch payment for a job |
| GET | `/api/reporters` | List reporters |
| GET | `/api/editors` | List editors |

### 5.2 Validation with Zod



```typescript
// api/validators/job.schema.ts
import { z } from 'zod';

export const createJobSchema = z.object({
  caseName: z.string().min(1),
  durationMin: z.number().int().positive(),
  locationType: z.enum(['PHYSICAL', 'REMOTE']),
  city: z.string().optional(),
}).refine(
  (data) => data.locationType === 'REMOTE' || !!data.city,
  { message: 'city is required for PHYSICAL jobs', path: ['city'] }
);

export const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED']),
});

```

Generic validation middleware applies any schema to `req.body`:

```typescript
// api/middleware/validate.ts
export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };

```

### 5.3 Centralized Error Handling



Map domain errors to HTTP status codes in one place:

```typescript
// api/middleware/error-handler.ts
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof InvalidTransitionError) return res.status(409).json({ error: err.message });
  if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
  if (err instanceof NoAvailableReporterError) return res.status(422).json({ error: err.message });
  if (err instanceof BadRequestError) return res.status(400).json({ error: err.message });

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

```

Controllers stay thin and wrapped in an `asyncHandler` so thrown errors flow into `errorHandler` instead of needing try/catch everywhere.

---

## 6. Testing Strategy (Vitest)



| Layer | What's tested | How |
| --- | --- | --- |
| `domain/` | Status transitions, payment math, ranking logic | **Pure unit tests, no mocks needed** — this is the priority per the assessment |
| `services/` | Orchestration sequencing (e.g. "assignment fails if status transition invalid before any DB write") | Unit tests with repository mocks/stubs |
| `api/` | Request validation, status codes, error mapping | Lightweight integration tests with `supertest`, optionally against a test DB or mocked services |

Example domain test:

```typescript
// domain/payment/payment-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePayment } from './payment-calculator';

describe('calculatePayment', () => {
  it('calculates correct total for standard job', () => {
    const result = calculatePayment({
      durationMin: 60,
      reporterRatePerMinute: 2000,
      editorFlatFee: 50000,
    });
    expect(result).toEqual({
      reporterPayout: 120000,
      editorPayout: 50000,
      totalPayout: 170000,
    });
  });

  it('throws on negative duration', () => {
    expect(() =>
      calculatePayment({ durationMin: -5, reporterRatePerMinute: 2000, editorFlatFee: 0 })
    ).toThrow();
  });
});

```

`vitest.config.ts` scoped to run domain tests fast and in isolation (no DB setup needed for that suite):

```typescript
export default defineConfig({
  test: {
    environment: 'node',
    coverage: { provider: 'v8', include: ['src/domain/**'] },
  },
});

```

---

## 7. Tooling & Project Setup



```jsonc
// package.json (scripts)
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write .",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:seed": "tsx prisma/seed.ts"
  }
}

```

* **ESLint**: `@typescript-eslint`, plus a rule of thumb (manually enforced via code review / CI grep check) that `src/domain/` must not import `@prisma/client` or `express`.


* **Prettier**: standard config, run via lint-staged/pre-commit if time allows.


* **Env validation**: `config/env.ts` parses `process.env` through a Zod schema at startup, fails fast if `DATABASE_URL` etc. is missing.



---

## 8. Build Order (Recommended Sequence)



1. **Scaffold** — repo, TypeScript config, ESLint/Prettier, Prisma init, MySQL connection.


2. **Domain layer first** — write `job-status.ts`, `payment-calculator.ts`, `reporter-ranking.ts` and their tests *before* touching Express or Prisma. This is the part graders will scrutinize most closely, and it's independently demoable via `npm test`.


3. **Prisma schema + migration** — model Job/Reporter/Editor/Payment, run migration, seed sample data.


4. **Repositories** — thin Prisma wrappers, one per entity.


5. **Services** — wire domain + repositories together (assignment, status update, payment).


6. **API layer** — routes, controllers, Zod validators, error middleware.


7. **Frontend dashboard** (separate plan) — simple job list/status/assignment view, function over form.


8. **Polish / nice-to-haves** (see below) — only after core requirements are solid and tested.



---

## 9. Nice-to-Have / Bonus Points (VoiceScript-flavored)



These extend the assessment to mirror real VoiceScript features without overengineering:

* **WebSocket job status broadcast** — emit an event when a job's status changes (mirrors AttorneyView's "live streaming" concept); frontend dashboard auto-updates without polling.


* **Audit log table** — record every status transition with timestamp/actor, echoing VoiceScript's "auditable, end-to-end workflow visibility" pitch. Cheap to add (`StatusHistory` model) and demonstrates domain-event thinking.


* **Reporter rate flexibility** — support per-reporter custom rates (already modeled) plus an optional rush/overtime multiplier in `calculatePayment`, gated behind a clearly separate pure function (`applyRushMultiplier`) so the core calculator stays simple and testable.


* **Bulk transcript upload metadata stub** — a `mediaFileType` field on `Job` (no actual file handling needed) referencing AutoScript Hub's "30+ media types" to show domain awareness.


* **Simple coverage report** — run `vitest run --coverage` scoped to `src/domain` and include the summary in the README; signals seriousness about isolated, testable core logic.



Keep all of these strictly optional and time-boxed — a complete, well-tested core (state machine + payment + ranking + clean API) outweighs a half-finished bonus feature.

---

## 10. Definition of Done (Core Requirements Checklist)



* [ ] Job CRUD with all 5 statuses enforced via guard function


* [ ] Reporter assignment respects same-city preference, allows remote fallback


* [ ] Editor assignment after transcription


* [ ] Payment calculated via isolated, pure function (reporter per-minute + editor flat fee)


* [ ] State machine throws explicit error on invalid transitions


* [ ] `src/domain/` has zero Prisma/Express imports (verifiable via `grep`)


* [ ] Unit tests (Vitest) for: status transitions, payment calculation, reporter ranking


* [ ] REST API: create job, assign reporter/editor, update status, get payment


* [ ] Basic dashboard: job list, status, assignments


* [ ] ESLint + Prettier configured and passing