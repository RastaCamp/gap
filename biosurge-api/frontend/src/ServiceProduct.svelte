<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="product">
  <h1>Sell the Service</h1>
  <p class="subtitle">BioSurge Monitor — a turnkey service built on the {info.name ?? "BioSurge"} API: disease outbreak and health alerts, dashboards, and reports. We run it; you use it.</p>
  <section><h2>What you get</h2><ul>
    <li>Alerts when disease outbreaks or health reports affect your regions or operations</li>
    <li>Branded dashboard for your organization — no coding required</li>
    <li>Weekly summaries and optional compliance support</li>
    <li>No integration work — we configure and host everything</li>
  </ul></section>
  <section><h2>How it works</h2><ol>
    <li><strong>Tell us your needs</strong> — regions, thresholds, and how you want to be notified.</li>
    <li><strong>We configure and deploy</strong> — we set up the pipelines and dashboards using our API.</li>
    <li><strong>You get dashboards and alerts</strong> — log in anytime to see current data and history; we handle updates and maintenance.</li>
  </ol></section>
  <section><h2>Pricing</h2><p>Starter: $99/mo. Team: $299/mo with more users and branding. Enterprise: custom. <a href="#/pricing">View full pricing</a>.</p></section>
  <p class="cta"><a href="#/login">Sign in or sign up</a> · <a href="#/pricing">Pricing</a> · <a href="#/api">Or buy the API</a></p>
</div>
<style>.product{max-width:42rem;margin:2rem auto;padding:1.5rem;}.subtitle{font-size:1.1rem;color:#555;margin-bottom:1.5rem;line-height:1.5;}.product section{margin-bottom:1.75rem;}.product h2{font-size:1.1rem;margin-bottom:0.5rem;}.product ul,.product ol{padding-left:1.5rem;margin:0.5rem 0 0 0;}.product li{margin-bottom:0.35rem;line-height:1.45;}.cta{margin-top:1.5rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.95rem;}.product a{color:#0a7ea4;}</style>
