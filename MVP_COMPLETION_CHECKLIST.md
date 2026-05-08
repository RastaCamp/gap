# GAP MVP completion checklist

Use this checklist to bring each project to a standalone, local-demo-ready state before cloud deployment.

## 1) One-time setup per API project

For each project folder:

- `foodsafe-api`
- `myair-api`
- `groundtruth-seismic-api`
- `skywatch-api`
- `watersafe-api`
- `gridstatus-api`
- `newssignal-api`
- `biosurge-api`
- `neighborhoodscore-api`

Run:

```bash
cp .env.example .env
bun install
bun run db:init
```

Then set any API keys in `.env` where required (AirNow, N2YO, EIA).

## 2) Start API + frontend (per project)

From a project folder:

```bash
bun run dev
```

From the matching `frontend/` folder:

```bash
bun install
bun run dev
```

## 3) Trigger and validate ingestion

Run:

```bash
bun run ingest
```

Validate:

- API health: `GET /api/health`
- Primary data endpoint returns items:
  - FoodSafe: `/api/recalls`
  - MyAir: `/api/readings`
  - GroundTruth Seismic: `/api/events`
  - SkyWatch: `/api/observations`
  - WaterSafe: `/api/reports`
  - GridStatus: `/api/readings`
  - NewsSignal: `/api/alerts`
  - BioSurge: `/api/reports`
  - NeighborhoodScore: `/api/reports`

## 4) Frontend completeness checks

Each frontend should load these pages without errors:

- Landing
- Features
- Pricing
- Docs
- Contact
- API product page
- Service product page

## 5) Final pre-deploy sanity checks (local)

- `.env` exists and secrets are not committed.
- No runtime SQLite files are staged in git.
- `bun run dev` starts without crashes.
- One ingestion run succeeds.
- Docs page uses real endpoint examples for that product.

When all checks pass for each project, the stack is MVP-complete and ready for deployment setup later (Render/Railway/Cloudflare Pages, etc.).
