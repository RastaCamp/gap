<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Simple pricing for builders, teams, and platforms.</h1>
  <p class="hero">Start small, scale as needed, and only pay for the environmental intelligence you actually use. All plans include the same data layers (AQI, radiation, toxics, optional water), API keys, and documentation; higher tiers add more requests, keys, and support.</p>

  <section>
    <h2>API plans</h2>
    <div class="tiers">
      <div class="tier">
        <h3>Developer</h3>
        <p class="price">$19<span>/mo</span></p>
        <ul>
          <li>5,000 requests/month</li>
          <li>Up to 2 API keys</li>
          <li>Core layers: AQI, radiation, toxics</li>
          <li>Email support</li>
          <li>Community roadmap access</li>
          <li>Overage: $0.006 per request</li>
        </ul>
      </div>
      <div class="tier">
        <h3>Growth</h3>
        <p class="price">$79<span>/mo</span></p>
        <ul>
          <li>50,000 requests/month</li>
          <li>Up to 10 API keys</li>
          <li>Core layers + historical summaries</li>
          <li>Saved locations and basic alerting</li>
          <li>Priority email support</li>
          <li>Overage: $0.004 per request</li>
        </ul>
      </div>
      <div class="tier">
        <h3>Business</h3>
        <p class="price">$199<span>/mo</span></p>
        <ul>
          <li>250,000 requests/month</li>
          <li>Up to 25 API keys</li>
          <li>Historical trends</li>
          <li>Plain-English summaries</li>
          <li>Higher rate limits</li>
          <li>Webhook-ready account support</li>
          <li>Overage: $0.0025 per request</li>
        </ul>
      </div>
      <div class="tier tier-enterprise">
        <h3>Enterprise</h3>
        <p class="price">Custom</p>
        <ul>
          <li>1M+ requests/month</li>
          <li>Custom rate limits</li>
          <li>Dedicated support</li>
          <li>SLA / onboarding help</li>
          <li>Volume discounts</li>
          <li>Optional custom scoring and white-label</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="payg">
    <h2>Pay-as-you-go</h2>
    <p><strong>$19–$199/mo</strong> plans above cover most teams. We also offer a <strong>pay-per-call option</strong> for mobile and indie devs: no monthly subscription, pay only for the requests you make. Ideal for prototyping, demos, and low-volume apps. <a href="#/contact">Contact us</a> to enable pay-per-call on your account.</p>
  </section>

  <section class="faq">
    <h2>Common questions</h2>
    <p><strong>Who is the Developer plan for?</strong> Solo devs and small projects (e.g. a single mobile app or side project) that need up to 5K requests/month and basic email support.</p>
    <p><strong>Who is the Business plan for?</strong> Teams and platforms embedding environmental intelligence in multiple products or for many users; 250K requests/month, webhook-ready accounts, and lower overage rates.</p>
    <p><strong>What counts as a request?</strong> Each call to <code>GET /environment</code> (or the equivalent product endpoint) counts as one request, regardless of how many layers you request.</p>
  </section>

  <p class="cta-buttons"><a href="#/login" class="btn btn-primary">Start testing</a> <a href="#/docs" class="btn btn-secondary">View API docs</a> <a href="#/contact" class="btn btn-secondary">Book a demo</a> <a href="#/contact" class="btn btn-secondary">Get in touch</a></p>
  <p class="cta"><a href="#/">← Home</a> · <a href="#/features">Features</a> · <a href="#/api">Sell API</a> · <a href="#/service">Sell Service</a></p>
</div>
<style>
  .page { max-width: 48rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .page h1 { font-size: 1.5rem; color: #0F172A; margin-bottom: 0.5rem; }
  .hero { font-size: 1.05rem; color: #334155; margin-bottom: 2rem; line-height: 1.6; }
  .page section { margin-bottom: 2rem; }
  .page section h2 { font-size: 1.15rem; color: #0F172A; margin-bottom: 0.75rem; }
  .tiers { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: 1rem; }
  .tier { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1rem; }
  .tier-enterprise { border-color: #2563EB; }
  .tier h3 { margin: 0 0 0.5rem 0; font-size: 1rem; color: #0F172A; }
  .price { font-size: 1.5rem; font-weight: 700; margin: 0.25rem 0 0.5rem 0; color: #0F172A; }
  .price span { font-size: 0.9rem; font-weight: 400; color: #64748B; }
  .tier ul { padding-left: 1.25rem; margin: 0; font-size: 0.9rem; color: #334155; }
  .tier li { margin-bottom: 0.25rem; }
  .payg { background: #E0F2FE; padding: 1rem; border-radius: 8px; }
  .payg p { margin: 0; color: #334155; }
  .payg a { color: #1D4ED8; }
  .faq { font-size: 0.95rem; color: #334155; }
  .faq h2 { margin-bottom: 0.75rem; }
  .faq p { margin-bottom: 0.75rem; line-height: 1.5; }
  .faq code { background: #E2E8F0; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.9em; }
  .cta-buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  .btn { padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
  .btn-primary { background: #2563EB; color: #fff; }
  .btn-secondary { background: #fff; color: #2563EB; border: 1px solid #2563EB; }
  .cta { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; font-size: 0.95rem; }
  .page a { color: #2563EB; }
</style>
