# Court Reporting Workflow Manager

A backend API and lightweight dashboard for managing court reporting transcription jobs — built for the VoiceScript fullstack assessment.

> **Interactive API docs:** run `npm run dev` and open <http://localhost:3000/api/docs>
> OpenAPI JSON: <http://localhost:3000/api/docs.json>

---

## Documentation index

| Document | What's in it |
| --- | --- |
| [README.md](./README.md) | Project overview, quick start, scripts, tech stack |
| [docs/API.md](./docs/API.md) | Full endpoint reference, request/response examples, error catalog |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Layered architecture, design decisions, data model, state machine |
| [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Dev workflow, lint/format/test conventions, adding endpoints |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Switching to PostgreSQL, production build, env variables |
| Swagger UI | Live, interactive docs available at `/api/docs` once the server is running |

## Quick start

```bash
# 1. Install
npm install

# 2. Initialize the database
npx prisma migrate dev --name init

# 3. Seed sample reporters and editors
npm run prisma:seed

# 4. Start the dev server (with hot-reload)
npm run dev
# → http://localhost:3000              # dashboard
# → http://localhost:3000/api/docs     # Swagger UI
# → http://localhost:3000/api/health   # health check
```

## Tech stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js + TypeScript |
| Framework | Express v5 |
| ORM | Prisma v7 |
| Database | SQLite (default) / PostgreSQL (opt-in) |
| Validation | Zod |
| API docs | swagger-jsdoc + swagger-ui-express (OpenAPI 3.0) |
| Testing | Vitest |
| Linting | ESLint + Prettier |
