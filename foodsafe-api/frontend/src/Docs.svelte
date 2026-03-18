<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>API Docs</h1>
  <p class="hero">Unified food safety recall data from FDA, USDA, CDC, and FoodSafety.gov in one API.</p>

  <section>
    <h2>Recalls endpoint</h2>
    <p>List or filter recalls:</p>
    <pre class="code">GET /api/recalls</pre>
    <p>Optional query params: <code>source</code> (fda, usda, cdc), <code>limit</code>, <code>offset</code>, <code>since</code> (ISO date).</p>
  </section>

  <section>
    <h2>Response shape</h2>
    <pre class="code">{`{
  "recalls": [
    {
      "id": "...",
      "source": "fda",
      "title": "Undeclared allergen",
      "product": "...",
      "recall_date": "2024-03-01",
      "url": "https://..."
    }
  ],
  "total": 42
}`}</pre>
  </section>

  <section>
    <h2>Live API</h2>
    <p>Browse the running API:</p>
    <p><a href="/api" target="_blank" rel="noopener">GET /api</a> · <a href="/api/recalls" target="_blank" rel="noopener">GET /api/recalls</a> · <a href="/api/health" target="_blank" rel="noopener">GET /api/health</a></p>
  </section>

  <p class="cta"><a href="#/api">Sell the API</a> · <a href="#/pricing">Pricing</a> · <a href="#/login">Sign in</a></p>
</div>
<style>
  .page { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .page h1 { font-size: 1.5rem; color: #0d3b2e; margin-bottom: 0.5rem; }
  .hero { font-size: 1.05rem; color: #334155; margin-bottom: 2rem; }
  .page section { margin-bottom: 1.75rem; }
  .page h2 { font-size: 1.1rem; color: #0d3b2e; margin-bottom: 0.5rem; }
  .code { background: #0d3b2e; color: #E0F2FE; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.85rem; }
  .cta { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; }
  .page a { color: #0a7ea4; }
  .page code { background: #E2E8F0; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.9em; }
</style>
