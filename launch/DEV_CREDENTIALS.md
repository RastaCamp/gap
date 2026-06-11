# Dev & admin credentials (launch bootstrap)

**Change these before public launch.** Set in Cloudflare Pages → Environment variables (Production).

## Default admin bootstrap

When `DEFAULT_ADMIN_PASSWORD` is set on first deploy, the worker creates:

| Field | Default |
|-------|---------|
| Email | `admin@rastacamp.com` (or `DEFAULT_ADMIN_EMAIL`) |
| Password | value of `DEFAULT_ADMIN_PASSWORD` |
| Role | `admin` |

Suggested launch values (rotate after go-live):

```
DEFAULT_ADMIN_EMAIL=admin@rastacamp.com
DEFAULT_ADMIN_PASSWORD=RastaCamp-Launch-2026!
```

Sign in at `https://{product}.rastacamp.com/#/login?admin=1` then open **Admin** from the dashboard.

## Stripe (live)

Publishable key and Payment Links: **`launch/stripe-products.json`**

Set on each Pages project:

```
STRIPE_SECRET_KEY=sk_live_...   (from Stripe dashboard — never commit)
STRIPE_WEBHOOK_SECRET=whsec_...
```

Webhook endpoint: `https://{product}.rastacamp.com/api/billing/webhook`

Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Debug login (dev only)

```
ENABLE_DEBUG_LOGIN=true
```

Only on preview/local. **Never** set in production.

## GitHub Actions (DNS + deploy)

Repository **RastaCamp/gap** secrets:

- `CLOUDFLARE_API_TOKEN` — Leerie account token with DNS Edit on `rastacamp.com`
- `CLOUDFLARE_ACCOUNT_ID` — `0f42c247e489dce80771116c30c57c3e` (Leerie) or Djudo82 `5cc38e7e9de459dac0187eb7ddf3063c` for Pages

## Wrangler local

```powershell
npx wrangler login
$env:CLOUDFLARE_ACCOUNT_ID = "5cc38e7e9de459dac0187eb7ddf3063c"
cd deploy\myair
npm run deploy
```
