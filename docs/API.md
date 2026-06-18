# API Reference

Complete reference for every HTTP endpoint exposed by the Court Reporting Workflow Manager.

> Looking for the interactive, "try-it-out" version? Start the server and open
> <http://localhost:3000/api/docs>. The raw OpenAPI 3.0 spec is also available at
> <http://localhost:3000/api/docs.json>.

## Contents

- [Base URL & content type](#base-url--content-type)
- [Error model](#error-model)
- [Endpoints](#endpoints)
  - [Jobs](#jobs)
  - [Reporters](#reporters)
  - [Editors](#editors)
  - [Health](#health)
- [Data model](#data-model)
- [Job status state machine](#job-status-state-machine)
- [Payment formula](#payment-formula)
- [Reporter ranking algorithm](#reporter-ranking-algorithm)

---

## Base URL & content type

```
http://localhost:3000
```

All request and response bodies are `application/json`. No authentication is required for the assessment build.

## Error model

All errors share this shape:

```json
{ "error": "Human-readable message" }
```

Validation failures (Zod) add a `details` object:

```json
{
  "error": "Validation failed",
  "details": { "fieldErrors": { "durationMin": ["durationMin must be a positive integer"] } }
}
```

| Status | When |
| --- | --- |
| `400` | Body validation failed, or the request is semantically invalid (e.g. editor assigned before `TRANSCRIBED`) |
| `404` | Job / editor / reporter not found |
| `409` | Invalid job status transition (state machine violation) |
| `422` | No available reporter matches the job |
| `500` | Unhandled server error |

---

## Endpoints

### Jobs

#### `GET /api/jobs`

List jobs with filtering, searching, and sorting options.

**Query Parameters**
- `status` (string, optional): Filter by status (`NEW`, `ASSIGNED`, `TRANSCRIBED`, `REVIEWED`, `COMPLETED`).
- `locationType` (string, optional): Filter by location type (`PHYSICAL`, `REMOTE`).
- `search` (string, optional): Searches partial case-insensitive matches in `caseName` or `city`.
- `sortBy` (string, optional): Sorts ascending by `caseName`, `durationMin`, or `city`. (Defaults to newest first by `createdAt`).

**Response `200`**

```json
[
  {
    "id": "b3d8e1a2-4f5b-4c8a-9e7d-1a2b3c4d5e6f",
    "caseName": "Smith v. Jones — Deposition",
    "durationMin": 90,
    "locationType": "PHYSICAL",
    "city": "Jakarta",
    "status": "ASSIGNED",
    "reporterId": "8a1f...",
    "editorId": null,
    "reporter": { "id": "...", "name": "Alice Hartman", "city": "Jakarta", "available": false, "ratePerMinute": 2000 },
    "editor": null,
    "payment": {
      "id": "...",
      "reporterPayout": 180000,
      "editorPayout": 0,
      "totalPayout": 180000,
      "calculatedAt": "2026-06-18T06:00:00.000Z"
    },
    "createdAt": "2026-06-18T06:00:00.000Z",
    "updatedAt": "2026-06-18T06:00:00.000Z"
  }
]
```

#### `POST /api/jobs`

Create a new job in `NEW` status.

**Request body**

```json
{
  "caseName": "Smith v. Jones — Deposition",
  "durationMin": 90,
  "locationType": "PHYSICAL",
  "city": "Jakarta"
}
```

- `locationType: "PHYSICAL"` **requires** `city` (used for reporter city-matching).
- `locationType: "REMOTE"` makes `city` optional.

**Response `201`** — full `Job` object.

#### `GET /api/jobs/:id`

Fetch a single job with all relations.

**Response `404`** when the id does not exist.

---



#### `GET /api/jobs/:id/suggested-reporters`

Retrieve a ranked list of available reporters (`available: true`) scored by suitability for the job location requirements.

**Response `200`** — Array of reporters.

#### `POST /api/jobs/:id/assign-reporter`

Assigns a reporter to the job. Enforces the transition to `ASSIGNED`.
- If a `reporterId` is passed in the request body, that specific reporter is assigned.
- If no body is provided, the system auto-assigns the best suggested reporter.
- Marks the assigned reporter as unavailable (`available: false`), sets the job status to `ASSIGNED`, and registers the `reporterPayout` (`ratePerMinute * durationMin`).

**Request body (Optional)**
```json
{
  "reporterId": "uuid-here"
}
```

**Response `200`** — Updated `Job` object.

#### `POST /api/jobs/:id/finish-transcription`

Completes the transcription phase for the job. Enforces the transition `ASSIGNED` $\rightarrow$ `TRANSCRIBED`.
- Marks the assigned reporter available again (`available: true`).
- Changes job status to `TRANSCRIBED`.

**Response `200`** — Updated `Job` object.

#### `POST /api/jobs/:id/assign-editor`

Assigns an editor to review the transcript. Enforces the transition `TRANSCRIBED` $\rightarrow$ `REVIEWED`.
- Marks the editor as unavailable (`available: false`).
- Sets the job status to `REVIEWED`.
- Updates the payment details with `editorPayout` (editor's `flatFee`).

**Request body (Required)**
```json
{
  "editorId": "uuid-here"
}
```

**Response `200`** — Updated `Job` object.

#### `POST /api/jobs/:id/finish-job`

Completes the review phase and closes the job. Enforces the transition `REVIEWED` $\rightarrow$ `COMPLETED`.
- Marks the editor available again (`available: true`).
- Changes job status to `COMPLETED`.
- Finalizes payment details (`totalPayout = reporterPayout + editorPayout`, `calculatedAt = now()`).

**Response `200`** — Updated `Job` object.



---

### Reporters

#### `GET /api/reporters`

List reporters with options.
- `available` (boolean, optional): Filter by availability.
- `search` (string, optional): Searches partial case-insensitive matches in `name` or `city`.
- `sortBy` (string, optional): Sorts by `name`, `city`, or `ratePerMinute`.

#### `POST /api/reporters`

Creates a new reporter (always starts with `available: true`).

**Request body**
```json
{
  "name": "Alice Hartman",
  "city": "Jakarta",
  "ratePerMinute": 2000
}
```

#### `GET /api/reporters/:id`

Retrieves a single reporter.

---

### Editors

#### `GET /api/editors`

List editors with options.
- `available` (boolean, optional): Filter by availability.
- `search` (string, optional): Searches partial case-insensitive matches in `name`.
- `sortBy` (string, optional): Sorts by `name` or `flatfee`.

#### `POST /api/editors`

Creates a new editor (always starts with `available: true`).

**Request body**
```json
{
  "name": "Frank Wijaya",
  "flatFee": 50000
}
```

#### `GET /api/editors/:id`

Retrieves a single editor.

---

### Health

#### `GET /api/health`

```json
{ "status": "ok", "timestamp": "2026-06-18T06:00:00.000Z" }
```

---

## Data model

```
┌──────────┐  N   1  ┌──────────┐
│   Job    │────────▶│ Reporter │
│          │         └──────────┘
│          │  N   1  ┌──────────┐
│          │────────▶│  Editor  │
└──────────┘         └──────────┘
│          │  1   1  ┌──────────┐
│          │────────▶│ Payment  │
└──────────┘         └──────────┘
```

Full schema lives in [`prisma/schema.prisma`](../prisma/schema.prisma).

## Job status state machine

```
NEW ──[assign-reporter]──▶ ASSIGNED ──[finish-transcription]──▶ TRANSCRIBED ──[assign-editor]──▶ REVIEWED ──[finish-job]──▶ COMPLETED
```

Enforced in `src/domain/jobStatus.ts` by an explicit allowlist. Any invalid status transitions will trigger an `InvalidTransitionError` (HTTP `409`) before any database write.

## Payment formula

```
reporterPayout = durationMin × ratePerMinute
editorPayout   = editor.flatFee
totalPayout    = reporterPayout + editorPayout
```

## Reporter ranking algorithm

Candidates score suitability based on location matching rules:

| Situation | Score |
| --- | --- |
| Same city, physical job | `2` |
| Remote job (all available eligible) | `1` |
| Different city, physical job | `0` |

Reporters are sorted by:
1. score (descending)
2. name (alphabetical — stable tiebreak)

`selectBestReporter` returns the top of the sorted list, or `null` if no available reporter exists.
