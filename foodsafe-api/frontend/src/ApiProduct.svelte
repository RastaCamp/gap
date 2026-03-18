<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="product">
  <h1>Sell the API</h1>
  <p class="subtitle">{info.name ?? "FoodSafe"} API — programmatic access to FDA, USDA, CDC, and FoodSafety.gov recalls. One integration, one schema.</p>

  <section><h2>Features</h2><ul>
    <li>Single REST API for all major U.S. food recall sources</li>
    <li>Full-text search, filters by source, status, classification</li>
    <li>Stable schema and regular syncs — we handle upstream changes</li>
    <li>Usage-based plans and rate limits; free tier to get started</li>
  </ul></section>

  <section><h2>Getting started</h2><ol>
    <li><strong>Sign up</strong> — create an account and choose a plan (free tier available).</li>
    <li><strong>Get your API key</strong> — from the dashboard after login; use it in the <code>Authorization</code> header or as a query parameter.</li>
    <li><strong>Call the API</strong> — e.g. <code>GET /api/recalls?q=...</code> for recalls; see the <a href="/api" target="_blank" rel="noopener">API root</a> for full docs and sample responses.</li>
  </ol></section>

  <section><h2>Pricing</h2><p>Free: 1,000 requests/month. Pro: $49/mo with higher limits. Enterprise: custom volume and SLA. <a href="#/pricing">View full pricing</a>.</p></section>

  <p class="cta"><a href="#/login">Sign in or sign up</a> · <a href="#/pricing">Pricing</a> · <a href="#/service">Or buy the managed service</a></p>
</div>
<style>
  .product { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; }
  .subtitle { font-size: 1.1rem; color: #555; margin-bottom: 1.5rem; line-height: 1.5; }
  .product section { margin-bottom: 1.75rem; }
  .product h2 { font-size: 1.1rem; margin-bottom: 0.5rem; }
  .product ul, .product ol { padding-left: 1.5rem; margin: 0.5rem 0 0 0; }
  .product li { margin-bottom: 0.35rem; line-height: 1.45; }
  .product code { background: #f0f0f0; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.9em; }
  .cta { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.95rem; }
  .product a { color: #0a7ea4; }
</style>
