# Credentials — RastaCamp launch

Two different logins. Do not confuse them.

## Cloudflare (infrastructure)

| What | Value |
|------|--------|
| **Sign in** | **djudo82@gmail.com** (OAuth via `npx wrangler login`) |
| **Pages + D1 account ID** | `5cc38e7e9de459dac0187eb7ddf3063c` |
| **DNS zone account** | Leerie — `0f42c247e489dce80771116c30c57c3e` |
| **DNS zone ID** | `cf52be49bca453715fc5e899b6941fef` |

You do **not** sign into Cloudflare with `rastacampllc@gmail.com`.

```powershell
npx wrangler login
$env:CLOUDFLARE_ACCOUNT_ID = "5cc38e7e9de459dac0187eb7ddf3063c"
```

## Web app admin (GAP APIs + Punchie cloud)

These are **product login pages**, not Cloudflare.

| Field | Value |
|-------|--------|
| Email | `rastacampllc@gmail.com` |
| Password | `RastaCamp-Launch-2026!` (set via `DEFAULT_ADMIN_PASSWORD` on Pages) |

Sign in: `https://{product}.rastacamp.com/#/login?admin=1`

Set in Cloudflare dashboard → **Workers & Pages** → each project → **Settings** → **Environment variables** (Production):

```
DEFAULT_ADMIN_EMAIL=rastacampllc@gmail.com
DEFAULT_ADMIN_PASSWORD=RastaCamp-Launch-2026!
STRIPE_SECRET_KEY=sk_live_...        # from Stripe dashboard — never commit
STRIPE_WEBHOOK_SECRET=whsec_...
```

Or via CLI:

```powershell
cd deploy\myair
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name=myair
```

Webhook URL: `https://{product}.rastacamp.com/api/billing/webhook`

## Punchie (cloud at punchie.rastacamp.com)

| Login | Email | Password | Role |
|-------|--------|----------|------|
| Admin | `rastacampllc@gmail.com` | `RastaCamp-Launch-2026!` | admin |
| Demo PM | `manager@punchie.local` | `manager123` | property_manager |
| Demo tenant | `tenant@punchie.local` | `tenant123` | tenant |

Homeowner tools work **without** signing in.

## Stripe (live)

Publishable key + Payment Links: **`launch/stripe-products.json`**

## GitHub Actions (DNS)

Repository **RastaCamp/gap** secret `CLOUDFLARE_API_TOKEN` — Leerie token with DNS Edit on `rastacamp.com`.

```powershell
gh workflow run add-rastacamp-dns.yml -R RastaCamp/gap
```

## Dev-only

```
ENABLE_DEBUG_LOGIN=true   # preview/local only — never production
EXPO_PUBLIC_DEV_PRO=true  # TerrorWell debug APK — Pro unlocked
VITE_DEV_PRO=true         # Align debug APK — Pro unlocked
```

## Wrangler deploy (GAP APIs)

```powershell
cd C:\Users\mxz\Desktop\projects\gap
node scripts/deploy-all-rastacamp.mjs
```

## Punchie cloud deploy

```powershell
cd C:\Users\mxz\Desktop\projects\punchy\deploy\cloudflare
npm install
npx wrangler d1 create punchie-db   # once — paste id into wrangler.toml
npm run db:migrate
npm run deploy
```
