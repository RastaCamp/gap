<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>API Docs</h1>
  <p class="hero">Grid health and solar risk in one response. We combine EIA Open API, PowerOutage.us, NOAA SWPC Geoelectric, DOE Energy Alerts, and NERC reliability data. Outage count, demand stress, state/county/ISO level; webhook threshold alerts and historical reliability on higher plans.</p>

  <section>
    <h2>Grid by state</h2>
    <p>Get current grid health by state or ISO region. Use <code>include</code> to request only the layers you need.</p>
    <pre class="code">GET /grid?state=MD&include=outages,demand,solar_risk,alerts</pre>
    <h3>Parameters</h3>
    <ul class="params">
      <li><code>state</code> (e.g. MD, CA) or <code>region</code> (ISO code) — Required.</li>
      <li><code>include</code> (optional) — Comma-separated: <code>outages</code>, <code>demand</code>, <code>solar_risk</code>, <code>alerts</code>. Default: all.</li>
    </ul>
    <p>Current backend may expose <code>/api/readings</code>; product shape below is the target API. Auth: <code>Authorization: Bearer &lt;key&gt;</code> or <code>api_key</code>. Errors: <code>400</code> invalid state/region, <code>401</code> invalid key, <code>429</code> rate limit, <code>503</code> upstream.</p>
  </section>

  <section>
    <h2>Response shape</h2>
    <pre class="code">{`{
  "state": "MD",
  "outages": { "count": 1200, "trend": "stable" },
  "demand": { "current_mw": 133420, "stress": "Elevated" },
  "solar_risk": "Moderate",
  "alerts": [],
  "grid_health_label": "Stable"
}`}</pre>
    <p>Grid health + solar risk in one response · Outage count + demand stress · State/county/ISO level · Webhook for threshold alerts.</p>
  </section>

  <section>
    <h2>Live API</h2>
    <p>Browse the running API:</p>
    <p><a href="/api" target="_blank" rel="noopener">GET /api</a> · <a href="/api/readings" target="_blank" rel="noopener">GET /api/readings</a> · <a href="/api/health" target="_blank" rel="noopener">GET /api/health</a></p>
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
