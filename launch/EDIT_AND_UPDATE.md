# How to edit and update RastaCamp sites

Quick reference for changing marketing copy, pricing, payments, and redeploying to **rastacamp.com**.

---

## Site types in this repo

| Type | Path | Build | Deploy target |
|------|------|-------|---------------|
| **Full product** | `{product}-api/frontend/` | Svelte + Vite | `deploy/{product}/` → Cloudflare Pages |
| **Static console** | `static-sites/{product}/` | None (single HTML) | Same Pages project or static hub |
| **API / billing** | `{product}-api/src/server/` or `deploy/{product}/worker/` | Bun locally; Worker in prod | Pages Functions |

Public URL pattern: **`https://{product}.rastacamp.com`**

Stripe product IDs and Payment Links: **`launch/stripe-products.json`**

---

## Edit marketing pages (most common)

1. Open `{product}-api/frontend/src/` in Cursor.
2. Key files:
   - `Landing.svelte` — home hero, nav links
   - `Features.svelte`, `Pricing.svelte`, `ApiProduct.svelte`, `ServiceProduct.svelte`
   - `Contact.svelte`, `Docs.svelte`
3. Save, then rebuild and deploy:

```powershell
cd C:\Users\mxz\Desktop\projects\gap\deploy\{product}
$env:CLOUDFLARE_ACCOUNT_ID = "5cc38e7e9de459dac0187eb7ddf3063c"
npm run deploy
```

4. Custom domain is already attached in Cloudflare Pages; DNS CNAME lives in **Leerie** zone `rastacamp.com`.

---

## Edit pricing / Stripe buy button

1. Update **`launch/stripe-products.json`** (Payment Link URL + `buyButtonId`).
2. Edit **`Pricing.svelte`** subscribe section or re-run:

```powershell
node scripts/launch-polish.mjs
```

3. Redeploy (see above).

For subscription entitlements after Stripe Payment Link checkout, ensure the customer email matches their account email; webhook handler in `worker/router.ts` sets `billing_status` to `active`.

---

## Edit static-site consoles

1. Edit `static-sites/{product}/index.html`.
2. Set `API_BASE_URL` to `https://{product}.rastacamp.com` before deploy (or inject at build).
3. Static sites are optional lightweight clients; **full Svelte frontends in `deploy/` are preferred for production**.

---

## Environment / secrets (Cloudflare Pages)

Set in **Workers & Pages → project → Settings → Environment variables** (Production):

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Checkout + webhooks |
| `STRIPE_WEBHOOK_SECRET` | Verify Stripe events |
| `STRIPE_PRICE_ID` | Optional; else uses `MONTHLY_PRICE_USD` |
| `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` | Bootstrap admin on first deploy |
| `ADMIN_TOKEN` | Legacy admin API access |
| `ENABLE_DEBUG_LOGIN` | Set `true` only in dev (never production) |

Local dev: copy `{product}-api/.env.example` → `.env`.

---

## DNS naming conflicts

If `{name}.rastacamp.com` is taken on another Cloudflare account, use **`{name}s.rastacamp.com`** (add `s`) for the updated deployment, then CNAME in Leerie DNS.

Order: **Pages custom domain first**, then **proxied CNAME** in Leerie zone.

---

## GitHub remotes

| Remote | Repo |
|--------|------|
| `origin` | djudo82/gap |
| `rastacamp` | RastaCamp/gap |

Push launch work to both:

```powershell
git push origin main
git push rastacamp main
```

GitHub Actions (RastaCamp/gap) can add DNS via `.github/workflows/add-rastacamp-dns.yml` when secrets are set.

---

## Full stack local test

```powershell
cd C:\Users\mxz\Desktop\projects\gap
docker compose up
```

Or per API: `cd foodsafe-api && bun run dev` (API) + `cd frontend && npm run dev` (UI).

---

## Commercial positioning docs

See **`launch/commercial/`** — one markdown file per API with use cases and competitive angles.
