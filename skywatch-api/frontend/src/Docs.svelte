<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>API Docs</h1>
  <p class="hero">One endpoint for solar activity, moon phase, satellite passes, and aurora probability. We aggregate NOAA SWPC, N2YO, Moon Giant, Heavens Above, and SpaceWeather.com. All sky events in one response with a plain-language <code>sky_summary</code> field.</p>

  <section>
    <h2>Sky endpoint</h2>
    <p>Get "tonight's sky" digest by location. Use <code>include</code> to request only the layers you need.</p>
    <pre class="code">GET /sky?lat=39.28&lng=-76.6&include=solar,moon,satellites,aurora</pre>
    <h3>Parameters</h3>
    <ul class="params">
      <li><code>lat</code>, <code>lng</code> (required) — Observation location.</li>
      <li><code>include</code> (optional) — Comma-separated: <code>solar</code>, <code>moon</code>, <code>satellites</code>, <code>aurora</code>. Default: all.</li>
    </ul>
    <p>Current backend may expose <code>/api/observations</code>; product shape above is the target API. Use <code>Authorization: Bearer YOUR_API_KEY</code> or <code>api_key</code> query param. <code>400</code> invalid params, <code>401</code> invalid key, <code>429</code> rate limit, <code>503</code> upstream.</p>
  </section>

  <section>
    <h2>Response shape</h2>
    <pre class="code">{`{
  "solar": { "flare_level": "M2", "geomagnetic_kp": 6, "grid_disruption_risk": "Low" },
  "moon": { "phase": "Waxing Gibbous", "illumination": 0.72 },
  "satellites": { "ISS_next_pass": "2025-03-15T22:14:00Z", "flare_times": [] },
  "aurora_probability": 42,
  "sky_summary": "Clear viewing tonight; moderate aurora chance; ISS pass at 22:14."
}`}</pre>
    <p>All sky events in one response · Aurora probability by coords · Plain-language sky summary.</p>
  </section>

  <section>
    <h2>Live API</h2>
    <p>Browse the running API:</p>
    <p><a href="/api" target="_blank" rel="noopener">GET /api</a> · <a href="/api/observations" target="_blank" rel="noopener">GET /api/observations</a> · <a href="/api/health" target="_blank" rel="noopener">GET /api/health</a></p>
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
