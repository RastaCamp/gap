<script>
  let info = {}; let stats = {};
  fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {});
  fetch("/api/stats").then((r) => r.json()).then((d) => (stats = d)).catch(() => {});
</script>
<header class="header">
  <h1>{info.name ?? "NewsSignal"}</h1>
  <p class="tagline">{info.description ?? "Global anomaly and disaster news aggregation."}</p>
  <nav class="nav">
    <a href="#/features">Features</a>
    <a href="#/sectors">Sectors</a>
    <a href="#/pricing">Pricing</a>
    <a href="#/docs">API Docs</a>
    <a href="#/contact">Contact</a>
    <a href="#/login">Login</a>
    <a href="#/login?admin=1" class="admin-link">Admin</a>
    <a href="#/login" class="debug">Debug</a>
    <a href="#/api">Sell API</a>
    <a href="#/service">Sell Service</a>
  </nav>
</header>
<main class="main">
  <section class="hero">
    <h2>Global anomaly and disaster news aggregation.</h2>
    <p class="hero-sub">Aggregated, deduplicated, categorized news from BBC, Reuters, AP, MarketWatch, TechCrunch, Al Jazeera, CNN, and others. Sentiment scoring, topic clustering, and cross-outlet coverage scoring — how many sources covered an event equals signal strength. Heavier normalization and unique cultural sources (e.g. XXL, The Source) vs. generic news APIs.</p>
    <p class="hero-value">One endpoint: <code>GET /news?topics=climate,finance&sentiment=true&dedupe=true</code>. High-volume demand; Tier 3 niche. Ideal for dashboards, alerts, and trend detection.</p>
    <p class="hero-cta">
      <a href="#/login" class="btn btn-primary">Start testing</a>
      <a href="#/docs" class="btn btn-secondary">View API docs</a>
      <a href="#/contact" class="btn btn-secondary">Book a demo</a>
    </p>
    <p class="hero-stats"><strong>Total alerts:</strong> {stats.total_alerts ?? "—"} · <a href="/api/alerts" target="_blank" rel="noopener">Browse API</a></p>
  </section>
</main>
<footer class="footer">
  <nav><a href="#/features">Features</a> · <a href="#/sectors">Sectors</a> · <a href="#/pricing">Pricing</a> · <a href="#/docs">Docs</a> · <a href="#/contact">Contact</a></nav>
  <p class="legal">NewsSignal provides informational alerts and does not replace official emergency or regulatory guidance.</p>
  <p class="legal-links"><a href="#/contact">Terms of Use</a> · <a href="#/contact">Privacy Policy</a> · <a href="#/contact">Acceptable Use</a></p>
</footer>
<style>
  .header { padding: 2rem 1.5rem; background: #1a3a5c; color: #fff; }
  .header h1 { margin: 0 0 0.25rem 0; font-size: 1.75rem; }
  .tagline { margin: 0 0 1rem 0; opacity: 0.9; font-size: 0.95rem; }
  .nav { display: flex; flex-wrap: wrap; gap: 0.75rem; }
  .nav a { color: #8dc8e8; text-decoration: none; }
  .nav .admin-link { color: #A5B4FC; }
  .nav .debug { color: #f0c674; }
  .main { max-width: 42rem; margin: 0 auto; padding: 2rem 1.5rem; background: #F8FAFC; }
  .hero h2 { font-size: 1.5rem; color: #1a3a5c; margin: 0 0 0.75rem 0; }
  .hero-sub { font-size: 1.05rem; color: #334155; line-height: 1.6; margin-bottom: 1rem; }
  .hero-value { font-size: 0.98rem; color: #475569; line-height: 1.55; margin-bottom: 1.5rem; }
  .hero-value code { background: #E2E8F0; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.9em; }
  .hero-cta { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; }
  .btn { padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; }
  .btn-primary { background: #0a7ea4; color: #fff; }
  .btn-primary:hover { background: #086a8a; }
  .btn-secondary { background: #fff; color: #0a7ea4; border: 1px solid #0a7ea4; }
  .btn-secondary:hover { background: #E0F2FE; }
  .hero-stats { font-size: 0.9rem; color: #64748B; }
  .hero-stats a { color: #0a7ea4; }
  .footer { padding: 1.5rem 1.5rem; border-top: 1px solid #E2E8F0; font-size: 0.9rem; color: #64748B; }
  .footer nav { margin-bottom: 0.5rem; }
  .footer a { color: #0a7ea4; text-decoration: none; }
  .legal { font-size: 0.85rem; margin: 0.5rem 0; max-width: 42rem; margin-left: auto; margin-right: auto; }
  .legal-links { font-size: 0.85rem; margin-top: 0.25rem; }
</style>
