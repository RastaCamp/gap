<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>API Docs</h1>
  <p class="hero">One endpoint for earthquake clusters, volcanic unrest, tsunami warnings, and disaster feeds. We aggregate USGS, IRIS, VAAC, RSOE-EDIS, and Global Incident Map; responses include infrastructure proximity score, aftershock probability, and a unified event schema.</p>

  <section>
    <h2>Events endpoint</h2>
    <p>Get seismic and volcanic events for a location and radius. Filter by minimum magnitude to reduce noise.</p>
    <pre class="code">GET /events?lat=34.05&lng=-118.2&radius_km=500&min_mag=2.5</pre>
    <h3>Parameters</h3>
    <ul class="params">
      <li><code>lat</code>, <code>lng</code> (required) — Center of the search area.</li>
      <li><code>radius_km</code> (optional) — Search radius in kilometers; default depends on plan.</li>
      <li><code>min_mag</code> (optional) — Minimum magnitude (e.g. 2.5) to include earthquakes.</li>
    </ul>
    <p class="example">Example: <code>curl -H "Authorization: Bearer YOUR_API_KEY" "https://api.example.com/events?lat=34.05&lng=-118.2&radius_km=500&min_mag=2.5"</code></p>
  </section>

  <section>
    <h2>Response shape</h2>
    <p>Each event can include <code>infrastructure_proximity_score</code> and <code>aftershock_probability</code>; <code>volcano_activity</code> and <code>tsunami_alert</code> give a combined view. Webhook alerts are available per polygon on higher plans.</p>
    <pre class="code">{`{
  "events": [
    { "type": "earthquake", "magnitude": 5.1, "depth_km": 12, "location": "Alaska", "time": "2025-03-15T01:12:00Z", "infrastructure_proximity_score": 0.2, "aftershock_probability": 0.15 }
  ],
  "volcano_activity": [],
  "tsunami_alert": false,
  "unified_event_schema": true
}`}</pre>
  </section>

  <section>
    <h2>Authentication &amp; errors</h2>
    <p>Use <code>Authorization: Bearer &lt;key&gt;</code> or <code>api_key</code> query parameter. <code>400</code> — invalid lat/lng or params. <code>401</code> — invalid key. <code>429</code> — rate limit. <code>503</code> — upstream or maintenance.</p>
  </section>

  <section>
    <h2>Live API</h2>
    <p>Browse the running API:</p>
    <p><a href="/api" target="_blank" rel="noopener">GET /api</a> · <a href="/api/events" target="_blank" rel="noopener">GET /api/events</a> · <a href="/api/health" target="_blank" rel="noopener">GET /api/health</a></p>
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
  .example { font-size: 0.95rem; color: #475569; margin: 0.5rem 0; word-break: break-all; }
  .code { background: #1a3a5c; color: #E0F2FE; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.85rem; }
  .cta { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; }
  .page a { color: #0a7ea4; }
  .page code { background: #E2E8F0; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.9em; }
</style>
