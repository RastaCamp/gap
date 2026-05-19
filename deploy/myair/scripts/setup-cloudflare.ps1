# Run once interactively after: npx wrangler login
# Account: 0f42c247e489dce80771116c30c57c3e

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Creating D1 database myair-db (skip if exists)..."
npx wrangler d1 create myair-db

Write-Host ""
Write-Host "Paste the database_id into wrangler.toml, then run:"
Write-Host "  npm run db:migrate"
Write-Host "  npx wrangler pages project create myair --production-branch=main"
Write-Host "  npm run deploy"
Write-Host ""
Write-Host "Add custom domain myair.rastacamp.com in Cloudflare Pages dashboard."
