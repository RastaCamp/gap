# Migrating RastaCamp to one Cloudflare account

Goal: run **DNS**, **Pages**, and **D1** under a single Cloudflare account (recommended: a dedicated **RastaCamp LLC** account, or consolidate onto **Leerie** where `rastacamp.com` already lives).

## Current split (2026-06)

| Resource | Account | ID / notes |
|----------|---------|------------|
| DNS `rastacamp.com` | Leerie | Zone `cf52be49bca453715fc5e899b6941fef` |
| Pages + D1 (9 GAP APIs, Punchie) | djudo82 | `5cc38e7e9de459dac0187eb7ddf3063c` |
| GitHub DNS workflow | RastaCamp/gap | Uses Leerie API token |
| Wrangler CLI | djudo82@gmail.com | OAuth sees both accounts |

Cross-account setup today: **Pages on djudo82** → proxied **CNAME** in **Leerie DNS** → `*.pages.dev`. Custom domain must be attached on the Pages project or you get error **1014**.

---

## Option A — Move everything to Leerie (simplest DNS)

Best when Leerie is the long-term business account and already owns the zone.

### 1. Prepare target account

1. Sign into Cloudflare as **Leerie** (or create **RastaCamp LLC** account and transfer the zone later).
2. Note **Account ID**: Dashboard → right sidebar on any zone/account overview.
3. Create API token: **Account** → Cloudflare Pages Edit, D1 Edit, Workers Scripts Edit (or use `wrangler login` for that account).

### 2. Export inventory from djudo82

```powershell
$env:CLOUDFLARE_ACCOUNT_ID = "5cc38e7e9de459dac0187eb7ddf3063c"
npx wrangler pages project list
npx wrangler d1 list
```

Save from `launch/dns-targets.json` and each `deploy/*/wrangler.toml` → `database_id`.

### 3. Recreate D1 on target account

For each app database:

```powershell
$env:CLOUDFLARE_ACCOUNT_ID = "<LEERIE_ACCOUNT_ID>"
cd deploy\myair
npx wrangler d1 create myair-db
# Update wrangler.toml database_id
npm run db:migrate
```

Repeat for all 9 GAP APIs + Punchie (`punchie-db`).

**Data migration** (if production users exist):

```powershell
npx wrangler d1 export myair-db --remote --output=backup.sql
$env:CLOUDFLARE_ACCOUNT_ID = "<TARGET>"
npx wrangler d1 execute myair-db --remote --file=backup.sql
```

### 4. Redeploy Pages on target account

```powershell
$env:CLOUDFLARE_ACCOUNT_ID = "<LEERIE_ACCOUNT_ID>"
node scripts/deploy-all-rastacamp.mjs
```

For Punchie:

```powershell
cd punchy\deploy\cloudflare
npm run deploy
```

Copy **environment variables** from each djudo82 Pages project (Stripe keys, admin password, JWT secret).

### 5. Attach custom domains (same hostnames)

On the **new** account, add each domain in Pages → Custom domains:

- `myair.rastacamp.com`, `gridstatus.rastacamp.com`, … (see `launch/dns-targets.json`)

Because DNS zone is already on Leerie, Cloudflare often auto-validates when zone and Pages share the account.

### 6. Update DNS (if CNAME targets change)

If project names differ (e.g. `foodsafe-b7y.pages.dev`), update CNAMEs:

```powershell
gh workflow run add-rastacamp-dns.yml -R RastaCamp/gap
```

Or edit records in Leerie DNS to point at new `*.pages.dev` hosts.

### 7. Update automation

| Item | Change |
|------|--------|
| `scripts/deploy-all-rastacamp.mjs` | Default `CLOUDFLARE_ACCOUNT_ID` |
| All `deploy/*/wrangler.toml` | `database_id` values |
| RastaCamp/gap secrets | `CLOUDFLARE_ACCOUNT_ID` for deploy workflows |
| `launch/DEV_CREDENTIALS.md` | Account IDs |

### 8. Decommission djudo82 copies

After 48h of clean traffic on new deployments:

1. Remove custom domains from old djudo82 Pages projects.
2. Delete old Pages projects and D1 databases (optional; keep backups first).

---

## Option B — Move DNS to djudo82 (not recommended)

Requires transferring `rastacamp.com` zone from Leerie → djudo82. That changes nameservers and affects email (MX records). Only do this if email and other Leerie services are intentionally moved.

---

## Option C — Dedicated RastaCamp LLC account (recommended long-term)

1. Create Cloudflare account with **rastacampllc@gmail.com** (Google login).
2. **Transfer** `rastacamp.com` from Leerie: Cloudflare dashboard → Transfer domain → initiate from new account (unlock + auth code from Leerie).
3. Follow **Option A** steps 3–8 on the new account.
4. Update Stripe webhook URLs if domains change (they should not if hostnames stay the same).

---

## Name conflicts on Pages

If `wrangler pages deploy --project-name=foodsafe` fails (name taken globally):

1. Use suffixed project name: `foodsafe-b7y` → host `foodsafe-b7y.pages.dev`.
2. Custom domain can still be `foodsafe.rastacamp.com`.
3. Update `launch/dns-targets.json` and re-run DNS workflow.

Fallback hostname pattern: `{name}s.rastacamp.com` (documented in `launch/EXTERNAL_APPS.md`).

---

## Checklist after migration

- [ ] All `/api/health` return OK on `*.rastacamp.com`
- [ ] Admin login works (`rastacampllc@gmail.com`)
- [ ] Stripe webhooks fire (test mode event in Stripe dashboard)
- [ ] GitHub Actions deploy + DNS workflows use new account token
- [ ] `launch/dns-targets.json` matches live `*.pages.dev` targets
- [ ] Old account projects removed or archived

---

## Quick reference commands

```powershell
# Login (pick account in browser)
npx wrangler login

# Target account for all deploys
$env:CLOUDFLARE_ACCOUNT_ID = "<YOUR_TARGET_ACCOUNT_ID>"

# Deploy all GAP APIs
cd C:\Users\mxz\Desktop\projects\gap
node scripts/deploy-all-rastacamp.mjs

# Sync DNS
gh workflow run add-rastacamp-dns.yml -R RastaCamp/gap
```

See also: `launch/EDIT_AND_UPDATE.md`, `launch/LAUNCH_STATUS.md`.
