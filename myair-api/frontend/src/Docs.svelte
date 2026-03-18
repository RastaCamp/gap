<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>API Docs</h1>
  <p class="hero">Query by coordinates to receive AQI, radiation context, toxic release intelligence, optional water context, and a unified Environmental Risk Score. One request, one response — we aggregate and normalize data from EPA AirNow, RadNet, CAMS, National Toxic T-Map, and USGS.</p>

  <section>
    <h2>Environment endpoint</h2>
    <p>Get environmental intelligence for any latitude/longitude. Specify which layers you need; omit <code>layers</code> to receive all available layers.</p>
    <pre class="code">GET /environment?lat=39.28&lng=-76.61&layers=aqi,radiation,toxics</pre>
    <h3>Parameters</h3>
    <ul class="params">
      <li><code>lat</code> (required) — Latitude, e.g. 39.28.</li>
      <li><code>lng</code> (required) — Longitude, e.g. -76.61.</li>
      <li><code>layers</code> (optional) — Comma-separated list: <code>aqi</code>, <code>radiation</code>, <code>toxics</code>, <code>water</code>. Default: all enabled layers.</li>
    </ul>
    <p class="example">Example with cURL (replace <code>YOUR_API_KEY</code>):</p>
    <pre class="code">curl -H "Authorization: Bearer YOUR_API_KEY" "https://api.example.com/environment?lat=39.28&lng=-76.61&layers=aqi,radiation,toxics"</pre>
  </section>

  <section>
    <h2>Response shape</h2>
    <p>Every response includes <code>environmental_risk_score</code> (0–100), <code>risk_label</code>, and a <code>summary</code> string suitable for display. Component data depends on requested layers.</p>
    <pre class="code">{`{
  "lat": 39.28,
  "lng": -76.61,
  "layers": ["aqi", "radiation", "toxics"],
  "environmental_risk_score": 61,
  "risk_label": "Elevated",
  "summary": "Air quality is elevated for sensitive groups and industrial risk nearby increases caution.",
  "components": {
    "aqi": {"value": 118, "label": "Unhealthy for Sensitive Groups"},
    "radiation": {"status": "Near baseline", "score": 8},
    "toxics": {"nearby_facilities": 3, "score": 21}
  },
  "source_status": { "airnow": "ok", "radnet": "ok", "cams": "pending", "toxics": "ok" }
}`}</pre>
  </section>

  <section>
    <h2>Authentication &amp; rate limits</h2>
    <p>Pass your API key in the <code>Authorization: Bearer &lt;key&gt;</code> header or as <code>api_key</code> query parameter. Rate limits depend on your plan; responses include <code>X-RateLimit-Remaining</code> when applicable. See <a href="#/pricing">Pricing</a> for request quotas.</p>
  </section>

  <section>
    <h2>Errors</h2>
    <p><code>400</code> — Missing or invalid <code>lat</code>/<code>lng</code>. <code>401</code> — Invalid or missing API key. <code>429</code> — Rate limit exceeded. <code>503</code> — Temporary upstream or maintenance; retry with backoff.</p>
  </section>

  <section>
    <h2>Live API</h2>
    <p>Browse the running API root and endpoints:</p>
    <p><a href="/api" target="_blank" rel="noopener">GET /api</a> · <a href="/api/readings" target="_blank" rel="noopener">GET /api/readings</a> · <a href="/api/health" target="_blank" rel="noopener">GET /api/health</a></p>
  </section>

  <p class="cta"><a href="#/api">Sell the API</a> · <a href="#/pricing">Pricing</a> · <a href="#/login">Sign in</a></p>
</div>
<style>
  .page { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .page h1 { font-size: 1.5rem; color: #0F172A; margin-bottom: 0.5rem; }
  .hero { font-size: 1.05rem; color: #334155; margin-bottom: 2rem; }
  .page section { margin-bottom: 1.75rem; }
  .page h2 { font-size: 1.1rem; color: #0F172A; margin-bottom: 0.5rem; }
  .page h3 { font-size: 1rem; color: #334155; margin: 0.75rem 0 0.35rem 0; }
  .code { background: #0F172A; color: #E0F2FE; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.85rem; }
  .params { padding-left: 1.5rem; margin: 0.5rem 0; }
  .params li { margin-bottom: 0.35rem; color: #334155; }
  .example { font-size: 0.95rem; color: #475569; margin-bottom: 0.35rem; }
  .cta { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; }
  .page a { color: #2563EB; }
  .page code { background: #E2E8F0; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.9em; }
</style>
