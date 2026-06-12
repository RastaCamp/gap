# Launch status — 2026-06-12

## Cloudflare login

**Use djudo82@gmail.com** for Cloudflare dashboard and `wrangler login`.  
**rastacampllc@gmail.com** is only for signing into the web products (admin login), not Cloudflare.

## All rastacamp.com sites (17)

Check: `node scripts/check-rastacamp-sites.mjs`

| Site | Status |
|------|--------|
| 9 GAP APIs | Live — `node scripts/deploy-all-rastacamp.mjs` |
| repbattle, align, crumble, audiobook, quotes, ascension | Live — Stripe buy bar / buy button |
| punchie, terrorwell | Pages OK; custom domain may show 403 until CF marks domain **active** |

DNS targets: `launch/dns-targets.json` — sync via `gh workflow run add-rastacamp-dns.yml -R RastaCamp/gap`

## Stripe Payment Links

All configured with post-payment redirects via `scripts/update-stripe-payment-links.mjs`:

- **Games/apps** → `https://{site}/?purchase=success`
- **GAP APIs** → `https://{site}/#/login?subscribed=1`
- **Ascension** unlocks Pro in-browser on `?purchase=success`

Catalog: `launch/stripe-products.json`

## External apps

| App | Web | APK |
|-----|-----|-----|
| Rep Battle | repbattle.rastacamp.com | `rep battle/build/app/outputs/flutter-apk/app-debug.apk` |
| Align | align.rastacamp.com | `align/android/app/build/outputs/apk/debug/app-debug.apk` |
| Crumble | crumble.rastacamp.com | `crumble/apps/web/android/app/build/outputs/apk/debug/app-debug.apk` |
| Audiobook Creator | audiobook.rastacamp.com | web + Capacitor |
| Quotes | quotes.rastacamp.com | Flutter web |
| Ascension | ascension.rastacamp.com | Play IAP + web Stripe |
| Punchie | punchie.rastacamp.com | `punchy/client/android/app/build/outputs/apk/debug/app-debug.apk` |
| TerrorWell | terrorwell.rastacamp.com | `TerrorWell/android/app/build/outputs/apk/debug/app-debug.apk` |

## Deploy commands

```powershell
# GAP APIs
node scripts/deploy-all-rastacamp.mjs

# Games/apps (align, crumble, audiobook, quotes, ascension)
node scripts/deploy-external-apps.mjs all

# Stripe redirects (requires STRIPE_SECRET_KEY env)
node scripts/update-stripe-payment-links.mjs ascension align crumble ...

# DNS (Leerie zone)
gh workflow run add-rastacamp-dns.yml -R RastaCamp/gap
```

## Still manual / post-launch

- Rotate Stripe keys before public launch (keys used in dev session only)
- Set `STRIPE_SECRET_KEY` + webhooks on GAP API Pages projects for subscription entitlements
- Biosurge: no Payment Link yet — in-app subscribe after sign-in
- Punchie PM/media routes on cloud worker are partial — homeowner mode fully works

## Docs

- Credentials: `launch/DEV_CREDENTIALS.md`
- Migration: `launch/CLOUDFLARE_MIGRATION.md`
- Edit guide: `launch/EDIT_AND_UPDATE.md`
- API hub: `launch/api-docs-hub/INDEX.md`
