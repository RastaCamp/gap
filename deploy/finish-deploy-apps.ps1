# Deploy all GAP products to Cloudflare Pages (Djudo82 + Leerie DNS)

Requires: `npx wrangler login` as djudo82@gmail.com

```powershell
$ErrorActionPreference = "Stop"
$env:CLOUDFLARE_ACCOUNT_ID = "5cc38e7e9de459dac0187eb7ddf3063c"
$root = "C:\Users\mxz\Desktop\projects\gap\deploy"
$apps = @(
  "myair", "gridstatus", "foodsafe", "watersafe", "biosurge",
  "skywatch", "newssignal", "neighborhoodscore", "groundtruth"
)

foreach ($app in $apps) {
  Write-Host "`n=== $app ===" -ForegroundColor Cyan
  Set-Location (Join-Path $root $app)
  if (-not (Test-Path "node_modules")) { npm install }
  $proj = npx wrangler pages project list --json 2>$null | ConvertFrom-Json
  if (-not ($proj | Where-Object { $_.'Project Name' -eq $app })) {
    npx wrangler pages project create $app --production-branch=main
  }
  npm run db:migrate 2>$null
  npm run deploy
  $domain = "$app.rastacamp.com"
  Write-Host "Attach custom domain: $domain (Pages dashboard or API)"
}

Write-Host "`nDone. Add any missing CNAMEs in Leerie DNS or run:"
Write-Host "  gh workflow run add-rastacamp-dns.yml -R RastaCamp/gap"
Write-Host "  (update workflow targets if project uses *-7jp.pages.dev suffix)"
