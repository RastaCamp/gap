# Cloudflare Pages deployment (rastacamp.com)

Production uses **Cloudflare Pages + Functions + D1/KV/R2** — not Cloudflare Tunnel (tunnel needs your PC on).

Account ID: `0f42c247e489dce80771116c30c57c3e`  
Zone ID: `cf52be49bca453715fc5e899b6941fef`

## Save points

- Git tag: `savepoint/pre-cloudflare-2026-05-19` (gap + rep-battle)
- Folder backup: `Desktop/projects-savepoint-2026-05-19` (robocopy, excludes `node_modules`, `.git`, `build`)

## Deployed / ready projects

| App | Subdomain | Repo path | Type |
|-----|-----------|-----------|------|
| MyAir | myair.rastacamp.com | `gap/deploy/myair` | Pages + Functions + D1 |
| Rep Battle | repbattle.rastacamp.com | `rep-battle` (root) | Pages (Flutter web static) |

## Per-app checklist

1. **Static only** → Pages, build → `dist` or `build/web`
2. **Frontend + API** → Pages + `functions/api/*`, move Express/Bun routes to `onRequest` handlers
3. **SQL** → D1 + `wrangler d1 execute`
4. **Uploads** → R2 binding
5. **Settings/cache** → KV binding
6. **Custom domain** → Pages → Custom domains
7. **Secrets** → Pages env vars (never commit)

## Other GAP products (gap repo)

Each `*-api` folder is Bun + SQLite today. To go fully serverless:

1. Copy pattern from `deploy/myair` (D1 schema + `worker/router.ts`)
2. Point static site `API_BASE_URL` to `https://<product>.rastacamp.com`
3. Or serve Svelte frontend from same Pages project as MyAir

| Product | Suggested subdomain |
|---------|---------------------|
| foodsafe | foodsafe.rastacamp.com |
| skywatch | skywatch.rastacamp.com |
| gridstatus | gridstatus.rastacamp.com |
| watersafe | watersafe.rastacamp.com |
| biosurge | biosurge.rastacamp.com |
| newssignal | newssignal.rastacamp.com |
| neighborhoodscore | neighborhoodscore.rastacamp.com |
| groundtruth-seismic | groundtruth.rastacamp.com |

## wrangler auth

```bash
npx wrangler login
# or set CLOUDFLARE_API_TOKEN with Pages + D1 + Workers edit permissions
```

## Verify live

```bash
curl -s https://myair.rastacamp.com/api/health
curl -sI https://repbattle.rastacamp.com/
```
