<script>
  let info = {}; let stats = {};
  fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {});
  const _sh = {};
  if (typeof localStorage !== "undefined") { const t = localStorage.getItem("token"); if (t) _sh.Authorization = "Bearer " + t; }
  fetch("/api/stats", { headers: _sh }).then((r) => (r.ok ? r.json() : {})).then((d) => (stats = d)).catch(() => {});
</script>
<header class="header">
  <h1>{info.name ?? "MyAir Local API"}</h1>
  <p class="tagline">{info.tagline ?? "Hyperlocal environmental intelligence in one API call."}</p>
  <nav class="nav">
    <a href="#/features">Features</a>
    <a href="#/sectors">Sectors</a>
    <a href="#/pricing">Pricing</a>
    <a href="#/docs">API Docs</a>
    <a href="#/contact">Contact</a>
    <a href="#/login">Login</a> <a href="#/register">Register</a>
    <a href="#/login?admin=1" class="admin-link">Admin</a>
</nav>
</header>
<main class="main">
  <section class="hero">
    <h2>Hyperlocal environmental intelligence in one API call.</h2>
    <p class="hero-sub">Stop juggling EPA AirNow, RadNet, toxic release databases, and water reports. MyAir Local stacks AQI, radiation monitoring, CAMS chemical forecasts, and National Toxic T-Map into a single coordinate-based query — and returns a unified Environmental Risk Score plus plain-English summaries that don't exist on any single government site today.</p>
    <p class="hero-value">One request. One composite score. Asthma and health-risk context. Historical trends when you need them. Built for real estate, smart home, health, and outdoor apps that need to ship fast without maintaining four separate integrations.</p>
    <p class="hero-cta">
      <a href="#/login" class="btn btn-primary">Start testing</a>
      <a href="#/docs" class="btn btn-secondary">View API docs</a>
      <a href="#/contact" class="btn btn-secondary">Book a demo</a>
    </p>
    <p class="hero-stats"><strong>Total readings:</strong> {stats.total_readings ?? "—"} · <a href="/api/readings" target="_blank" rel="noopener">Browse API</a></p>
  </section>
</main>
<footer class="footer">
  <nav><a href="#/features">Features</a> · <a href="#/sectors">Sectors</a> · <a href="#/pricing">Pricing</a> · <a href="#/docs">Docs</a> · <a href="#/contact">Contact</a></nav>
  <p class="legal">MyAir Local provides informational environmental intelligence and does not replace emergency alerts, medical guidance, or official regulatory determinations.</p>
  <p class="legal-links"><a href="#/contact">Terms of Use</a> · <a href="#/contact">Privacy Policy</a> · <a href="#/contact">Acceptable Use</a></p>
</footer>
<style>
  .header { padding: 2rem 1.5rem; background: #0F172A; color: #fff; }
  .header h1 { margin: 0 0 0.25rem 0; font-size: 1.75rem; }
  .tagline { margin: 0 0 1rem 0; color: #E0F2FE; font-size: 0.95rem; }
  .nav { display: flex; flex-wrap: wrap; gap: 0.75rem; }
  .nav a { color: #7DD3FC; text-decoration: none; }
  .nav a:hover { color: #E0F2FE; text-decoration: underline; }
  .nav .admin-link { color: #A5B4FC; }
  .nav.main { max-width: 42rem; margin: 0 auto; padding: 2rem 1.5rem; background: #F8FAFC; }
  .hero h2 { font-size: 1.5rem; color: #0F172A; margin: 0 0 0.75rem 0; }
  .hero-sub { font-size: 1.05rem; color: #334155; line-height: 1.6; margin-bottom: 1rem; }
  .hero-value { font-size: 0.98rem; color: #475569; line-height: 1.55; margin-bottom: 1.5rem; }
  .hero-cta { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; }
  .btn { padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; }
  .btn-primary { background: #2563EB; color: #fff; }
  .btn-primary:hover { background: #1D4ED8; }
  .btn-secondary { background: #fff; color: #2563EB; border: 1px solid #2563EB; }
  .btn-secondary:hover { background: #E0F2FE; }
  .hero-stats { font-size: 0.9rem; color: #64748B; }
  .hero-stats a { color: #2563EB; }
  .footer { padding: 1.5rem 1.5rem; border-top: 1px solid #E2E8F0; font-size: 0.9rem; color: #64748B; }
  .footer nav { margin-bottom: 0.5rem; }
  .footer a { color: #2563EB; text-decoration: none; }
  .footer a:hover { text-decoration: underline; }
  .legal { font-size: 0.85rem; margin: 0.5rem 0; max-width: 42rem; margin-left: auto; margin-right: auto; }
  .legal-links { font-size: 0.85rem; margin-top: 0.25rem; }
</style>
