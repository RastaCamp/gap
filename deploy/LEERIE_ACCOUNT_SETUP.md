# RastaCamp — single-account foundation (Leerie account only)

**Problem:** `rastacamp.com` is on account `0f42c247e489dce80771116c30c57c3e` (Leerie). Pages were on Djudo82’s account → custom domains flip between working and “Server Not Found” with no stable DNS.

**Rule:** Zone + Pages + DNS + deployment tokens **all on the same account** (Leerie).

---

## Step 1 — Log in as Leerie

1. **Log out** of Cloudflare (djudo82 session).
2. **Log in** with **leerie.a.simpson@gmail.com** (owner of `rastacamp.com`).
3. Confirm top bar / home shows **Leerie’s account** and **Websites → rastacamp.com** is visible.

Direct account URL (after login as Leerie):

`https://dash.cloudflare.com/0f42c247e489dce80771116c30c57c3e`

---

## Step 2 — Create **Account API Token** (not User token)

1. **Manage Account** → **Account API Tokens** → **Create Token**
2. Name: `RastaCamp-Deployment`
3. Permissions:

| Resources | Permission | Access |
|-----------|------------|--------|
| Account | Cloudflare Pages | Edit |
| Account | D1 | Edit |
| Account | Workers Scripts | Edit |
| Account | Account Settings | Read |
| Zone `rastacamp.com` | DNS | Edit |
| Zone `rastacamp.com` | Zone | Read |

4. **Create** → copy token once.

**Do not** use Global API Key. **Do not** create this token while logged in as djudo82.

Account ID for secrets:

```
0f42c247e489dce80771116c30c57c3e
```

---

## Step 3 — GitHub secrets (both repos)

```powershell
gh secret set CLOUDFLARE_API_TOKEN -R RastaCamp/gap -b "LEERIE_ACCOUNT_TOKEN"
gh secret set CLOUDFLARE_ACCOUNT_ID -R RastaCamp/gap -b "0f42c247e489dce80771116c30c57c3e"
gh secret set CLOUDFLARE_API_TOKEN -R RastaCamp/rep-battle -b "LEERIE_ACCOUNT_TOKEN"
gh secret set CLOUDFLARE_ACCOUNT_ID -R RastaCamp/rep-battle -b "0f42c247e489dce80771116c30c57c3e"
```

Paste the Leerie token to djudo82 (or run the commands yourself while logged in as Leerie on GitHub).

---

## Step 4 — One-time Cloudflare setup (Leerie account)

On a machine with the Leerie token:

```powershell
$env:CLOUDFLARE_API_TOKEN = "LEERIE_ACCOUNT_TOKEN"
$env:CLOUDFLARE_ACCOUNT_ID = "0f42c247e489dce80771116c30c57c3e"

# MyAir D1
cd gap\deploy\myair
npx wrangler d1 create myair-db
# Paste database_id into wrangler.toml, then:
npm run db:migrate
npx wrangler pages project create rastacamp-myair --production-branch=main

# Rep Battle
cd "..\..\rep battle"
npx wrangler pages project create rastacamp-rep-battle --production-branch=master
```

---

## Step 5 — Deploy + custom domains

GitHub Actions (after secrets updated) deploy to **Leerie account** projects:

- `rastacamp-myair` → **myair.rastacamp.com**
- `rastacamp-rep-battle` → **repbattle.rastacamp.com**

In dashboard (Leerie account):

**Workers & Pages** → project → **Custom domains** → **Set up a custom domain** → `appname.rastacamp.com`

Cloudflare will create DNS automatically (same account as zone). **Do not** manually add CNAME to `*.pages.dev`.

---

## Step 6 — Verify

```powershell
curl.exe https://myair.rastacamp.com/api/health
curl.exe -I https://repbattle.rastacamp.com/
nslookup myair.rastacamp.com
```

Each subdomain must resolve and return HTTP 200.

---

## Step 7 — Retire Djudo82 Pages (after Leerie works)

Only after Leerie URLs are verified:

- Djudo82 account → Workers & Pages → delete test projects `myair`, `rep-battle` (optional)
- Revoke djudo82 **User** token `rastacamp-pages-deploy`

**Do not delete** tunnel DNS on `rastacamp.com` until each tunnel app is migrated to Pages.

---

## DNS — do not touch manually

| OK | Not OK |
|----|--------|
| Custom domain via Pages UI (same account) | Manual CNAME → `myair.pages.dev` |
| Tunnel CNAMEs (legacy, until migrated) | Proxied cross-account CNAME (error 1014) |

---

## Give djudo82/Cursor the Leerie token

Once Step 2 is done, send the token (secure channel) and say **migrate to Leerie account** — we run Steps 4–6 and verify URLs.
