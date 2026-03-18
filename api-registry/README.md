# API Registry

Central reference for all external APIs used across GAP (multi-project monitoring stack). Use this for:

- **Discovery** — Which APIs each project uses
- **Parsing / codegen** — Endpoints, auth, and docs in one place
- **Onboarding** — New projects can pick from `apis` and link in `projects`

## Structure

- **`registry.json`**
  - `projects` — Map of project id → name, description, status, list of source APIs
  - `apis` — Flat list of APIs with id, category, endpoints, docs, auth

## Projects (folder ↔ registry)

| Project folder            | Registry key             | Focus                          |
|---------------------------|---------------------------|--------------------------------|
| `foodsafe-api/`           | (existing)                | Food recalls                   |
| `myair-api/`              | `myair`                   | Air quality, radiation         |
| `groundtruth-seismic-api/`| `groundtruth-seismic`     | Earthquakes, volcanoes, seismic|
| `skywatch-api/`           | `skywatch`                | Space weather, satellites       |
| `watersafe-api/`          | `watersafe`               | Tap water, SDWIS                |
| `gridstatus-api/`        | `gridstatus`              | Grid / power                   |
| `newssignal-api/`         | `newssignal`              | News / alerts RSS               |
| `biosurge-api/`           | `biosurge`                | Disease outbreaks               |
| `neighborhoodscore-api/`  | `neighborhoodscore`       | Local safety, PLACES            |

## Using the registry

- **From scripts**: `require('./api-registry/registry.json')` or fetch and filter by `projects.<name>.sources` or `apis` by category.
- **Env**: APIs that need keys are marked with `"auth": "api_key"`; store keys in each project’s `.env` (e.g. `AIRNOW_API_KEY`, `EIA_API_KEY`).

## Stub sources (what's left)

Some project sources are **stubs** (no public API or no key yet): **copernicus** (myair), **sdwis**, **ewg** (watersafe), **cityprotect**, **nsopw** (neighborhoodscore). Stub files live in each project's `src/ingestion/sources/` and include JSDoc with "To implement" steps. See **`IMPLEMENTATION_STATUS.md`** in the repo root for file paths, reasons, and how to implement or add new sources.
