<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>API Docs</h1>
  <p class="hero">ZIP → contaminant list, health risk per chemical, violation timeline, filter recommendation, and comparison vs. national avg in one call. We merge EWG Tap Water DB, EPA SDWIS, USGS National Water Dashboard, and state MDE reports.</p>

  <section>
    <h2>Water by ZIP</h2>
    <p>Get contaminants, risk score, and violations. Use <code>return</code> to request only the fields you need.</p>
    <pre class="code">GET /water?zip=21201&return=contaminants,risk_score,violations</pre>
    <h3>Parameters</h3>
    <ul class="params">
      <li><code>zip</code> (required) — U.S. ZIP code.</li>
      <li><code>return</code> (optional) — Comma-separated: <code>contaminants</code>, <code>risk_score</code>, <code>violations</code>, <code>filter_recommendation</code>, <code>vs_national_avg</code>. Default: all.</li>
    </ul>
    <p>Current backend may expose <code>/api/reports</code>; product shape below is the target API. Auth: <code>Authorization: Bearer &lt;key&gt;</code> or <code>api_key</code>. Errors: <code>400</code> invalid zip, <code>401</code> invalid key, <code>429</code> rate limit, <code>503</code> upstream.</p>
  </section>

  <section>
    <h2>Response shape</h2>
    <pre class="code">{`{
  "zip": "21201",
  "risk_score": 48,
  "contaminants": [{ "name": "lead", "health_risk": "High", "level_vs_national_avg": "above" }],
  "violations": [],
  "violation_timeline_available": true,
  "filter_recommendation": "Consider NSF 53 certified for lead.",
  "vs_national_avg": "slightly_above"
}`}</pre>
    <p>ZIP → contaminant list in one call · Health risk per chemical · Violation timeline · Filter recommendation · Comparison vs national avg.</p>
  </section>

  <section>
    <h2>Live API</h2>
    <p>Browse the running API:</p>
    <p><a href="/api" target="_blank" rel="noopener">GET /api</a> · <a href="/api/reports" target="_blank" rel="noopener">GET /api/reports</a> · <a href="/api/health" target="_blank" rel="noopener">GET /api/health</a></p>
  </section>

  <p class="cta"><a href="#/api">Sell the API</a> · <a href="#/pricing">Pricing</a> · <a href="#/login">Sign in</a></p>
</div>
<style>
  .page { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .page h1 { font-size: 1.5rem; color: #1a3a5c; margin-bottom: 0.5rem; }
  .hero { font-size: 1.05rem; color: #334155; margin-bottom: 2rem; }
  .page section { margin-bottom: 1.75rem; }
  .page h2 { font-size: 1.1rem; color: #1a3a5c; margin-bottom: 0.5rem; }
  .page h3 { font-size: 1rem; color: #334155; margin: 0.75rem 0 0.35rem 0; }
  .params { padding-left: 1.5rem; margin: 0.5rem 0; }
  .params li { margin-bottom: 0.35rem; color: #334155; }
  .code { background: #1a3a5c; color: #E0F2FE; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.85rem; }
  .cta { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; }
  .page a { color: #0a7ea4; }
  .page code { background: #E2E8F0; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.9em; }
</style>
