# RastaCamp deployment foundation (2026)

**Rule:** Production apps must run on **Cloudflare Pages / Workers / D1 / KV / R2** — not on your PC. **Cloudflare Tunnel** is for local dev or a dedicated always-on server only.

## Accounts (important)

| Account | ID | What lives here |
|---------|-----|-----------------|
| **Leerie.a.simpson@gmail.com** | `0f42c247e489dce80771116c30c57c3e` | Zone **rastacamp.com**, tunnel DNS (`*.cfargotunnel.com`) |
| **Djudo82@gmail.com** | `5cc38e7e9de459dac0187eb7ddf3063c` | Pages projects **myair**, **rep-battle**, D1 **myair-db** |

`rastacamp.com` custom domains for Pages work best when the **Pages project and the zone are on the same account**. Today they are split — we use Pages custom-domain API + zone DNS token until everything moves to Leerie’s account.

---

## Phase 1 audit (2026-05-22)

### DNS on rastacamp.com (zone `cf52be49…`) — **do not delete unknown records**

| Subdomain | Target | Type | Purpose |
|-----------|--------|------|---------|
| `@` / `www` | `…cfargotunnel.com` | CNAME proxied | Tunnel (PC/server) |
| `ascension` | tunnel | CNAME | Tunnel app |
| `btc` | tunnel | CNAME | Tunnel app |
| `mngr` | tunnel | CNAME | Tunnel app |
| `pilot-comms` | tunnel | CNAME | Tunnel app |
| `polis` | tunnel | CNAME | Tunnel app |
| `syncmesh` | tunnel | CNAME | Tunnel app |
| `syncmesh-relay` | tunnel | CNAME | Tunnel app |
| `myair` | *(none — Pages custom hostname)* | — | **Pages** (was briefly active; fix in progress) |
| `repbattle` | *(none)* | — | **Pages** (pending) |

**We did not delete** tunnel records. Only two short-lived CNAMEs to `*.pages.dev` were added then removed (they caused error 1014 cross-account).

### Pages projects (Djudo82 account)

| Cloudflare project | pages.dev | Custom domain | GitHub repo | Status |
|--------------------|-----------|---------------|-------------|--------|
| `myair` | https://myair.pages.dev | myair.rastacamp.com | RastaCamp/gap → `deploy/myair` | Live on pages.dev; custom domain re-attaching |
| `rep-battle` | https://rep-battle.pages.dev | repbattle.rastacamp.com | RastaCamp/rep-battle | Live on pages.dev; custom domain re-attaching |

### Planned naming (future apps)

Use: `rastacamp-{app}` in Cloudflare, public URL: `{app}.rastacamp.com`

Examples: `rastacamp-gnosis` → `gnosis.rastacamp.com`, `rastacamp-align` → `align.rastacamp.com`

### GAP products (not on Pages yet)

| Product | Suggested subdomain | Repo path |
|---------|-------------------|-----------|
| foodsafe | foodsafe.rastacamp.com | gap/foodsafe-api |
| skywatch | skywatch.rastacamp.com | gap/skywatch-api |
| gridstatus | gridstatus.rastacamp.com | gap/gridstatus-api |
| … | … | gap/*-api |

---

## API token: `rastacamp-pages-deploy` (current)

**User:** djudo82@gmail.com  
**Works for:** Pages/D1 on Djudo82 account; DNS edit on rastacamp.com zone  
**Does not work for:** Pages/D1 on Leerie account (`0f42c247…`)

### Recommended token (create on **Leerie account** when possible)

Name: `RastaCamp-Deployment`

| Scope | Permission |
|-------|------------|
| Zone `rastacamp.com` | DNS Edit, Zone Read |
| Account (Leerie) | Cloudflare Pages Edit, D1 Edit, Workers Scripts Edit, Account Settings Read |
| User | User Details Read |

Do **not** use Global API Key.

Store in GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` = Leerie’s account ID once migrated.

---

## Stack per app

| Need | Service |
|------|---------|
| Frontend | Cloudflare Pages |
| API | Pages Functions / Workers |
| SQL | D1 |
| Settings/cache | KV |
| Uploads | R2 |
| Analytics | Cloudflare Web Analytics |
| Payments | Stripe Checkout via Worker (secrets in Pages env) |
| Local dev only | Docker (+ tunnel optional) |

---

## Fix checklist (myair + rep-battle)

1. Custom domain attached in Pages project (Workers & Pages → project → Custom domains)
2. Domain status **Active** (not pending/error)
3. Do **not** add proxied CNAME to `*.pages.dev` on another account (error 1014)
4. Test: `https://{app}.rastacamp.com` and `https://{app}.pages.dev`

---

## For Leerie (super admin) — dashboard steps

1. Switch to **Leerie.a.simpson@gmail.com's Account** (or log in as that email)
2. **Websites** → **rastacamp.com** → **DNS** — review records; don’t delete tunnel rows until each app is migrated
3. **Workers & Pages** — list projects; migrate Pages here long-term
4. **Zero Trust → Networks → Tunnels** — tunnel `14867a10-…` still used by legacy subdomains
5. **Manage Account → Audit Log** — filter deletes around 2026-05-19
6. **API Tokens** — create **Account API Token** for deployment

---

## Save points

- Git tag: `savepoint/pre-cloudflare-2026-05-19` (gap + rep-battle)
- Folder: `Desktop/projects-savepoint-2026-05-19`
