# First-time Cloudflare setup (required once)

Wrangler is **not logged in** on this machine yet. Complete these steps to go live.

## 1. Create API token

Cloudflare dashboard → **My Profile** → **API Tokens** → Create token:

- Template: **Edit Cloudflare Workers**
- Also enable: **Account** → **Cloudflare Pages** → Edit, **D1** → Edit

Save the token. Do not commit it.

## 2. Authenticate locally

```powershell
$env:CLOUDFLARE_API_TOKEN = "YOUR_TOKEN"
$env:CLOUDFLARE_ACCOUNT_ID = "0f42c247e489dce80771116c30c57c3e"
cd C:\Users\mxz\Desktop\projects\gap\deploy\myair
npx wrangler whoami
```

## 3. GitHub Actions secrets (auto-deploy on push)

For **RastaCamp/gap** and **RastaCamp/rep-battle**:

| Secret | Value |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | your token |
| `CLOUDFLARE_ACCOUNT_ID` | `0f42c247e489dce80771116c30c57c3e` |

```powershell
gh secret set CLOUDFLARE_API_TOKEN -R RastaCamp/gap -b "YOUR_TOKEN"
gh secret set CLOUDFLARE_ACCOUNT_ID -R RastaCamp/gap -b "0f42c247e489dce80771116c30c57c3e"
gh secret set CLOUDFLARE_API_TOKEN -R RastaCamp/rep-battle -b "YOUR_TOKEN"
gh secret set CLOUDFLARE_ACCOUNT_ID -R RastaCamp/rep-battle -b "0f42c247e489dce80771116c30c57c3e"
```

## 4. MyAir — D1 + Pages

```powershell
cd C:\Users\mxz\Desktop\projects\gap\deploy\myair
npx wrangler d1 create myair-db
# Copy database_id into wrangler.toml (replace REPLACE_AFTER_D1_CREATE)
npm run db:migrate
npx wrangler pages project create myair --production-branch=main
npm run deploy
```

Pages → **myair** → Custom domains → **myair.rastacamp.com**

Set production secrets: `ADMIN_TOKEN`, optional Stripe keys.

## 5. Rep Battle — Pages

```powershell
cd "C:\Users\mxz\Desktop\projects\rep battle"
npm install
npm run deploy
```

Pages → **rep-battle** → Custom domains → **repbattle.rastacamp.com**

## 6. Verify

```powershell
curl.exe https://myair.rastacamp.com/api/health
curl.exe -I https://repbattle.rastacamp.com/
```

Expected: JSON `{"status":"ok",...}` and HTTP 200 for the game.
