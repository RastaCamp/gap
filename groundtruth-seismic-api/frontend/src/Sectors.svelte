<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Sectors / Use cases</h1>
  <p class="hero">Target buyers: insurance risk platforms, emergency management apps, utility companies, construction and infrastructure firms, and travel safety apps. One events API replaces multiple institutional feeds and adds infrastructure and aftershock context.</p>

  <section class="cards">
    <div class="card"><h2>Insurance risk platforms</h2><p>Assess exposure to earthquakes and volcanic activity for underwriting and claims. Use infrastructure proximity score and aftershock probability in risk models; one API for all event types.</p></div>
    <div class="card"><h2>Emergency management apps</h2><p>Surface seismic and volcanic events in a single timeline; trigger notifications when events occur in configured regions. Webhook alerts per polygon on Growth and Enterprise plans.</p></div>
    <div class="card"><h2>Utility companies</h2><p>Monitor seismic and volcanic risk near assets and service areas. Unified event schema and optional webhooks reduce integration work compared to polling USGS and VAAC separately.</p></div>
    <div class="card"><h2>Construction / infrastructure firms</h2><p>Trigger checks or notifications when events occur near project sites or assets. Aftershock probability and infrastructure proximity help prioritize follow-up.</p></div>
    <div class="card"><h2>Travel safety apps</h2><p>Show travelers seismic and volcanic risk by destination; combine with tsunami alerts in one response for clearer travel guidance.</p></div>
  </section>

  <section class="testimonials">
    <h2>What builders say</h2>
    <blockquote>"We needed one events API instead of polling USGS and VAAC separately. GroundTruth Seismic made it simple."</blockquote>
    <blockquote>"Unified seismic and volcanic data helped our risk dashboard ship on time."</blockquote>
  </section>

  <p class="cta"><a href="#/features">Features</a> · <a href="#/pricing">Pricing</a> · <a href="#/contact">Book a demo</a></p>
</div>
<style>
  .page { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .page h1 { font-size: 1.5rem; color: #1a3a5c; margin-bottom: 0.5rem; }
  .hero { font-size: 1.05rem; color: #334155; margin-bottom: 2rem; }
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .card { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1rem; }
  .card h2 { font-size: 1rem; margin: 0 0 0.35rem 0; color: #0a7ea4; }
  .card p { font-size: 0.9rem; margin: 0; color: #64748B; line-height: 1.4; }
  .testimonials blockquote { margin: 0 0 1rem 0; padding-left: 1rem; border-left: 3px solid #0a7ea4; color: #334155; font-style: italic; }
  .testimonials .note { font-size: 0.85rem; color: #64748B; margin-top: 0.5rem; }
  .cta { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; }
  .page a { color: #0a7ea4; }
</style>
