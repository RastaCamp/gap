<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Pricing</h1>
  <p class="hero">$29–$249/mo. Real estate integration = highest LTV customer. All plans include docs, API keys, and usage dashboard.</p>
  <section><h2>API plans</h2><p class="section-note">Pay for what you use.</p>
  <div class="tiers">
    <div class="tier"><h3>Starter</h3><p class="price">$29<span>/mo</span></p><ul><li>5,000 requests/month</li><li>Contaminants + risk_score</li><li>Email support</li></ul></div>
    <div class="tier"><h3>Growth</h3><p class="price">$99<span>/mo</span></p><ul><li>50,000 requests/month</li><li>+ Violations, filter_recommendation</li><li>Priority support</li></ul></div>
    <div class="tier"><h3>Enterprise</h3><p class="price">$249<span>/mo</span></p><ul><li>250,000 requests/month</li><li>Real estate / white-label</li><li>Dedicated support</li></ul></div>
  </div></section>
  <section><h2>Service / dashboard plans</h2><p class="section-note">We host and run the dashboards and alerts for you — no integration work on your side.</p>
  <ul class="simple-list">
    <li><strong>Starter</strong> — $99/mo: Alerts, basic dashboard, weekly summary</li>
    <li><strong>Team</strong> — $299/mo: Multiple users, branded dashboard, compliance support</li>
    <li><strong>Enterprise</strong> — Custom: SLAs, custom branding, dedicated success manager</li>
  </ul></section>
  
  <section class="subscribe">
    <h2>Subscribe — <p class="contact">Need a custom plan9.99/mo</h2>
    <p>Pay securely with Stripe. After payment, sign in with the same email to unlock API access.</p>
    <p><a class="pay-link" href="https://buy.stripe.com/8x2aEX3Rmg3V5sH6Tu8AE0c" target="_blank" rel="noopener">Open payment page</a></p>
    <script async src="https://js.stripe.com/v3/buy-button.js"></script>
    <stripe-buy-button
      buy-button-id="buy_btn_1Th0QBGs5M6VYICJSfIVfcjU"
      publishable-key="pk_live_51Tg9fGGs5M6VYICJjerdsOUmveILN4GaT5XDAsDcvyYJbwsJZaZ7UDhHGdRRULioTBmHFY3bBqfrCkk88eDknb9U00zafoxFpI"
    ></stripe-buy-button>
  </section>
  <p class="contact">Need a custom plan or volume discount? <a href="#/api">Get in touch</a> or use the contact details in the footer.</p>
  <p class="cta"><a href="#/">← Home</a> · <a href="#/features">Features</a> · <a href="#/api">Sell API</a> · <a href="#/service">Sell Service</a></p>
</div>
<style>.page{max-width:42rem;margin:2rem auto;padding:1.5rem;}.hero{font-size:1.05rem;color:#444;margin-bottom:2rem;line-height:1.5;}.page section{margin-bottom:2rem;}.page section h2{font-size:1.15rem;margin-bottom:0.25rem;}.section-note{font-size:0.9rem;color:#555;margin-bottom:1rem;}.tiers{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:1rem;margin-top:0.5rem;}.tier{border:1px solid #ddd;border-radius:6px;padding:1rem;background:#fafafa;}.tier h3{margin:0 0 0.5rem 0;font-size:1rem;}.price{font-size:1.5rem;font-weight:700;margin:0.25rem 0 0.5rem 0;}.price span{font-size:0.9rem;font-weight:400;color:#666;}.tier ul{padding-left:1.25rem;margin:0;font-size:0.9rem;}.tier li{margin-bottom:0.25rem;}.simple-list{padding-left:1.5rem;}.simple-list li{margin-bottom:0.5rem;line-height:1.4;}.contact{font-size:0.95rem;color:#555;margin-bottom:1rem;}.cta{margin-top:1.5rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.95rem;}.page a{color:#0a7ea4;}  .subscribe { margin: 2rem 0; padding: 1.25rem; border: 1px solid #0a7ea4; border-radius: 8px; background: #f0f9fc; }
  .pay-link { display: inline-block; margin-bottom: 0.75rem; font-weight: 600; }
</style>
