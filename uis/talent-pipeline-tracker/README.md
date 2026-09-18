# HealthCore — Talent Pipeline Tracker

> **A candidate tracking dashboard for Diane Foster's People & Talent team at HealthCore.**  
> Manages the **Executive Assistant recruitment campaign** for the Austin headquarters.

Built with **Next.js 16** (App Router), **TypeScript**, and **Tailwind CSS v4**.  
Consumes the Talent Tracker API at `https://playground.4geeks.com/tracker/api/v1`.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Types & Enums](#types--enums)
- [Components](#components)
- [Hooks](#hooks)
- [Design System](#design-system)
- [State Handling](#state-handling)
- [Development Notes](#development-notes)

---

## Features

### Candidate List (`/`)
- **Search** candidates by name, email, or position
- **Filter** by status (`received`, `in_progress`, `selected`, `discarded`)
- **Filter** by stage (`pending`, `review`, `personal_interview`, `technical_interview`, `offer_presented`)
- **Register** new candidates via a modal form with client-side validation
- Responsive grid layout (1/2/3 columns)

### Candidate Detail (`/candidates/[id]`)
- View full profile: name, email, phone, position, LinkedIn, CV, experience, applied date
- **Edit** candidate data via modal form (PUT)
- **Update status** inline via dropdown (PATCH)
- **Update stage** inline via dropdown (PATCH)
- **Add internal notes** with text area
- **Delete notes** from the timeline
- Loading, error, and empty states for all async operations

### Async State Management
Every async operation handles four states:
| State | Visual |
|---|---|
| **Loading** | Spinner with contextual message |
| **Error** | Red error card with retry button |
| **Empty** | Icon + message (list only) |
| **Success** | Data rendered normally |

---

## Project Structure

```
uis/talent-pipeline-tracker/
├── app/
│   ├── layout.tsx                   # Root layout — HealthCore branding header
│   ├── page.tsx                     # Home — candidate list with filters + create modal
│   ├── globals.css                  # Global styles, background, theme overrides
│   └── candidates/[id]/page.tsx    # Detail page — profile, controls, notes
│
├── components/
│   ├── CandidateCard.tsx            # Card for the list grid
│   ├── CandidateDetail.tsx          # Full detail view (profile grid + controls + notes)
│   ├── CandidateForm.tsx            # Create/edit form with client-side validation
│   ├── CandidateList.tsx            # Grid wrapper — handles loading/error/empty/success
│   ├── FilterBar.tsx                # Search box + status dropdown + stage dropdown
│   ├── LoadingSpinner.tsx           # Reusable animated spinner
│   ├── NoteForm.tsx                 # Textarea + submit for adding notes
│   ├── NoteList.tsx                 # Note timeline with delete per note
│   ├── StageBadge.tsx               # Color-coded stage pill
│   ├── StageControl.tsx             # Stage PATCH dropdown
│   ├── StatusBadge.tsx              # Color-coded status pill
│   └── StatusControl.tsx            # Status PATCH dropdown
│
├── hooks/
│   ├── useCandidates.ts             # Fetch candidate list with filters (loading/error/refetch)
│   ├── useCandidate.ts              # Fetch single candidate + PATCH update
│   └── useNotes.ts                  # Fetch notes for a candidate (loading/error/refetch)
│
├── lib/
│   └── api.ts                       # API service — all fetch calls to the Talent Tracker backend
│
├── types/
│   └── index.ts                     # TypeScript interfaces, enums, label mappings
│
├── .env.local                       # NEXT_PUBLIC_API_URL
├── next.config.ts                   # Turbopack root config for monorepo
├── tsconfig.json                    # TypeScript strict, @/ path alias
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### 1. Environment Variables

Create `.env.local` (already in place):

```env
NEXT_PUBLIC_API_URL=https://playground.4geeks.com/tracker/api/v1
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start development server with Turbopack |
| `build` | `next build` | Production build + TypeScript check |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | Run ESLint |

---

## API Endpoints

Base URL: `https://playground.4geeks.com/tracker/api/v1`

### Candidates

| Method | Endpoint | Description | Hook |
|---|---|---|---|
| `GET` | `/records` | List candidates (query: `status`, `stage`, `search`, `page`, `limit`) | `useCandidates` |
| `GET` | `/records/:id` | Get a single candidate | `useCandidate` |
| `POST` | `/records` | Create a candidate | `CandidateForm` |
| `PUT` | `/records/:id` | Update/replace a candidate | `CandidateForm` (edit) |
| `PATCH` | `/records/:id` | Partial update (status/stage) | `StatusControl`, `StageControl` |

### Notes

| Method | Endpoint | Description | Hook/Component |
|---|---|---|---|
| `GET` | `/records/:id/notes` | List notes for a candidate (returns `{ data: Note[], meta: { total } }`) | `useNotes` |
| `POST` | `/records/:id/notes` | Add a note to a candidate | `NoteForm` |
| `DELETE` | `/records/:id/notes/:noteId` | Delete a specific note | `NoteList` |

---

## Types & Enums

### `CandidateStatus`

| API value | Display label |
|---|---|
| `received` | Received |
| `in_progress` | In progress |
| `selected` | Selected |
| `discarded` | Discarded |

### `CandidateStage`

| API value | Display label |
|---|---|
| `pending` | Pending review |
| `review` | Under review |
| `personal_interview` | Personal interview |
| `technical_interview` | Technical interview |
| `offer_presented` | Offer presented |

### Key Interfaces

- **`Candidate`** — Full candidate record (id, full_name, email, phone, position, linkedin_url, cv_url, status, stage, experience_years, notes_count, applied_at, updated_at)
- **`CandidateCreatePayload`** — Create/update payload (all fields except id/dates)
- **`CandidatePatchPayload`** — Partial update payload (status?, stage?)
- **`Note`** — Note record (id, record_id, content, created_at)
- **`NoteCreatePayload`** — Note creation payload (content)
- **`CandidatesResponse`** — Paginated list response (total, page, limit, data[])
- **`NotesResponse`** — Notes list response (data[], meta.total)

Helper functions: `getStatusLabel(status)` and `getStageLabel(stage)` convert raw API values to display labels.

---

## Components

| Component | Type | Purpose |
|---|---|---|
| `FilterBar` | Client | Search + status + stage filters (uses `useSearchParams`, no page reload) |
| `CandidateList` | Client | Grid of cards with 4-state rendering (loading/error/empty/success) |
| `CandidateCard` | Client | Single card with badges, links to detail page |
| `CandidateDetail` | Client | Full profile view with edit modal, controls, notes section |
| `CandidateForm` | Client | Reusable form for create & edit with per-field validation |
| `StatusControl` | Client | Dropdown to PATCH candidate status |
| `StageControl` | Client | Dropdown to PATCH candidate stage |
| `NoteForm` | Client | Textarea + submit to add notes (loading/error) |
| `NoteList` | Client | Note timeline with delete per note (loading/error/empty) |
| `StatusBadge` | Client | Color-coded status pill |
| `StageBadge` | Client | Color-coded stage pill |
| `LoadingSpinner` | Client | Animated loading indicator |

---

## Hooks

| Hook | Returns | Purpose |
|---|---|---|
| `useCandidates(params)` | `{ candidates, total, loading, error, refetch }` | Fetch filtered candidate list from API |
| `useCandidate(id)` | `{ candidate, loading, error, refetch, updateCandidate }` | Fetch single candidate + PATCH capability |
| `useNotes(candidateId)` | `{ notes, loading, error, refetch }` | Fetch notes for a candidate |

All hooks implement loading, error, and success states.

---

## Design System

### HealthCore Color Palette

| Color | Hex | Usage |
|---|---|---|
| Light Cyan | `#92eaff` | Stage: `personal_interview` badge |
| Sky Blue | `#75d4ff` | Status: `in_progress` badge, Stage: `review` badge |
| Primary Blue | `#0069ff` | Links, buttons, focus rings, Status: `selected` badge, Stage: `technical_interview` badge |
| Deep Blue | `#0031c4` | Hover states |
| Navy | `#0016a2` | Header background |

### Badge Color Mapping

**Status badges:**
- `received` → cyan (`bg-cyan-100 text-cyan-800`)
- `in_progress` → sky (`bg-sky-100 text-sky-800`)
- `selected` → blue (`bg-blue-100 text-blue-800`)
- `discarded` → gray (`bg-gray-100 text-gray-800`)

**Stage badges:**
- `pending` → gray (`bg-gray-100 text-gray-800`)
- `review` → sky (`bg-sky-100 text-sky-800`)
- `personal_interview` → cyan (`bg-cyan-100 text-cyan-800`)
- `technical_interview` → blue (`bg-blue-100 text-blue-800`)
- `offer_presented` → green (`bg-green-100 text-green-800`)

### Layout

- Page background: `#f9fafb` (gray-50)
- Cards and modals: white with border
- Header: navy (`#0016a2`) with white text

---

## State Handling

Every async operation in the app manages four states:

1. **Loading** — Shown while data is being fetched (spinner + message)
2. **Error** — Red alert with error message and "Try again" button
3. **Empty** — Placeholder with icon and descriptive text (lists only)
4. **Success** — The actual data rendered in the UI

Modals are used for create and edit forms to keep the user in context. After any mutation (create, edit, PATCH, add note, delete note), the relevant data is refetched to stay in sync with the backend.

---

## Development Notes

- **State management**: Component-level state with custom hooks only — no external libraries (Redux, Zustand, Jotai).
- **Routing**: Next.js App Router with `useSearchParams` for filter state (preserves URL for sharing/bookmarking).
- **Monorepo**: This project lives in a monorepo at `uis/talent-pipeline-tracker`. The `next.config.ts` includes `turbopack: { root: __dirname }` to resolve the Turbopack root warning.
- **`@/` path alias**: Maps to the project root (e.g., `@/components`, `@/lib/api`, `@/types`).
- **Notes API note**: The GET notes endpoint returns `{ data: Note[], meta: { total } }`, not a bare array. The `fetchNotes` function unwraps `response.data` before returning.
- **Build**: Run `npm run build` to verify no TypeScript errors before deployment.
