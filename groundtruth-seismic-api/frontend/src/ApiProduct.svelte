<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="product">
  <h1>Sell the API</h1>
  <p class="subtitle">GroundTruth Seismic API aggregates earthquake activity, volcanic alerts, tsunami threats, and global disaster feeds into a unified geophysical risk feed. Query one endpoint for earthquake clusters, volcanic unrest, and tsunami warnings. No need to poll USGS, IRIS, VAAC, and incident feeds separately — we normalize and enrich with infrastructure proximity and aftershock probability.</p>
  <section><h2>Example request</h2><p>Events by location, radius, and minimum magnitude. Use <code>Authorization: Bearer YOUR_API_KEY</code> or <code>api_key</code> query param.</p><pre class="code">GET /events?lat=34.05&lng=-118.2&radius_km=500&min_mag=2.5</pre></section>
  <section><h2>Example response</h2><pre class="code">{`{
  "events": [
    { "type": "earthquake", "magnitude": 5.1, "depth_km": 12, "location": "Alaska", "time": "2025-03-15T01:12:00Z", "infrastructure_proximity_score": 0.2, "aftershock_probability": 0.15 }
  ],
  "volcano_activity": [],
  "tsunami_alert": false,
  "unified_event_schema": true
}`}</pre><p>Use <code>infrastructure_proximity_score</code> and <code>aftershock_probability</code> for risk dashboards; webhook alerts per polygon on Growth and above.</p></section>
  <section><h2>Why use the API</h2><ul>
    <li><strong>One integration</strong> — Replace USGS + IRIS + VAAC + disaster feeds with a single contract.</li>
    <li><strong>Unified schema</strong> — Consistent event shape; volcanic and seismic in one timeline.</li>
    <li><strong>Enriched context</strong> — Infrastructure proximity and aftershock probability per event.</li>
    <li><strong>B2B-ready</strong> — $49–$499/mo; insurance and utility contracts anchor revenue.</li>
  </ul></section>
  <section><h2>Getting started</h2><ol>
    <li>Sign up and choose a plan (Developer $49/mo to Enterprise custom).</li>
    <li>Create an API key in the dashboard; use it in the <code>Authorization</code> header or <code>api_key</code> query parameter.</li>
    <li>Call <code>GET /events?lat=...&lng=...&radius_km=...&min_mag=...</code>; see <a href="#/docs">API Docs</a> for full parameters and errors.</li>
  </ol></section>
  <section><h2>Pricing</h2><p>$49–$499/mo API plans; B2B focus. <a href="#/pricing">View full pricing</a>.</p></section>
  <p class="cta"><a href="#/login">Sign in or sign up</a> · <a href="#/pricing">Pricing</a> · <a href="#/service">Or buy the managed service</a></p>
</div>
<style>.product{max-width:42rem;margin:2rem auto;padding:1.5rem;}.subtitle{font-size:1.1rem;color:#555;margin-bottom:1.5rem;line-height:1.5;}.product section{margin-bottom:1.75rem;}.product h2{font-size:1.1rem;margin-bottom:0.5rem;}.product ul,.product ol{padding-left:1.5rem;margin:0.5rem 0 0 0;}.product li{margin-bottom:0.35rem;line-height:1.45;}.product code{background:#f0f0f0;padding:0.1rem 0.35rem;border-radius:3px;font-size:0.9em;}.product pre.code{background:#1a3a5c;color:#E0F2FE;padding:1rem;border-radius:6px;overflow-x:auto;font-size:0.85rem;}.cta{margin-top:1.5rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.95rem;}.product a{color:#0a7ea4;}</style>
