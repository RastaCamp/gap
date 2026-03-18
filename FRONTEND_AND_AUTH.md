# Frontend, auth, and product pages

## White screen fix

- **Cause:** The app must be served by Vite (or another dev server), not opened as `file://`. The API must also be running so `/api` proxy works.
- **Fix:** Use **start.bat** in each project folder: it starts the API, then the frontend, then opens the browser. Double‑click `start.bat` for a one‑click launch.
- Each project’s **index.html** includes a “Loading…” fallback inside `#app` so something shows before Svelte mounts.

## What each project has (all complete)

| Project | start.bat | Users/usage schema | Auth + users routes | Landing, Login, Dashboard, Admin | Sell API + Sell Service pages |
|---------|-----------|--------------------|----------------------|-----------------------------------|--------------------------------|
| foodsafe-api | ✅ | ✅ | ✅ | ✅ | ✅ |
| myair-api | ✅ | ✅ | ✅ | ✅ | ✅ |
| groundtruth-seismic-api | ✅ | ✅ | ✅ | ✅ | ✅ |
| skywatch-api | ✅ | ✅ | ✅ | ✅ | ✅ |
| watersafe-api | ✅ | ✅ | ✅ | ✅ | ✅ |
| gridstatus-api | ✅ | ✅ | ✅ | ✅ | ✅ |
| newssignal-api | ✅ | ✅ | ✅ | ✅ | ✅ |
| biosurge-api | ✅ | ✅ | ✅ | ✅ | ✅ |
| neighborhoodscore-api | ✅ | ✅ | ✅ | ✅ | ✅ |

## Pattern (all 9 projects now have the same structure)

Each project has: `users` + `api_usage` schema; auth and users routes; `POST /api/login`, `POST /api/debug-login`, `GET /api/users/me`; admin routes guarded by `isAdminToken(req) || isAdmin(req)`; full frontend with Landing, Login, Dashboard, Admin, ApiProduct, ServiceProduct.

## Stats key and entity by project

- groundtruth-seismic: `total_events`, `/api/events`
- skywatch: `total_observations`, `/api/observations`
- watersafe: `total_reports`, `/api/reports`
- gridstatus: `total_readings`, `/api/readings`
- newssignal: `total_alerts`, `/api/alerts`
- biosurge: `total_reports`, `/api/reports`
- neighborhoodscore: `total_reports`, `/api/reports`

## Login and roles

- **User login:** Email (and optional password placeholder). Creates or finds user; returns token. User can see Dashboard (profile + usage).
- **Admin login:** Same as user with `role: "admin"` (e.g. via “Admin Login” button). Admin can access Admin page (analytics + user list).
- **Debug login:** One-click; returns a debug token that has admin access. No email required. Use for local testing.

Tokens are stored in `localStorage` and sent as `Authorization: Bearer <token>` for `/api/users/me`, `/api/admin/users`, `/api/admin/analytics`.

## Upgradable / expandable

- **Auth:** Replace in-memory `tokenToUserId` in `auth.ts` with JWT or a session store.
- **Profile:** Add `PATCH /api/users/me` and form to edit name, region, email.
- **Limits:** Enforce `usage_limit` in middleware and show in Dashboard.
- **Styling:** Adjust CSS in each `.svelte` file or introduce a shared design system.
