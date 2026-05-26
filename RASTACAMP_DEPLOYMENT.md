# RastaCamp deployment foundation (2026)

**Rule:** Production apps on **Cloudflare Pages / Workers / D1 / KV / R2** — not your PC. **Tunnel/Docker** = local dev or dedicated server only.

**Ideal:** Zone + Pages + DNS + token on **one account** (Leerie). See [deploy/LEERIE_ACCOUNT_SETUP.md](deploy/LEERIE_ACCOUNT_SETUP.md).

**Current (working 2026-05-26):** Pages on Djudo82, zone on Leerie — works only if you:
1. Add custom domain in **Workers & Pages → Custom domains** first
2. Then add **proxied CNAME** in `rastacamp.com` DNS → `myair.pages.dev` / `rep-battle.pages.dev`

Never add CNAME before Pages custom domain, and never delete the CNAME while the custom domain is still attached.

---

## Live URLs (verified)

| App | rastacamp.com | pages.dev |
|-----|---------------|-----------|
| MyAir | https://myair.rastacamp.com | https://myair.pages.dev |
| Rep Battle | https://repbattle.rastacamp.com | https://rep-battle.pages.dev |

---

## Current state

| Item | Location | Status |
|------|----------|--------|
| Zone `rastacamp.com` | Leerie account | OK |
| Tunnel DNS (legacy) | Leerie zone | Intact |
| Pages `myair`, `rep-battle` | Djudo82 account | Live |
| DNS `myair` / `repbattle` CNAME | Leerie zone → `*.pages.dev` | Proxied, active |

---

## Target naming (Leerie account)

| Cloudflare project | Public URL | GitHub |
|--------------------|------------|--------|
| `rastacamp-myair` | myair.rastacamp.com | RastaCamp/gap → `deploy/myair` |
| `rastacamp-rep-battle` | repbattle.rastacamp.com | RastaCamp/rep-battle |

Future: `rastacamp-{app}` → `{app}.rastacamp.com`

---

## Token: `RastaCamp-Deployment` (create on Leerie only)

**Account API Token** on Leerie account — not User token on djudo82.

| Scope | Permission |
|-------|------------|
| Account | Cloudflare Pages Edit, D1 Edit, Workers Scripts Edit, Account Settings Read |
| Zone `rastacamp.com` | DNS Edit, Zone Read |

GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` = `0f42c247e489dce80771116c30c57c3e`

---

## DNS (Leerie zone) — do not delete unknown records

Tunnel subdomains still point to `14867a10-…cfargotunnel.com`: `@`, `www`, `ascension`, `btc`, `mngr`, `pilot-comms`, `polis`, `syncmesh`, `syncmesh-relay`.

**Do not** add manual CNAME to `*.pages.dev`. Use **Workers & Pages → Custom domains** on the **same account as the zone**.

---

## Stack per app

| Need | Service |
|------|---------|
| Frontend | Cloudflare Pages |
| API | Pages Functions / Workers |
| SQL | D1 |
| Cache/settings | KV |
| Uploads | R2 |
| Analytics | Cloudflare Web Analytics |
| Payments | Stripe via Worker (secrets in Pages env) |

---

## Save points

- Git tag: `savepoint/pre-cloudflare-2026-05-19`
- Folder: `Desktop/projects-savepoint-2026-05-19`
