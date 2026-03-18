<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Sectors / Use cases</h1>
  <p class="hero">Built for satellite operators, space hobbyist apps, observatories, astrophotography tools, and aviation weather platforms.</p>

  <section class="cards">
    <div class="card"><h2>Satellite operators</h2><p>Orbital and space weather risk in one feed.</p></div>
    <div class="card"><h2>Space hobbyist apps</h2><p>Visible passes and aurora probability.</p></div>
    <div class="card"><h2>Observatories</h2><p>Observation planning with solar and orbital context.</p></div>
    <div class="card"><h2>Astrophotography tools</h2><p>Visibility and conditions for imaging.</p></div>
    <div class="card"><h2>Aviation weather</h2><p>Space weather impact on operations.</p></div>
  </section>

  <section class="testimonials">
    <h2>What builders say</h2>
    <blockquote>"We needed space weather and satellite data in one place. SkyWatch made the integration straightforward."</blockquote>
    <blockquote>"Unified observations helped us ship our astronomy app faster."</blockquote>
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
