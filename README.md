# Court Reporting Workflow Manager

A comprehensive, production-grade fullstack application for managing court reporting transcription jobs, assigning available reporters and editors, tracking state-machine progression, and automatically calculating payments.

---

## 🚀 Tech Stack

The application is structured as a monorepo containing a modern Express backend and a React frontend.

### Backend
*   **Runtime & Language:** Node.js + TypeScript
*   **Framework:** Express v5 (handling routing, async handlers, and middelewares)
*   **ORM:** Prisma v7
*   **Database:** SQLite (default for development/testing) or PostgreSQL (supported for production)
*   **Request Validation:** Zod schemas running at HTTP boundaries
*   **Interactive Docs:** Swagger UI (generated via `swagger-jsdoc` & `swagger-ui-express`)

### Frontend
*   **Framework:** React + TypeScript (scaffolded via Vite)
*   **State Management:** Zustand (for lightweight, reactive store stores)
*   **Styling:** Modern styling variables & Tailwind CSS (responsive layouts, modern CSS variables, premium aesthetics)
*   **Icons:** Lucide React

### Testing
*   **Testing Framework:** Vitest (runs isolated sqlite database contexts for tests)

---

## 🛠️ Getting Started

Follow these steps to clone, configure, and boot the application locally:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd voicescript-tech-test
```

### 2. Install Dependencies
Installs packages for both the backend and the frontend workspace:
```bash
npm install
```

### 3. Initialize the Database
Generate Prisma client files and run the SQLite migrations:
```bash
npx prisma migrate dev --name init
```

### 4. Seed Development Data
Seed the local database with initialavailable court reporters and editors:
```bash
npm run prisma:seed
```
### 5. Build Application for Production
```bash
npm run build
```

### 6. Start Production Server
Run the Express backend (restarts automatically on file changes) and the frontend builder:
```bash
npm run dev
```

*   **Interactive Dashboard:** Open [http://localhost:3000](http://localhost:3000)
*   **Swagger API Docs:** Open [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
*   **Service Health Check:** Open [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🧪 Running Tests

Integration and unit tests run against an isolated database configuration (`prisma/test.db`) to preserve your local development data:

```bash
npm test
```

This commands automatically:
1. Bootstraps a separate database environment.
2. Synchronizes the Prisma schema.
3. Runs the test suites sequentially (including jobs workflow, reporter ranking, editor filtering, and state transitions).

---

## 📦 Production Builds

To compile and build the codebase for production environments:

```bash
# Compile TypeScript backend and bundle React frontend via Vite
npm run build

# Start the compiled server
npm start
```
The compiled files are emitted to `dist/`, and static assets are bundled into `public/`.

---

## 📚 Documentation Index

| Document | Purpose & Summary |
| --- | --- |
| **[docs/API.md](./docs/API.md)** | Full REST endpoint reference. Documents all routes (such as `/api/jobs`, `/api/reporters`, `/api/editors`, `/api/statistics`), JSON schemas, status transition rules, payment calculation formulas, and error response structures. It specifically covers the singular `/api/jobs/:id/suggested-reporter` endpoint returning a single reporter object or `null`. |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | Detailed architecture overview. Describes the layered clean-architecture (Controller, Service, Domain models), pure business rule validations, status transitions, scoring logic for assignments, monorepo directory mapping, and test database isolation. |
| **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** | Production configuration guide. Discusses environment variables (`NODE_ENV`, `PORT`, `DATABASE_URL`), instructions on migrating from SQLite to PostgreSQL, Nginx reverse proxy server blocks, Dockerfile setups, and health-checking. |
| **[frontend/README.md](./frontend/README.md)** | Frontend-specific documentation. Details the React 19 + Vite 8 + Tailwind CSS 4 setup, Zustand client state stores, API services, component hierarchy map, and development guidelines. |

