<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Sectors / Use cases</h1>
  <p class="hero">MyAir Local serves product teams that need hyperlocal environmental context without maintaining multiple government APIs. Target buyers: real estate apps, smart home devices, health &amp; fitness apps, parent/family apps, and outdoor activity platforms.</p>

  <section class="cards">
    <div class="card"><h2>Real estate apps</h2><p>Show buyers and renters air quality, radiation context, and industrial proximity in one card. Embed the Environmental Risk Score and plain-English summary on listing and neighborhood pages — no links to four separate government sites.</p></div>
    <div class="card"><h2>Smart home devices</h2><p>Use the composite score or AQI layer to trigger automations: close windows, limit outdoor time, or notify household members when conditions degrade. One API call per location; cache and poll at your preferred interval.</p></div>
    <div class="card"><h2>Health &amp; fitness apps</h2><p>Adjust run routes, asthma alerts, or exposure guidance by location. The response includes sensitive-group language and a summary you can show in-app or in push notifications without regulatory jargon.</p></div>
    <div class="card"><h2>Parent / family apps</h2><p>Give families and caregivers one clear picture of outdoor conditions. The unified score and summary are designed for non-experts; ideal for "is it safe for the kids to play outside?" features.</p></div>
    <div class="card"><h2>Outdoor activity platforms</h2><p>Surface environmental context before users head outside — hiking, camping, travel, or events. One request per destination or waypoint; optional historical trend for "getting better or worse" context.</p></div>
  </section>

  <section class="testimonials">
    <h2>What builders say</h2>
    <blockquote>"We needed environmental context for location-based recommendations, but didn't want to maintain four different government integrations. MyAir Local made the integration far simpler."</blockquote>
    <blockquote>"The plain-English summary is what sold us. Our product team could finally explain risk in a way non-technical users understood."</blockquote>
    <blockquote>"The unified score helped us prototype much faster than building our own cross-source logic from scratch."</blockquote>
  </section>

  <p class="cta"><a href="#/features">Features</a> · <a href="#/pricing">Pricing</a> · <a href="#/contact">Book a demo</a></p>
</div>
<style>
  .page { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .page h1 { font-size: 1.5rem; color: #0F172A; margin-bottom: 0.5rem; }
  .hero { font-size: 1.05rem; color: #334155; margin-bottom: 2rem; }
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .card { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1rem; }
  .card h2 { font-size: 1rem; margin: 0 0 0.35rem 0; color: #2563EB; }
  .card p { font-size: 0.9rem; margin: 0; color: #64748B; line-height: 1.4; }
  .testimonials blockquote { margin: 0 0 1rem 0; padding-left: 1rem; border-left: 3px solid #2563EB; color: #334155; font-style: italic; }
  .cta { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; }
  .page a { color: #2563EB; }
</style>
