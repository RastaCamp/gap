# Session save point — 2026-06-10 (pre-launch polish)

Git tag: `savepoint/pre-launch-2026-06-10`

## What this save point covers

All **GAP API products** (9), **static-sites**, **deploy/** Cloudflare Pages scaffolds, and launch prep docs in this repo.

## Live on rastacamp.com (at save point)

| Product | URL | Account |
|---------|-----|---------|
| MyAir | https://myair.rastacamp.com | Djudo82 Pages + Leerie DNS |
| GridStatus | https://gridstatus.rastacamp.com | Djudo82 Pages + Leerie DNS |
| Rep Battle | https://repbattle.rastacamp.com | Djudo82 Pages + Leerie DNS |
| BioSurge | https://biosurge.rastacamp.com | Djudo82 Pages + Leerie DNS |
| WaterSafe | https://watersafe.rastacamp.com | Djudo82 Pages + Leerie DNS |

## In repo, deploy-ready (CI + deploy/*)

foodsafe (scaffold pending), groundtruth, skywatch, newssignal, neighborhoodscore, biosurge, watersafe, gridstatus, myair

## External apps (separate repos / Desktop)

| App | Path / repo | Notes |
|-----|-------------|-------|
| Rep Battle | RastaCamp/rep-battle | Flutter web + mobile |
| Crumble | Desktop/projects/crumble | Capacitor |
| Align | Desktop/projects/align | Capacitor |
| Terrorwell | Desktop/projects/terrorwell | Expo |
| Punchie, Quotes, Audiobook | TBD | Not in gap repo |

## Restore

```powershell
git checkout savepoint/pre-launch-2026-06-10
```

## Next session priorities

1. Stripe Payment Links on all Pricing pages
2. Remove debug UI; guard `/api/debug-login` on Workers
3. Deploy all gap products to `*.rastacamp.com`
4. Dev APK builds with pro mode for mobile apps
5. Consolidate on Leerie Cloudflare account (target)
