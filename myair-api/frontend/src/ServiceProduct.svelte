<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="product">
  <h1>Use the API directly, or work through a hosted console.</h1>
  <p class="subtitle"><strong>MyAir Local Console</strong> — a hosted dashboard and client portal built on top of MyAir Local API. For teams that want to query, share, and explain environmental risk without building their own UI.</p>

  <section>
    <h2>What you get</h2>
    <ul>
      <li><strong>Live environmental query dashboard</strong> — Enter any address or lat/lng; see the composite risk score, layer breakdown, and plain-English summary in one view.</li>
      <li><strong>Saved locations</strong> — Save home, office, or client sites and refresh on demand or on a schedule.</li>
      <li><strong>Account and API key management</strong> — Create and revoke keys, assign labels, and view usage per key.</li>
      <li><strong>Usage visibility</strong> — Request counts, rate limit status, and optional export for billing or compliance.</li>
      <li><strong>Human-readable summaries</strong> — Every result shows the same summary string your API returns, so you can demo and train stakeholders.</li>
      <li><strong>Source health</strong> — See which upstream sources (AirNow, RadNet, CAMS, etc.) are live or delayed.</li>
      <li><strong>Future alerts and reporting</strong> — Roadmap: threshold alerts, scheduled reports, and optional white-label for resellers.</li>
    </ul>
  </section>

  <section>
    <h2>How it works</h2>
    <ol>
      <li>Sign up and choose a Console plan (Starter, Team, or Enterprise).</li>
      <li>Log in to the hosted dashboard; add saved locations and invite team members if on Team/Enterprise.</li>
      <li>Query any location on demand; use the same API keys for your own integrations. We host and maintain the UI; you get a link to share with clients or internal users.</li>
    </ol>
  </section>

  <section>
    <h2>Pricing</h2>
    <p>Console plans are separate from API-only plans. Starter (dashboard + basic alerts), Team (multi-user, branded dashboard), Enterprise (SLA, custom branding, dedicated success). <a href="#/pricing">View full pricing</a>.</p>
  </section>

  <p class="cta"><a href="#/login">Sign in</a> · <a href="#/pricing">Pricing</a> · <a href="#/contact">Book a demo</a> · <a href="#/api">Or buy the API</a></p>
</div>
<style>
  .product { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .product h1 { font-size: 1.5rem; color: #0F172A; margin-bottom: 0.5rem; }
  .subtitle { font-size: 1.05rem; color: #334155; margin-bottom: 1.5rem; }
  .product section { margin-bottom: 1.75rem; }
  .product h2 { font-size: 1.1rem; color: #0F172A; margin-bottom: 0.5rem; }
  .product ul, .product ol { padding-left: 1.5rem; color: #334155; }
  .product li { margin-bottom: 0.35rem; }
  .product ol li { margin-bottom: 0.5rem; }
  .cta { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; font-size: 0.95rem; }
  .product a { color: #2563EB; }
</style>
