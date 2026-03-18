<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Sectors / Use cases</h1>
  <p class="hero">Built for real estate platforms, home inspection apps, water filtration companies, and family health apps.</p>

  <section class="cards">
    <div class="card"><h2>Real estate platforms</h2><p>Property water quality and contamination risk by ZIP.</p></div>
    <div class="card"><h2>Home inspection apps</h2><p>Contamination risk and EPA violations for reports.</p></div>
    <div class="card"><h2>Water filtration companies</h2><p>Product and region intelligence from contaminant data.</p></div>
    <div class="card"><h2>Family health apps</h2><p>Drinking water safety by location.</p></div>
  </section>

  <section class="testimonials">
    <h2>What builders say</h2>
    <blockquote>"We needed one water quality API instead of EWG and EPA separately. WaterSafe made it simple."</blockquote>
    <blockquote>"Unified reports helped our compliance team stay on top of violations."</blockquote>
    <p class="note">Placeholder testimonials — replace with real customer quotes.</p>
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
