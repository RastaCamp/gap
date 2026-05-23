# RastaCamp deployment foundation (2026)

**Rule:** Production apps on **Cloudflare Pages / Workers / D1 / KV / R2** — not your PC. **Tunnel/Docker** = local dev or dedicated server only.

**Foundation rule:** `rastacamp.com` zone, Pages projects, DNS, and deployment tokens must all live on **one Cloudflare account** — **Leerie.a.simpson@gmail.com** (`0f42c247e489dce80771116c30c57c3e`).

Cross-account Pages + zone caused `myair.rastacamp.com` to show **Server Not Found** even when Pages API reported “active” (no stable public DNS).

→ **Migration guide:** [deploy/LEERIE_ACCOUNT_SETUP.md](deploy/LEERIE_ACCOUNT_SETUP.md)

---

## Current state (2026-05-23)

| Item | Location | Status |
|------|----------|--------|
| Zone `rastacamp.com` | Leerie account | OK |
| Tunnel DNS (legacy) | Leerie zone | Intact — not deleted |
| Pages `myair`, `rep-battle` | Djudo82 account | **Legacy — retire after Leerie migrate** |
| Custom domains on Djudo82 Pages | — | **Removed** (unstable cross-account) |
| Manual CNAME → `*.pages.dev` | Leerie DNS | **None** (correct) |
| `.pages.dev` URLs | Djudo82 | Still work as interim |

**Interim URLs:** https://myair.pages.dev · https://rep-battle.pages.dev

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
