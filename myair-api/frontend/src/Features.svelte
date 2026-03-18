<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>One query. Multiple environmental layers. Clearer decisions.</h1>
  <p class="hero">{info.description ?? "Query by coordinates to receive AQI, radiation context, toxic release intelligence, optional water context, and a unified Environmental Risk Score."}</p>

  <section>
    <h2>What makes it new</h2>
    <ul>
      <li><strong>Single-coord query for all hazards</strong> — One <code>lat</code>/<code>lng</code> request returns every layer you request; no stitching across agencies.</li>
      <li><strong>Composite Environmental Risk Score</strong> — A single 0–100 score and risk label that doesn't exist elsewhere; today people visit AirNow, RadNet, TRI, and others separately.</li>
      <li><strong>Plain-English alert summaries</strong> — Consumer-ready sentences (e.g. "Air quality is elevated for sensitive groups; industrial risk nearby increases caution") for in-app copy and notifications.</li>
      <li><strong>Historical trend endpoint</strong> — Optional time-window data for charts and "how it changed" context.</li>
      <li><strong>Asthma and health-risk context</strong> — AQI and sensitive-group guidance built in so health and family apps can tailor messaging.</li>
    </ul>
  </section>
  <section>
    <h2>Primary data sources</h2>
    <p>We normalize and merge: <strong>EPA AirNow API</strong> (AQI), <strong>EPA RadNet</strong> (radiation monitoring), <strong>CAMS ECMWF</strong> (chemical air forecasts), <strong>National Toxic T-Map</strong> (industrial releases), and <strong>USGS Water Quality</strong> where relevant. You get one response; we handle source availability and fallbacks.</p>
  </section>
  <section>
    <h2>Core features</h2>
    <ul>
      <li>Single coordinate query across AQI, radiation, toxics, and optional water — choose layers via the <code>layers</code> parameter.</li>
      <li>Unified Environmental Risk Score and risk label for dashboards, comparisons, and alerts.</li>
      <li>Built for web and mobile: JSON responses, CORS-friendly, easy to cache by location.</li>
      <li>Pay-per-call option for mobile and indie devs who prefer no monthly commitment.</li>
    </ul>
  </section>
  <section>
    <h2>Extended capabilities</h2>
    <ul>
      <li>Per-layer component data (AQI value and label, radiation status, nearby toxic facilities count and score) so you can build custom UIs.</li>
      <li>Optional water-quality enrichment where data is available — same coordinate, one call.</li>
      <li>Source status in the response so you can show "AQI: live; CAMS: pending" in your UI.</li>
      <li>API key management, usage tracking, and rate limits per plan.</li>
      <li>Documentation with example requests, response shapes, and error codes.</li>
    </ul>
  </section>
  <section class="use-cases">
    <h2>Use cases</h2>
    <div class="cards">
      <div class="card"><h3>Real estate</h3><p>Show buyers and renters air quality, radiation context, and industrial proximity in one card — no need to link out to four government sites.</p></div>
      <div class="card"><h3>Smart home</h3><p>Trigger "close windows" or "limit outdoor time" automations when AQI or risk score crosses a threshold.</p></div>
      <div class="card"><h3>Health &amp; fitness</h3><p>Adjust run routes, asthma alerts, or exposure guidance by location; use the plain-English summary for in-app messaging.</p></div>
      <div class="card"><h3>Parent / family apps</h3><p>Give families and sensitive groups one clear picture of outdoor conditions without regulatory jargon.</p></div>
      <div class="card"><h3>Outdoor / camping / travel</h3><p>Surface environmental context before users head outside — one API call per destination or waypoint.</p></div>
      <div class="card"><h3>Mobile developers</h3><p>Add environmental intelligence without maintaining AirNow, RadNet, CAMS, and TRI integrations yourself.</p></div>
    </div>
  </section>

  <p class="cta"><a href="#/pricing">See pricing</a> · <a href="#/api">Sell the API</a> · <a href="#/contact">Book a demo</a> · <a href="#/login">Sign in</a></p>
</div>
<style>
  .page { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .page h1 { font-size: 1.5rem; color: #0F172A; margin-bottom: 0.5rem; }
  .hero { font-size: 1.05rem; color: #334155; margin-bottom: 2rem; line-height: 1.6; }
  .page section { margin-bottom: 2rem; }
  .page section h2 { font-size: 1.15rem; color: #0F172A; margin-bottom: 0.75rem; }
  .page ul { padding-left: 1.5rem; }
  .page li { margin-bottom: 0.4rem; line-height: 1.5; color: #334155; }
  .use-cases .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 1rem; margin-top: 0.5rem; }
  .card { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1rem; }
  .card h3 { font-size: 1rem; margin: 0 0 0.35rem 0; color: #2563EB; }
  .card p { font-size: 0.9rem; margin: 0; color: #64748B; line-height: 1.4; }
  .cta { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; font-size: 0.95rem; }
  .page a { color: #2563EB; text-decoration: none; }
  .page a:hover { text-decoration: underline; }
</style>
