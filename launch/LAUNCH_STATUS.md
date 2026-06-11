# Launch status — 2026-06-10

## Done this session (gap repo → RastaCamp/gap)

| Item | Status |
|------|--------|
| Save point tag `savepoint/pre-launch-2026-06-10` | ✅ Pushed |
| Stripe Payment Links + buy buttons on Pricing pages | ✅ 8/9 APIs (BioSurge uses dashboard subscribe) |
| Removed public Debug nav + Debug Login buttons | ✅ All Svelte frontends |
| Worker `/api/debug-login` gated | ✅ `ENABLE_DEBUG_LOGIN=true` only |
| `deploy/foodsafe` + 8 CI workflows | ✅ |
| Launch docs | ✅ `launch/EDIT_AND_UPDATE.md`, `DEV_CREDENTIALS.md`, commercial playbook |
| Pushed to **RastaCamp/gap** | ✅ commit `86535f4` |
| MyAir redeployed with polish | ✅ |

## Live rastacamp.com (confirmed earlier)

myair, gridstatus, repbattle, biosurge, watersafe

## Deploy remaining gap products

```powershell
cd C:\Users\mxz\Desktop\projects\gap\deploy
.\finish-deploy-apps.ps1
```

Or trigger GitHub Actions on **RastaCamp/gap** (needs `CLOUDFLARE_*` secrets on that repo).

DNS: use `gh workflow run add-rastacamp-dns.yml -R RastaCamp/gap` — update workflow with correct `*.pages.dev` targets if project names conflict.

## Not done yet (separate repos / next session)

- Dev APK builds (Rep Battle, Align, Crumble, Terrorwell, etc.) — see `launch/EXTERNAL_APPS.md`
- Rep Battle quit-to-menu bug
- Align / Audiobook / Punchie pro gating
- Terrorwell rastacamp.com web deploy
- Leerie-only Cloudflare consolidation
- Set `STRIPE_SECRET_KEY` on each Pages project in Cloudflare dashboard
- Wire Stripe webhooks so Payment Link purchases activate `billing_status`

## Key files

- Stripe config: `launch/stripe-products.json`
- How to edit sites: `launch/EDIT_AND_UPDATE.md`
- Admin bootstrap: `launch/DEV_CREDENTIALS.md`
