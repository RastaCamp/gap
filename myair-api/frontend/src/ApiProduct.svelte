<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="product">
  <h1>Plug environmental intelligence directly into your app.</h1>
  <p class="subtitle">MyAir Local API gives developers a single endpoint for environmental intelligence that would normally require multiple source integrations, scoring logic, and geo-aware normalization. Use one request to retrieve AQI, radiation context, toxic release intelligence, optional water context, and a plain-English risk summary. No need to maintain EPA AirNow, RadNet, CAMS, or TRI integrations yourself.</p>

  <section>
    <h2>Example request</h2>
    <pre class="code">GET /environment?lat=39.28&lng=-76.61&layers=aqi,radiation,toxics</pre>
    <p>Send latitude, longitude, and an optional comma-separated <code>layers</code> list. Use <code>Authorization: Bearer YOUR_API_KEY</code> or <code>api_key</code> query param. <a href="#/docs" target="_blank" rel="noopener">Full API reference</a></p>
  </section>

  <section>
    <h2>Example response</h2>
    <pre class="code">{`{
  "environmental_risk_score": 61,
  "risk_label": "Elevated",
  "summary": "Air quality is elevated for sensitive groups and nearby industrial risk increases caution.",
  "components": {
    "aqi": { "value": 118, "label": "Unhealthy for Sensitive Groups" },
    "radiation": { "status": "Near baseline" },
    "toxics": { "nearby_facilities": 3, "score": 21 }
  }
}`}</pre>
    <p>The <code>summary</code> field is ready for in-app display; <code>components</code> lets you build custom cards or charts per layer.</p>
  </section>

  <section>
    <h2>Why use the API</h2>
    <ul>
      <li><strong>One integration</strong> — Replace four government data sources with a single, stable contract.</li>
      <li><strong>Clean JSON</strong> — Consistent schema, no agency-specific parsing.</li>
      <li><strong>Coordinate-based</strong> — Ideal for maps, location services, and "where I am" features.</li>
      <li><strong>Plain-English summary</strong> — Use the <code>summary</code> string directly in UI or push notifications.</li>
      <li><strong>Built for scale</strong> — Rate limits, API keys, and optional webhooks for alerts.</li>
    </ul>
  </section>

  <section>
    <h2>Getting started</h2>
    <ol>
      <li>Sign up and choose a plan (Developer $19/mo to Enterprise custom).</li>
      <li>Create an API key in the dashboard; use it in the <code>Authorization</code> header or <code>api_key</code> query parameter.</li>
      <li>Call <code>GET /environment?lat=...&lng=...&layers=...</code>; see <a href="#/docs">API Docs</a> for parameters and errors.</li>
    </ol>
  </section>

  <section>
    <h2>Pricing</h2>
    <p>From $19/month for developers (5K requests/mo) to $199/month for business (250K requests/mo), plus pay-per-call for mobile devs. <a href="#/pricing">View full pricing</a>.</p>
  </section>

  <p class="cta"><a href="#/login">Start testing</a> · <a href="#/docs">View API docs</a> · <a href="#/pricing">Pricing</a> · <a href="#/service">Or use MyAir Local Console</a></p>
</div>
<style>
  .product { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .product h1 { font-size: 1.5rem; color: #0F172A; margin-bottom: 0.5rem; }
  .subtitle { font-size: 1.05rem; color: #334155; margin-bottom: 1.5rem; line-height: 1.6; }
  .product section { margin-bottom: 1.75rem; }
  .product h2 { font-size: 1.1rem; color: #0F172A; margin-bottom: 0.5rem; }
  .code { background: #0F172A; color: #E0F2FE; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.85rem; }
  .product ul, .product ol { padding-left: 1.5rem; color: #334155; }
  .product li { margin-bottom: 0.35rem; }
  .product ol li { margin-bottom: 0.5rem; }
  .cta { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; font-size: 0.95rem; }
  .product a { color: #2563EB; }
</style>
