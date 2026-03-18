<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Pricing</h1>
  <p class="hero">Simple, predictable plans for the {info.name ?? "NeighborhoodScore"} API and for the managed service. Start free, scale as you grow.</p>
  <section><h2>API plans</h2><p class="section-note">Pay for what you use. All plans include documentation, API keys, and a usage dashboard.</p>
  <div class="tiers">
    <div class="tier"><h3>Free</h3><p class="price">$0<span>/mo</span></p><ul><li>1,000 requests/month</li><li>All data sources</li><li>Community support</li></ul></div>
    <div class="tier"><h3>Pro</h3><p class="price">$49<span>/mo</span></p><ul><li>50,000 requests/month</li><li>Higher rate limits</li><li>Email support</li></ul></div>
    <div class="tier"><h3>Enterprise</h3><p class="price">Custom</p><ul><li>Custom volume &amp; SLA</li><li>Dedicated support</li><li>Custom integrations</li></ul></div>
  </div></section>
  <section><h2>Service / dashboard plans</h2><p class="section-note">We host and run the dashboards and alerts for you — no integration work on your side.</p>
  <ul class="simple-list">
    <li><strong>Starter</strong> — $99/mo: Alerts, basic dashboard, weekly summary</li>
    <li><strong>Team</strong> — $299/mo: Multiple users, branded dashboard, compliance support</li>
    <li><strong>Enterprise</strong> — Custom: SLAs, custom branding, dedicated success manager</li>
  </ul></section>
  <p class="contact">Need a custom plan or volume discount? <a href="#/api">Get in touch</a> or use the contact details in the footer.</p>
  <p class="cta"><a href="#/">← Home</a> · <a href="#/features">Features</a> · <a href="#/api">Sell API</a> · <a href="#/service">Sell Service</a></p>
</div>
<style>.page{max-width:42rem;margin:2rem auto;padding:1.5rem;}.hero{font-size:1.05rem;color:#444;margin-bottom:2rem;line-height:1.5;}.page section{margin-bottom:2rem;}.page section h2{font-size:1.15rem;margin-bottom:0.25rem;}.section-note{font-size:0.9rem;color:#555;margin-bottom:1rem;}.tiers{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:1rem;margin-top:0.5rem;}.tier{border:1px solid #ddd;border-radius:6px;padding:1rem;background:#fafafa;}.tier h3{margin:0 0 0.5rem 0;font-size:1rem;}.price{font-size:1.5rem;font-weight:700;margin:0.25rem 0 0.5rem 0;}.price span{font-size:0.9rem;font-weight:400;color:#666;}.tier ul{padding-left:1.25rem;margin:0;font-size:0.9rem;}.tier li{margin-bottom:0.25rem;}.simple-list{padding-left:1.5rem;}.simple-list li{margin-bottom:0.5rem;line-height:1.4;}.contact{font-size:0.95rem;color:#555;margin-bottom:1rem;}.cta{margin-top:1.5rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.95rem;}.page a{color:#0a7ea4;}</style>
