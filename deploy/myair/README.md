# MyAir on Cloudflare Pages

Hosts **https://myair.rastacamp.com** with:

- **Frontend**: Svelte/Vite build from `myair-api/frontend`
- **API**: Pages Functions (`functions/api/[[path]].ts`) + **D1** (`myair-db`)

No tunnel or PC required.

## One-time setup

1. Log in: `npx wrangler login`
2. Create D1: `npx wrangler d1 create myair-db` — paste `database_id` into `wrangler.toml`
3. Migrate: `npm run db:migrate`
4. Create Pages project (dashboard or CLI):
   ```bash
   npx wrangler pages project create myair --production-branch=main
   ```
5. Custom domain: Cloudflare dashboard → Pages → myair → Custom domains → `myair.rastacamp.com`
6. Secrets (dashboard → Settings → Environment variables):
   - `ADMIN_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (optional)
   - `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD` (optional bootstrap)

## Deploy

```bash
cd gap/deploy/myair
npm install
npm run deploy
```

## GitHub auto-deploy

Connect repo **RastaCamp/gap** in Cloudflare Pages:

| Setting | Value |
|--------|--------|
| Root directory | `deploy/myair` |
| Build command | `npm run build` |
| Build output | `dist` |
| Branch | `main` |

Functions are picked up from `functions/` at the project root automatically.
