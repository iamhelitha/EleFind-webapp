# EleFind — Copilot Instructions

## Project Overview

EleFind is an AI-powered elephant detection and mapping web app (BSc dissertation, University of Bedfordshire). It detects elephants in aerial/drone imagery using YOLOv11 + SAHI and visualises locations on an interactive Leaflet map. This is **Tier 3** of a three-tier architecture:

```
Browser → Next.js (App Router) → @gradio/client → HF Spaces Gradio app (YOLOv11+SAHI) → [future: PostgreSQL+PostGIS]
```

**Do NOT suggest adding FastAPI/Flask middleware.** `@gradio/client` calls the live HF Space (`iamhelitha/EleFind`) directly from server-side API routes — this is intentional.

## Tech Stack

- **Next.js 16** (App Router, Turbopack) · **TypeScript** · **Tailwind CSS v4** (PostCSS plugin, `@theme inline` in `globals.css`)
- **Leaflet** via `react-leaflet` v5 · **@gradio/client** (server-side only) · **lucide-react** icons · **react-hot-toast**
- **Zustand** available for state (not yet wired) · No database/auth yet (mock data in `lib/mock-data.ts`)

## Architecture & Data Flow

### Inference pipeline (`lib/gradio-client.ts` → `app/api/detect/route.ts`)
1. Frontend (`components/detection/ImageUploader.tsx`) posts FormData to `/api/detect`
2. API route validates file (type, 50 MB limit), converts to Blob, calls `runDetection()`
3. `runDetection()` connects to HF Space via `Client.connect()` → `client.predict("/detect", …)`
4. Gradio returns an **8-element tuple** — index mapping is fixed and must not change:
   - `[0]` annotated image (file URL object with `.url`) · `[1]` elephant count · `[2–4]` avg/max/min confidence · `[5]` params markdown · `[6]` chart data · `[7]` detection table (DataFrame: `{headers, data}`)
5. API returns typed `DetectionApiResponse` → frontend renders in `DetectionResults`

### Map system (`app/map/page.tsx`, `app/crossings/page.tsx`)
- **Always** dynamically import map components: `dynamic(() => import("…"), { ssr: false })` — Leaflet accesses `window` and will crash SSR
- Tile layer: CartoDB Positron (`https://{s}.basemaps.cartocdn.com/light_all/…`)
- `EleMap` accepts `detections`, `crossingZones`, and `filters` props; filtering is applied inside the component
- Currently uses `MOCK_DETECTIONS` / `MOCK_CROSSINGS` from `lib/mock-data.ts` (Sri Lanka coordinates)

## Key Conventions

### File organisation
- `app/` — pages and API routes (App Router)
- `components/{ui,detection,map,layout}/` — grouped by domain
- `lib/` — server utilities and shared helpers
- `types/index.ts` — **single file** for all shared TypeScript types

### Styling
- Tailwind v4 with design tokens in `app/globals.css` `:root` + `@theme inline` block
- Colour palette: forest greens (`green-900: #1a3d2b`, `green-700: #2d6a4f`), amber accent (`#f4a261`), risk scale (`risk-low/medium/high/critical`)
- Fonts: **Syne** (headings, via `font-heading` class) + **DM Sans** (body, via `font-body`), loaded in `app/layout.tsx` via `next/font/google`
- Cards: 12px border-radius, subtle shadow, light border (`border-card-border bg-card-bg`)

### Component patterns
- UI primitives (`Button`, `Card`, `Badge`, `Spinner`) are in `components/ui/` — use these instead of raw HTML
- `Button` supports `variant` (primary/secondary/danger/ghost), `size`, and `loading` props
- `Badge` has a `riskVariant` map export for converting `RiskLevel` → badge variant
- JSDoc comments on every component explaining purpose — continue this pattern

### API route pattern
- Return typed `{ success: boolean; data?: T; error?: string }` responses
- HF Space errors → 502 with user-friendly message about free-tier availability
- File validation happens in the route, not the client

## Build & Dev

```bash
npm run dev          # Next.js dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint (next core-web-vitals + typescript)
```

`next.config.ts` has `turbopack: { root: process.cwd() }` to silence multi-lockfile warnings, plus a `webpack` fallback block and `images.remotePatterns` for HF Spaces domains.

## Not Yet Implemented (stub directories exist)

- `app/api/detections/` — CRUD for detections in PostGIS (empty)
- `app/api/crossings/` — CRUD for crossing zones (empty)
- `app/auth/login/`, `app/auth/register/` — NextAuth pages (empty)
- Prisma schema / database integration
- `react-leaflet-cluster` for marker clustering
- `leaflet-draw` for officer drawing tools (load dynamically, crossings page only)
- Zustand store wiring

## Critical Constraints

1. **`@gradio/client` is server-side only** — never import `lib/gradio-client.ts` in client components; `HF_SPACE_NAME` must stay in env vars
2. **Leaflet SSR** — any component importing `leaflet` or `react-leaflet` **must** use `next/dynamic` with `ssr: false`
3. **TIFF preview** — browsers cannot render TIFF in `<img>`; show a placeholder, display only the annotated result image from HF Spaces
4. **Gradio tuple order** — the 8-element response order from `app.py` is fixed; do not reindex
5. **Mobile-first** — 47.9% of target users use smartphones; all pages must work on mobile
6. **PostGIS columns** — when adding Prisma schema, use `Unsupported("geometry(…)")` and `prisma.$queryRaw` for spatial queries
