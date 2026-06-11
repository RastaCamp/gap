# Launch status — 2026-06-11 (updated)

## Cloudflare login

**Use djudo82@gmail.com** for Cloudflare dashboard and `wrangler login`.  
**rastacampllc@gmail.com** is only for signing into the web products (admin login), not Cloudflare.

## GAP APIs — all 9 live

See `launch/dns-targets.json`. Deploy: `node scripts/deploy-all-rastacamp.mjs`

## External apps

| App | Web | APK | Notes |
|-----|-----|-----|-------|
| Rep Battle | repbattle.rastacamp.com | `rep battle/build/app/outputs/flutter-apk/app-debug.apk` | Quit fix pushed |
| Align | — | `align/android/app/build/outputs/apk/debug/app-debug.apk` | Pro dice gating |
| Crumble | — | `crumble/apps/web/android/app/build/outputs/apk/debug/app-debug.apk` | Pro toggle in UI |
| **Punchie** | **punchie.rastacamp.com** → punchie-rc.pages.dev | `punchy/client/android/app/build/outputs/apk/debug/app-debug.apk` | Cloud D1 API; no PC server needed |
| **TerrorWell** | **terrorwell.rastacamp.com** → terrorwell.pages.dev | `TerrorWell/android/app/build/outputs/apk/debug/` (after `expo run:android`) | `EXPO_PUBLIC_DEV_PRO=true` in `.env` |

## Docs

- Credentials: `launch/DEV_CREDENTIALS.md`
- **Migrate to one CF account:** `launch/CLOUDFLARE_MIGRATION.md`
- Stripe: `launch/stripe-products.json`

## Still manual

Set `STRIPE_SECRET_KEY` + webhooks on each Pages project (Cloudflare dashboard, djudo82 account).

Punchie PM/media routes on cloud worker are partial — homeowner mode fully works.
