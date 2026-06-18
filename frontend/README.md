# 🖥️ Voicescript Workflow Dashboard — React Frontend

This directory contains the React frontend application for the Court Reporting Workflow Manager. It provides a real-time, responsive, and modern user interface to manage jobs, assign reporters and editors, track workflow states, and view system statistics.

---

## 🚀 Tech Stack & Design

The frontend is built with modern technologies focusing on developer experience, type safety, and premium user experience:

*   **Framework & Bundler:** React 19 + TypeScript + Vite 8
*   **Styling & Design System:** Tailwind CSS v4.0 (for responsive layout, curated HSL color schemes, sleek borders, smooth transitions, and premium typography)
*   **State Management:** Zustand (for clean, lightweight, boilerplate-free client state stores)
*   **Iconography:** Lucide React
*   **HTTP Client:** Fetch API wrapper with type-safe handlers

---

## ✨ Features

### 1. Interactive Dashboard Shell
- Side-by-side split pane navigation layout with a responsive drawer sidebar for mobile screens.
- Global auto-refresh system keeping jobs, reporters, editors, and statistics in sync with the backend.
- High-performance, low-latency client state synchronization using Zustand.

### 2. Jobs Workflow Management
- **Search & Filtering:** Live filter by status (`NEW`, `ASSIGNED`, `TRANSCRIBED`, `REVIEWED`, `COMPLETED`), location type (`PHYSICAL`, `REMOTE`), sorting (by case name, duration, or city), and partial case-insensitive searching.
- **Visual Progress Tracker:** Status circles (e.g. green indicator for completed phases) representing the job state machine (`NEW` ➔ `ASSIGNED` ➔ `TRANSCRIBED` ➔ `REVIEWED` ➔ `COMPLETED`).
- **Interactive Details Panel:** Displays complete job metadata, status logs, assigned team members, and real-time payment breakdowns.
- **Workflow State Machine Actions:**
  - **Assign Reporter:** Shows candidate suitability score (scored by city matching) and offers auto-assign suggestions or custom selections.
  - **Finish Transcription:** Releases the reporter and transitions to transcription finished.
  - **Assign Editor:** Shows list of available editors and transitions the job to reviewed.
  - **Finish Job:** finalizes the combined payment calculation and closes the job.

### 3. Directories & Management
- **Reporters Directory:** View all reporters, their city, rate-per-minute, and current availability status.
- **Editors Directory:** View all editors, flat-fee billing details, and current availability status.
- **Creation Modals:** Standardized forms with input validation for creating jobs, reporters, and editors.

### 4. Real-Time System Statistics & Financials
- **High-Level Counters:** Total job counts, reporter status distributions, and editor availability.
- **Completed Job Financials:** Aggregates total reporter payouts, editor payouts, and total combined system payouts, formatted into Indonesian Rupiah (IDR).
- **Interactive Charts:** Job status breakdown progress bar and detail cards.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/         # UI Components
│   │   ├── Sidebar.tsx            # Main navigation sidebar
│   │   ├── JobList.tsx            # List of jobs with search & filters
│   │   ├── JobCard.tsx            # Short job summary preview card
│   │   ├── JobDetailPanel.tsx     # Full details and workflow actions
│   │   ├── ReporterList.tsx       # Reporters directory page
│   │   ├── ReporterCard.tsx       # Individual reporter listing card
│   │   ├── ReporterDetailPanel.tsx# Selected reporter jobs log
│   │   ├── EditorList.tsx         # Editors directory page
│   │   ├── EditorCard.tsx         # Individual editor listing card
│   │   ├── EditorDetailPanel.tsx  # Selected editor jobs log
│   │   ├── StatisticsView.tsx     # Analytics dashboard & financials panel
│   │   ├── NewJobModal.tsx        # Creation form for new jobs
│   │   ├── NewReporterModal.tsx   # Creation form for new reporters
│   │   ├── NewEditorModal.tsx     # Creation form for new editors
│   │   ├── LocationBadge.tsx      # Badges for REMOTE vs PHYSICAL
│   │   ├── DocketStamp.tsx        # Vintage-style legal stamp decoration
│   │   ├── EmptyState.tsx         # Shared empty placeholder card
│   │   └── ToastContainer.tsx     # Temporary toast alert notifications
│   ├── stores/             # Zustand State Stores
│   │   ├── jobStore.ts            # State and async actions for jobs
│   │   ├── reporterStore.ts       # State and async actions for reporters
│   │   ├── editorStore.ts         # State and async actions for editors
│   │   └── statisticsStore.ts     # State and async actions for analytics
│   ├── services/           # Type-Safe HTTP Fetch Clients
│   │   ├── jobsService.ts         # Fetches for `/api/jobs`
│   │   ├── reporterService.ts     # Fetches for `/api/reporters`
│   │   ├── editorService.ts       # Fetches for `/api/editors`
│   │   └── statisticsService.ts   # Fetches for `/api/statistics`
│   ├── lib/                # Utility & Formatting functions
│   │   ├── api.ts                 # Base API config and URL resolver
│   │   ├── format.ts              # Indonesian Rupiah (IDR) formatter
│   │   └── jobLogic.ts            # Local calculations for payout estimation
│   ├── constants/          # Application constants (e.g. status labels)
│   ├── types/              # Global TypeScript models & interfaces
│   ├── App.tsx             # Root dashboard controller & layout
│   ├── index.css           # Global stylesheets & custom scrollbars
│   └── main.tsx            # Entry point mounting React
├── package.json            # Node workspace scripts & dependencies
├── tsconfig.json           # TS configuration
├── vite.config.ts          # Vite configuration with Tailwind CSS plugin
└── tailwind.config.js      # Tailind configuration (if needed)
```

---

## 🛠️ Getting Started

To run the frontend individually or build the assets:

### 1. From the Monorepo Root (Recommended)
You can build and run both backend and frontend concurrently from the root directory:
```bash
# Install all workspace dependencies
npm install

# Run concurrently in development mode
npm run dev

# Build the entire application
npm run build
```

### 2. Standalone Frontend Development
If you prefer to run only the frontend development server:
```bash
# Navigate to this directory
cd frontend

# Run Vite dev server
npm run dev
```

### 3. Production Build
To bundle the frontend for production manually:
```bash
npm run build
```
This will compile TypeScript and bundle assets to `public/` in the root workspace directory, which is served statically by the Express backend.

---

## 📚 Key Integration Details

- **API Integration:** The API base URL is resolved dynamically in [src/lib/api.ts](src/lib/api.ts). In development, it defaults to `http://localhost:3000`.
- **Lightweight State:** The React components consume Zustand stores which handle all side-effects, state synchronization, and error handling under the hood. For example:
  ```ts
  import { useJobStore } from "./stores/jobStore";
  const { jobs, fetchJobs } = useJobStore();
  ```
- **Responsive Layout:** The application is optimized for mobile screens (using responsive drawer layouts) up to ultra-wide desktop monitors.
