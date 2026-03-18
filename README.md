# GAP — Multi-Project Monitoring Stack

A **multi-product API and frontend stack** for environmental, infrastructure, and anomaly intelligence. Each product lives in its own folder with a shared pattern: **ingestion → diff → SQLite → REST API + Svelte frontend**. Think Stripe for payments, Plaid for finance — this ecosystem is the **environmental + infrastructure + anomaly intelligence** layer.

- **Product spec & positioning:** [PRODUCT_SPEC.md](PRODUCT_SPEC.md) — endpoint shapes, tiers, pricing bands, “what makes it new,” and primary sources per product.
- **Portfolio & build order:** [PORTFOLIO_OVERVIEW.md](PORTFOLIO_OVERVIEW.md) — Tier 1–4 products and recommended build order (Phase 1 FoodSafe → Phase 2 MyAir → Phase 3 SkyWatch + WaterSafe → Phase 4 NeighborhoodScore + BioSurge).
- **Implementation status:** [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) — which sources are implemented vs stubs; [WHAT_ELSE_IS_NEEDED.md](WHAT_ELSE_IS_NEEDED.md) — API keys, endpoints, and data only you can supply.

Every project includes a **marketing-style frontend**: Landing, Features, Pricing, API Docs, Sell API, Sell Service, Sectors, and Contact. Copy is expanded and aligned to the product spec.

## Structure

```
gap/
├── api-registry/             # Central API database (reference & parsing)
├── common/                   # Shared unified schema, scoring, geo filtering
├── foodsafe-api/             # Tier 1 — Food recalls (FDA, USDA, CDC, FoodSafety.gov)
├── myair-api/                # Tier 1 — Environmental (AirNow, RadNet, CAMS, Toxic T-Map, USGS)
├── groundtruth-seismic-api/  # Tier 1 — Seismic/volcanic (USGS, IRIS, VAAC, RSOE)
├── skywatch-api/             # Tier 2 — Space weather & sky (NOAA SWPC, N2YO, moon, aurora)
├── watersafe-api/            # Tier 2 — Tap water by ZIP (EWG, EPA SDWIS, USGS, state MDE)
├── gridstatus-api/           # Tier 2 — Grid health (EIA, PowerOutage.us, NOAA geoelectric, DOE)
├── newssignal-api/           # Tier 3 — News aggregation (BBC, Reuters, AP, sentiment, dedupe)
├── biosurge-api/             # Tier 3 — Biological early warning (CDC, APHIS, ProMED, BirdCast)
├── neighborhoodscore-api/    # Tier 3 — Address-level score (crime, air, water, health)
├── PRODUCT_SPEC.md           # Single source of truth: endpoints, pricing, differentiators
├── PORTFOLIO_OVERVIEW.md     # Tier list + recommended build order
├── IMPLEMENTATION_STATUS.md  # Sources implemented vs stubs
├── WHAT_ELSE_IS_NEEDED.md    # API keys, endpoints, data you must supply
└── README.md                 # This file
```

All projects are scaffolded with ingestion, API, and frontend. To add a new product, copy an existing folder and swap types, schema, and sources; then add it to the registry and product spec.

## Per-Project Format (FoodSafe-style)

Each project folder has:

| Path | Purpose |
|------|--------|
| `package.json` | Scripts: `dev`, `dev:frontend`, `ingest`, `db:init` |
| `src/shared/types.ts` | Canonical record type, `NormalizedRecord`, `SyncJob` |
| `src/server/db/schema.sql` | Main table + FTS + `sync_jobs` + `diff_log` |
| `src/server/db/client.ts` | `getDb`, `initDb`, upsert, query, sync job helpers |
| `src/server/db/init.ts` | Create data dirs + apply schema |
| `src/server/index.ts` | Bun server: `/api/<entity>`, `/api/stats`, `/api/health`, `/api/admin/*` |
| `src/server/routes/*.ts` | Handlers for main entity and admin |
| `src/ingestion/normalize.ts` | `contentHash`, text/date normalization |
| `src/ingestion/diff.ts` | Snapshots, diff, `runDiff` |
| `src/ingestion/worker.ts` | Source registry, `runSource`, `runAllSources`, `runSingleSource` |
| `src/ingestion/sources/*.ts` | One file per source: fetch + normalize → `NormalizedRecord[]` |
| `frontend/` | Vite + Svelte app: Landing, Features, Pricing, Docs, ApiProduct, ServiceProduct, Sectors, Contact (proxies to API) |
| `data/` | SQLite DB, snapshots, logs (created at runtime) |

## Quick Start

**One project at a time** (from that project’s folder):

```bash
cd foodsafe-api
bun install
bun run db:init
bun run dev          # API on port 3001
# In another terminal:
bun run ingest       # or: bun run ingest fda
cd frontend && bun install && bun run dev
```

| Project | API port | Frontend port |
|---------|----------|---------------|
| foodsafe-api | 3001 | 5173 |
| myair-api | 3002 | 5174 |
| groundtruth-seismic-api | 3003 | 5175 |
| skywatch-api | 3004 | 5176 |
| watersafe-api | 3005 | 5177 |
| gridstatus-api | 3006 | 5178 |
| newssignal-api | 3007 | 5179 |
| biosurge-api | 3008 | 5180 |
| neighborhoodscore-api | 3009 | 5181 |

**Admin sync** (trigger ingestion via API):

```bash
curl -X POST http://localhost:3001/api/admin/sync \
  -H "Authorization: Bearer dev-token-change-me" \
  -d '{"source":"all"}'
```

Use the same pattern for other projects (change port and token if you set `ADMIN_TOKEN`).

## API Registry

`api-registry/registry.json` is the **API database** for reference and parsing:

- **`projects`** — Each project (myair, groundtruth-seismic, skywatch, watersafe, gridstatus, newssignal, biosurge, neighborhoodscore) and its list of source APIs (with docs, endpoints, API key notes).
- **`apis`** — Flat list of APIs with id, category, best endpoint, docs, auth.

Use it to:

- See which APIs each project uses.
- Drive scripts or codegen (e.g. generate source stubs from registry).
- Onboard new projects by picking APIs from `apis` and wiring them in `projects`.

See `api-registry/README.md` for the folder ↔ registry mapping and usage notes. See **`IMPLEMENTATION_STATUS.md`** for which sources are implemented vs stubs and what’s left.

## Adding a New Project

1. Copy an existing project folder (e.g. `myair-api`) and rename it (e.g. `watersafe-api`).
2. In the new folder:
   - Update `package.json` name and ports (`PORT`, frontend `dev --port` and proxy).
   - In `src/shared/types.ts`: define your entity and `SourceName` union.
   - In `src/server/db/schema.sql`: rename main table and columns to match your entity; keep `sync_jobs` and `diff_log` as-is.
   - In `src/server/db/client.ts`: rename upsert/query to your entity (e.g. `upsertReading` → `upsertWaterReport`), and adjust columns.
   - In `src/server/index.ts` and routes: point to your entity route (e.g. `/api/readings` → `/api/water`).
   - In `src/ingestion/worker.ts`: register your sources (implement fetch in `src/ingestion/sources/*.ts`).
3. Add the new project and its sources to `api-registry/registry.json` under `projects` and add any new entries to `apis` if needed.

## Environment

Per project: optional `.env` with `PORT`, `ADMIN_TOKEN`, `DB_PATH`, and any API keys below.

| Project | Env vars (optional) | Notes |
|---------|----------------------|--------|
| foodsafe-api | (server/ingestion as needed) | No external keys required for FDA/USDA/CDC/FoodSafety.gov |
| myair-api | `AIRNOW_API_KEY`, `AIRNOW_ZIP`, `TRI_STATES` | RadNet, TRI, USGS water key-free; AirNow needs key |
| groundtruth-seismic-api | — | USGS, IRIS, VAAC, RSOE all key-free |
| skywatch-api | `MET_NO_LAT`, `MET_NO_LON`, `N2YO_API_KEY`, `N2YO_LAT`, `N2YO_LON`, `N2YO_ALT`, `N2YO_SAT_ID` | N2YO needs key for positions |
| watersafe-api | — | USGS water key-free; SDWIS/EWG are stubs (no public API) |
| gridstatus-api | `EIA_API_KEY` | NOAA SWPC key-free |
| newssignal-api | — | NOAA alerts, GDACS key-free |
| biosurge-api | — | CDC, ProMED, BirdCast, APHIS key-free or public |
| neighborhoodscore-api | `AIRNOW_API_KEY`, `AIRNOW_ZIP` | Baltimore, CDC PLACES key-free; CityProtect/NSOPW stubs; use link-out for registries |

**Any project:** `DISABLED_SOURCES` — comma-separated source ids to skip when running `ingest all` (e.g. `DISABLED_SOURCES=ewg,cityprotect,nsopw`).

Full list and stub details: **`IMPLEMENTATION_STATUS.md`**.

## Platform layers (common/)

Repo root **`common/`** provides a shared **unified schema**, **scoring**, and **geo filtering** for cross-project use:

- **unified.ts** — `UnifiedRecord` (event_type, severity, risk_score, lat, lng, zip, state, timestamp). Use one mapper per provider to convert project records to this shape.
- **scoring.ts** — Rule-based `environmentalRiskScore()`, `waterRiskScore()`, `crimeRiskScore()`. Start with rules; add ML later.
- **geofilter.ts** — `haversineKm()`, `withinRadius()`, `filterByState()`, `filterByZip()`.

Use: add `"gap-common": "file:../common"` to a project’s package.json and import from `gap-common`, or use relative path to `common/index.ts`. Do not block MVP on EWG, CityProtect, or NSOPW bulk; use state registries and link-out (see `neighborhoodscore-api/.../linkout_registry.ts`) where automation is limited.

## Running Multiple Projects at Once

Run each API in its own terminal (different port):

```bash
cd foodsafe-api && bun run dev
cd myair-api && bun run dev
cd groundtruth-seismic-api && bun run dev
cd skywatch-api && bun run dev
cd watersafe-api && bun run dev
cd gridstatus-api && bun run dev
cd newssignal-api && bun run dev
cd biosurge-api && bun run dev
cd neighborhoodscore-api && bun run dev
```

Or use a process manager (e.g. `concurrently` or a simple script) to start all nine from the repo root.

## Summary

- **Nine products** across Tiers 1–4: FoodSafe, MyAir, GroundTruth Seismic, SkyWatch, WaterSafe, GridStatus, NewsSignal, BioSurge, NeighborhoodScore.
- **One pattern:** ingest from government and public sources → normalize → SQLite → REST API + Svelte frontend.
- **One spec:** [PRODUCT_SPEC.md](PRODUCT_SPEC.md) defines endpoint shapes, pricing, and differentiators; frontend copy is aligned to it.
- **Run any project:** `cd <project>` → `bun install` → `bun run db:init` → `bun run dev` → (optional) `bun run ingest` and `cd frontend && bun run dev`.
