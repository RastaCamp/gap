# Launch status — 2026-06-11

## GAP APIs — all 9 deployed (djudo82 Cloudflare)

| App | pages.dev host | Custom domain | Health |
|-----|----------------|---------------|--------|
| myair | myair.pages.dev | myair.rastacamp.com | ✅ |
| gridstatus | gridstatus.pages.dev | gridstatus.rastacamp.com | ✅ |
| foodsafe | foodsafe-b7y.pages.dev | foodsafe.rastacamp.com | ✅ |
| watersafe | watersafe-1og.pages.dev | watersafe.rastacamp.com | ✅ |
| biosurge | biosurge-7jp.pages.dev | biosurge.rastacamp.com | ✅ |
| skywatch | skywatch-6im.pages.dev | skywatch.rastacamp.com | ✅ |
| newssignal | newssignal-d14.pages.dev | newssignal.rastacamp.com | ✅ |
| neighborhoodscore | neighborhoodscore.pages.dev | neighborhoodscore.rastacamp.com | ✅ |
| groundtruth | groundtruth-6do.pages.dev | groundtruth.rastacamp.com | ✅ |

**Admin email:** `rastacampllc@gmail.com` (replaces non-existent `admin@rastacamp.com`)  
**Deploy script:** `node scripts/deploy-all-rastacamp.mjs`  
**DNS targets:** `launch/dns-targets.json` → run `gh workflow run add-rastacamp-dns.yml -R RastaCamp/gap`

## Also live

repbattle.rastacamp.com (Rep Battle web)

## Manual Cloudflare dashboard (per Pages project)

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `DEFAULT_ADMIN_PASSWORD` (email is `rastacampllc@gmail.com` via wrangler.toml)

## External apps — partial

| App | Status |
|-----|--------|
| Rep Battle | Quit-to-menu fix pushed; debug APK at `rep battle/build/app/outputs/flutter-apk/app-debug.apk` |
| Align | Pro dice gating + Settings toggle; debug APK at `align/android/app/build/outputs/apk/debug/app-debug.apk` |
| Crumble | Pro toggle already in UI — build APK from `crumble` when ready |
| Terrorwell / Punchie | Not started — see `launch/EXTERNAL_APPS.md` |

## Long-term

Migrate all Pages from djudo82 → dedicated Leerie/RastaCamp Cloudflare account.

## Key files

- Stripe: `launch/stripe-products.json`
- Edit sites: `launch/EDIT_AND_UPDATE.md`
- Credentials: `launch/DEV_CREDENTIALS.md`
