# Static deploy-ready sites

One standalone `index.html` per product under `static-sites/<product>/`. **No build step.**

## What’s in each page

- **API_BASE_URL** — Set in the `<script>` block to your deployed Bun API (e.g. `https://api.yourdomain.com` or `http://localhost:3001`). Must be HTTPS in production. The API already sends `Access-Control-Allow-Origin: *` for browser calls.
- **Login / register** — Same `/api/login` and `/api/register` as the main app; token stored in `localStorage` (`gap_token_<product>`).
- **Subscribe** — Calls `/api/billing/checkout` then redirects to Stripe. Requires Stripe env vars on the API.
- **Load data** — Calls the product’s main data route (`/api/recalls`, `/api/readings`, …) with `Authorization: Bearer …`. Returns **401** if not signed in and **402** if there is no active subscription (when `REQUIRE_PAID_API` is not `false` on the server).

## Projects

| Folder | Main data path |
|--------|----------------|
| `foodsafe` | `/api/recalls` |
| `myair` | `/api/readings` |
| `skywatch` | `/api/observations` |
| `watersafe` | `/api/reports` |
| `gridstatus` | `/api/readings` |
| `newssignal` | `/api/alerts` |
| `biosurge` | `/api/reports` |
| `neighborhoodscore` | `/api/reports` |
| `groundtruth-seismic` | `/api/events` |

## Pricing (easy to change)

- On the API, set **`MONTHLY_PRICE_USD`** (default **20**). Used for Stripe Checkout when **`STRIPE_PRICE_ID`** is not set, and exposed at **`GET /api/pricing`** for static sites and pricing pages.
- Optionally set **`STRIPE_PRICE_ID`** to use a Price created in the Stripe Dashboard instead of dynamic `price_data`.

## Local dev without paying

On the API `.env`: **`REQUIRE_PAID_API=false`** so data routes work without a subscription (still useful to send a Bearer token if you test other behavior).

## Deploy

GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any static host. Upload the folder or connect the repo.
