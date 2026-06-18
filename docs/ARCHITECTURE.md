# Architecture

## Goals

1. **Domain logic must be pure.** State-machine transitions, payment math, and reporter ranking must work without a database or HTTP server. This makes them trivially unit-testable.
2. **One source of truth for the database.** Only the service / repository layer talks to Prisma. The domain layer never imports `@prisma/client`.
3. **One error handler.** All domain errors bubble up to a single Express middleware that maps them to the correct HTTP status code.
4. **Validated inputs at the boundary.** Every request body and parameter is parsed by a Zod schema before any business logic runs.

## Layered architecture

```
                 ┌──────────────────────────────────────────────┐
HTTP request ──▶ │              api / modules                  │  ← Express routes, Zod validation
                 │  (controllers, routes, validation schemas)  │
                 └────────────────────┬─────────────────────────┘
                                      │
                                      ▼
                 ┌──────────────────────────────────────────────┐
                 │                   services                   │  ← Orchestration: calls domain + repos
                 └────────────────────┬─────────────────────────┘
                                      │
                ┌─────────────────────┴─────────────────────┐
                ▼                                           ▼
   ┌──────────────────────────────┐         ┌──────────────────────────────┐
   │           domain             │         │        repositories          │
   │ (pure functions, zero deps)  │         │   (the only Prisma calls)    │
   │  • transitionJobStatus       │         │                              │
   │  • rankReporters             │         └──────────────────────────────┘
   └──────────────────────────────┘
```

The dependency rule: **outer layers may depend on inner layers, never the other way around.** `domain/` must not import from `services/`, `modules/`, or `@prisma/client`.

## Folder map

```
src/
├── app.ts                  # Express wiring + Swagger UI
├── server.ts               # HTTP listener
├── config/
│   ├── env.ts              # Zod-validated env loader
│   └── swagger.ts          # OpenAPI 3.0 spec + UI mount
├── domain/                 # PURE — no Express, no Prisma
│   ├── jobStatus.ts
│   └── reporterRanking.ts
├── lib/
│   └── prisma.ts           # PrismaClient singleton (resolves db URL by environment)
├── middleware/
│   ├── errorHandler.ts     # Single error → HTTP mapper
│   └── validateRequest.ts  # Zod schema runner
├── modules/                # HTTP-facing feature modules
│   ├── editors/            # editors.controller, editors.routes, editors.service, editors.schema
│   ├── jobs/               # jobs.controller, jobs.routes, jobs.service, job.schema, jobs.test
│   └── reporters/          # reporters.controller, reporters.routes, reporters.service, reporters.schema
├── errors.ts               # AppError, NotFoundError, BadRequestError, ...
├── utils/
│   ├── parse.ts            # req.params/body coercion helpers
│   └── response.ts         # ok() / created() response helpers
scripts/
└── run-tests.ts            # Custom test runner to isolate testing database environment

prisma/
├── schema.prisma           # Data model
├── seed.ts                 # Idempotent seed for reporters + editors
└── migrations/

public/
└── index.html              # Single-page dashboard (vanilla JS)

docs/
├── API.md                  # Endpoint reference
├── ARCHITECTURE.md         # ← you are here
├── DEPLOYMENT.md           # Postgres switch, production build
```

## Key design decisions

### 1. Domain layer is dependency-free

`transitionJobStatus` and `rankReporters`/`selectBestReporter` are pure functions of their inputs. They are exhaustively unit-tested in `src/domain/*.test.ts` without booting Prisma, Express, or any I/O.

This means:

- A domain rule change cannot accidentally require a database.
- The state-machine logic is the single source of truth for valid transitions — the API and the UI both reflect it.

### 2. State-machine guard before any DB write

`transitionJobStatus(current, target)` validates against an explicit allowlist:

```ts
const TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  NEW:         ['ASSIGNED'],
  ASSIGNED:    ['TRANSCRIBED'],
  TRANSCRIBED: ['REVIEWED'],
  REVIEWED:    ['COMPLETED'],
  COMPLETED:   [],
};
```

It throws `InvalidTransitionError` (HTTP `409`) **before** the service calls `prisma.job.update`. No half-written state can ever land in the DB.

### 3. Scoring-based reporter ranking

Each candidate receives a discrete score:

| Situation | Score |
| --- | --- |
| Same city, physical job | `2` |
| Remote job (all available eligible) | `1` |
| Different city, physical job | `0` |

Ties break on name (alphabetical — stable tiebreak). The algorithm is easy to extend — add a new priority by adding a higher score for some other case.

### 4. Single error handler

`src/middleware/errorHandler.ts` is the only place that turns thrown errors into HTTP responses:

- `AppError` subclasses → their declared `statusCode`
- Anything else → logged, returns `500 Internal server error`

Services and domain code throw `AppError`s (`NotFoundError`, `BadRequestError`, `NoAvailableReporterError`, `InvalidTransitionError`); the API never hand-rolls status codes.

### 5. Zod at the boundary

Every POST route uses `validateRequest(schema)`:

- Invalid body → `400` with the flattened Zod error.
- Valid body is **replaced** with `result.data`, so downstream code can rely on types.

This pushes the "what is valid input" question into a single file per module (`*.schema.ts`).

### 6. Test Database Isolation
To prevent tests from wiping local development data, the project implements environment-specific databases. Running tests automatically runs a Node test runner (`scripts/run-tests.ts`) which targets `prisma/test.db` and pushes the database schema prior to executing Vitest sequentially.

## Data model

See [`prisma/schema.prisma`](../prisma/schema.prisma). The four entities:

| Model | Purpose |
| --- | --- |
| `Job` | A transcription job with status, duration, location, and the assigned people |
| `Reporter` | Court reporter (rate per minute, city, availability) |
| `Editor` | Editor (flat fee per job, availability) |
| `Payment` | Payout calculation details for a job (1:1 with `Job`) |

## Request lifecycle (example: `POST /api/jobs/:id/assign-reporter`)

```
1. Express route matches              jobs.routes.ts
2. Validation schema runs             job.schema.ts
3. Controller extracts params         jobs.controller.ts
4. Service:
   a. prisma.job.findUnique           jobs.service.ts
   b. transitionJobStatus('NEW','ASSIGNED')   ← pure, throws on bad transition
   c. prisma.reporter.findMany({where:{available:true}})
   d. selectBestReporter(...)         ← pure
   e. prisma.job.update
5. ok(res, job)                       utils/response.ts → 200 + JSON
6. (any thrown AppError is caught by errorHandler)
```

## Testing strategy

- **Domain layer** — Vitest unit tests, no I/O.
- **Service & Database Integration layer** — Sequential test files (`jobs.test.ts`, `reporters.test.ts`, `editors.test.ts`) utilizing SQLite file `test.db`.
- **Manual** — `public/index.html` exercises endpoints against a real running server.

Run:

```bash
npm test                  # runs the isolated test suite
```
