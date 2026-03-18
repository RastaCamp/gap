<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="product">
  <h1>Sell the Service</h1>
  <p class="subtitle">Event Monitor — a turnkey service built on the {info.name ?? "GroundTruth Seismic"} API: seismic alerts, dashboards, and reports. We run it; you use it. Ideal for teams that need visibility and alerts without building their own integration.</p>
  <section><h2>What you get</h2><ul>
    <li><strong>Alerts</strong> — Notifications when significant seismic or volcanic events occur in your configured regions or polygons.</li>
    <li><strong>Branded dashboard</strong> — Event timeline, magnitude filters, and volcano/tsunami status; Team and Enterprise get custom branding.</li>
    <li><strong>Weekly summaries</strong> — Optional digest of activity by region; compliance-friendly reporting on request.</li>
    <li><strong>No integration work</strong> — We configure regions, thresholds, and notification channels; you get a link and alerts.</li>
  </ul></section>
  <section><h2>How it works</h2><ol>
    <li>Tell us your regions, magnitude thresholds, and how you want to be notified (email, webhook, or both).</li>
    <li>We configure and deploy your Event Monitor instance using our API and pipelines.</li>
    <li>You get a dashboard link and alerts; we handle data updates, source health, and maintenance.</li>
  </ol></section>
  <section><h2>Pricing</h2><p>Starter $99/mo (alerts + basic dashboard). Team $299/mo (multi-user, branded dashboard). Enterprise custom (SLA, dedicated success). <a href="#/pricing">View full pricing</a>.</p></section>
  <p class="cta"><a href="#/login">Sign in or sign up</a> · <a href="#/pricing">Pricing</a> · <a href="#/api">Or buy the API</a></p>
</div>
<style>.product{max-width:42rem;margin:2rem auto;padding:1.5rem;}.subtitle{font-size:1.1rem;color:#555;margin-bottom:1.5rem;line-height:1.5;}.product section{margin-bottom:1.75rem;}.product h2{font-size:1.1rem;margin-bottom:0.5rem;}.product ul,.product ol{padding-left:1.5rem;margin:0.5rem 0 0 0;}.product li{margin-bottom:0.35rem;line-height:1.45;}.cta{margin-top:1.5rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.95rem;}.product a{color:#0a7ea4;}</style>
