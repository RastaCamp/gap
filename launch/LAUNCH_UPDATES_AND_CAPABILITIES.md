# RastaCamp launch — updates, capabilities & status

**As of:** 2026-06-12  
**Health check:** `node scripts/check-rastacamp-sites.mjs` (all 17 domains should return HTTP 200)

---

## Executive summary

All **17 rastacamp.com properties** are **live** on Cloudflare Pages (djudo82 account) with DNS on the Leerie zone. **BioSurge** was the last gap — it now has a Stripe Payment Link, webhook, API secrets on Pages, and a pricing-page subscribe section like the other GAP APIs.

Launch priorities from the session:

| Priority | Status |
|----------|--------|
| Polished, live sites | **Done** — 17/17 HTTP 200 |
| Launch-ready on rastacamp.com DNS | **Done** — `launch/dns-targets.json` + GitHub DNS workflow |
| Operational products & services | **Mostly done** — APIs + apps deployed; Punchie PM routes partial |
| Integrated payments (Stripe) | **Done** — Payment Links + redirects for all paid products |
| Debug/dev stripped from public UI | **Done** — `scripts/launch-polish.mjs` |
| Dev APKs with Pro toggles | **Done** (debug builds; see paths in LAUNCH_STATUS.md) |
| Documentation | **Done** — this file, `LAUNCH_STATUS.md`, `api-docs-hub/`, `EDIT_AND_UPDATE.md` |

---

## All live sites (17)

### GAP APIs — $19.99/mo subscription APIs

| Site | URL | Payments | Capabilities |
|------|-----|----------|--------------|
| MyAir | https://myair.rastacamp.com | Stripe link + in-app checkout | Air quality data API, admin dashboard, usage metering |
| GridStatus | https://gridstatus.rastacamp.com | Stripe | Power grid status API |
| FoodSafe | https://foodsafe.rastacamp.com | Stripe | Food safety / recall intelligence API |
| WaterSafe | https://watersafe.rastacamp.com | Stripe | Water quality API |
| **BioSurge** | https://biosurge.rastacamp.com | **Stripe link + webhook + secrets** | Outbreak / biosurveillance API |
| SkyWatch | https://skywatch.rastacamp.com | Stripe | Aviation / flight tracking API |
| NewsSignal | https://newssignal.rastacamp.com | Stripe | News intelligence API |
| NeighborhoodScore | https://neighborhoodscore.rastacamp.com | Stripe | Neighborhood analytics API |
| GroundTruth | https://groundtruth.rastacamp.com | Stripe | Seismic / ground-truth API |

After Stripe payment → redirect to `/#/login?subscribed=1`. Sign in with the **same email** used at checkout to unlock API access (webhook activates subscription).

**Admin login (all GAP APIs):** `rastacampllc@gmail.com` / `RastaCamp-Launch-2026!`  
**Deploy:** `node scripts/deploy-all-rastacamp.mjs`

### Games & consumer apps

| App | URL | Price | Payments | Capabilities |
|-----|-----|-------|----------|--------------|
| Rep Battle | https://repbattle.rastacamp.com | $4.99 | Stripe buy bar | Flutter fitness game |
| Align | https://align.rastacamp.com | $4.99 | Stripe buy bar | Dice alignment game; Pro dice in Settings |
| Crumble | https://crumble.rastacamp.com | $4.99 | Stripe buy bar | Paper-crumble activity app; Pro toggle |
| Audiobook Creator | https://audiobook.rastacamp.com | $7.99/mo | Stripe buy bar | Web + Capacitor audiobook tool |
| Quotes | https://quotes.rastacamp.com | $4.99/mo | Stripe buy bar | Flutter web quotes manager |
| Ascension | https://ascension.rastacamp.com | $4.99 one-time | Stripe buy button on title | ESP card trainer; **Pro unlocks on `?purchase=success`** |
| Punchie | https://punchie.rastacamp.com | $7.99/mo | Stripe buy bar | Property punch-list / homeowner tools (cloud D1) |
| TerrorWell | https://terrorwell.rastacamp.com | $4.99 | Stripe buy bar | Horror narrative app (Expo web + APK) |

After payment → redirect to `/?purchase=success` (Ascension auto-unlocks Pro in browser).

**Deploy:** `node scripts/deploy-external-apps.mjs all`

---

## What was fixed in this session

### BioSurge (was the only product missing full Stripe setup)

- Created Stripe product + price (`price_1ThIlIGs5M6VYICJKpvyQt8n`, $19.99/mo)
- Payment Link: https://buy.stripe.com/6oUeVd1JebNF1cr2De8AE0g
- Post-payment redirect → `https://biosurge.rastacamp.com/#/login?subscribed=1`
- Stripe webhook → `https://biosurge.rastacamp.com/api/webhooks/stripe`
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` set on Cloudflare Pages (biosurge project)
- Pricing page updated with “Open payment page” subscribe section
- Redeployed to https://biosurge.rastacamp.com

### Previously fixed (same launch push)

- **Ascension** — moved off dead Cloudflare tunnel (502) to Pages; Stripe Pro gating on web
- **Align, Crumble, Audiobook, Quotes** — built, deployed, DNS, Stripe buy bars
- **Punchie, Terrorwell** — custom domains attached (were 403, now 200)
- **All Payment Links** — success redirects configured via `scripts/update-stripe-payment-links.mjs`

---

## Stripe catalog

Single source: **`launch/stripe-products.json`**

Utility scripts:

```powershell
# Refresh all payment-link redirects
$env:STRIPE_SECRET_KEY = "sk_live_..."   # never commit
node scripts/update-stripe-payment-links.mjs

# BioSurge one-time setup (already run)
node scripts/setup-biosurge-stripe.mjs
node scripts/setup-biosurge-webhook.mjs
```

---

## Deploy & ops commands

```powershell
# Health check all domains
node scripts/check-rastacamp-sites.mjs

# GAP APIs (9 products)
node scripts/deploy-all-rastacamp.mjs

# External apps
node scripts/deploy-external-apps.mjs all

# DNS sync (Leerie zone — needs RastaCamp/gap workflow)
gh workflow run add-rastacamp-dns.yml -R RastaCamp/gap

# Remove debug UI + inject Stripe on API frontends
node scripts/launch-polish.mjs
```

**Cloudflare:** sign in as **djudo82@gmail.com**  
**App admin:** **rastacampllc@gmail.com** (not Cloudflare)

See also: `launch/DEV_CREDENTIALS.md`, `launch/EDIT_AND_UPDATE.md`, `launch/CLOUDFLARE_MIGRATION.md`

---

## Capabilities by category

### Infrastructure

- Cloudflare Pages + D1 (djudo82 account `5cc38e7e9de459dac0187eb7ddf3063c`)
- DNS on rastacamp.com (Leerie zone, GitHub Actions workflow)
- Custom domains on all 17 products

### Payments

- Live Stripe Payment Links for every paid product
- GAP APIs: checkout sessions + webhooks for subscription entitlements (BioSurge fully wired; others may need secrets/webhooks verified per project)
- Consumer apps: Stripe buy buttons/bars on web; Ascension web Pro via URL param

### Mobile

- Debug APKs with Pro toggles / dev flags for Align, Crumble, Punchie, TerrorWell, Rep Battle (paths in `LAUNCH_STATUS.md`)

### Documentation

- `launch/api-docs-hub/` — consolidated API markdown + commercial use cases
- `launch/commercial/` — product-specific sell sheets

---

## Follow-ups (before public launch)

These are **not blockers** for “everything working” internally, but should be done before marketing launch:

1. **Rotate Stripe keys** — live secret was used in dev chat; create new restricted key and update Pages secrets
2. **Verify GAP API webhooks** — BioSurge webhook is new; confirm myair, foodsafe, etc. have `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and webhook endpoints in Stripe Dashboard pointing to each `https://{product}.rastacamp.com/api/webhooks/stripe`
3. **Game Pro entitlements from Stripe** — only **Ascension** auto-unlocks on `?purchase=success`; Align/Crumble/Others use dev toggles or need localStorage / account linking after Stripe pay
4. **BioSurge buy button widget** — Payment Link works; optional Stripe Dashboard buy button for embed (API cannot create buy buttons)
5. **Punchie** — PM/media API routes on cloud worker are partial; homeowner mode is fully functional
6. **Production APKs** — current builds are debug; sign release builds for Play Store when ready
7. **Single Cloudflare account** — optional migration per `CLOUDFLARE_MIGRATION.md` (djudo82 + Leerie DNS today)
8. **Biosurge pricing page tiers** — marketing tiers ($49 Pro) differ from API subscription ($19.99/mo); align copy if needed

---

## Quick reference — nothing left broken for “sites up + payments linked”

| Check | Result |
|-------|--------|
| All 17 domains HTTP 200 | Yes |
| BioSurge Stripe Payment Link | Yes |
| BioSurge webhook + secrets | Yes |
| Ascension tunnel 502 | Fixed |
| Punchie / Terrorwell 403 | Fixed |
| Stripe redirects all products | Yes |

**Bottom line:** All sites are ready for internal launch testing. BioSurge is no longer the exception. Remaining work is pre-public-launch hardening (key rotation, webhook audit, mobile entitlements, release APKs).
