<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Features</h1>
  <p class="hero">{info.description ?? "Data and intelligence"} — in one API, with clear docs and simple pricing.</p>

  <section>
    <h2>API &amp; data</h2>
    <ul>
      <li><strong>Single REST API</strong> — one integration for all supported sources and data types</li>
      <li><strong>Search &amp; filter</strong> — full-text search and filters so you get exactly what you need</li>
      <li><strong>Stable schema</strong> — consistent JSON responses; we handle source changes and regular syncs</li>
      <li><strong>Usage-based plans</strong> — free tier to get started; Pro and Enterprise for higher volume and rate limits</li>
    </ul>
  </section>

  <section>
    <h2>Use cases</h2>
    <ul>
      <li><strong>Integrate into your app</strong> — power features with live or historical data from one endpoint</li>
      <li><strong>Build dashboards and reports</strong> — for internal teams, customers, or compliance</li>
      <li><strong>Compliance and auditing</strong> — track and report on the data that matters to you</li>
      <li><strong>Scale as you grow</strong> — start free, upgrade when you need more volume or support</li>
    </ul>
  </section>

  <section>
    <h2>Why choose us</h2>
    <ul>
      <li>Data kept up to date with automated syncs and health checks</li>
      <li>Documentation and sample responses so you can integrate quickly</li>
      <li>Usage dashboard and API keys so you can manage access and limits</li>
    </ul>
  </section>

  <p class="cta"><a href="#/pricing">See pricing</a> · <a href="#/api">Sell the API</a> · <a href="#/login">Sign in</a></p>
</div>
<style>
  .page { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; }
  .page h1 { margin-bottom: 0.25rem; }
  .hero { font-size: 1.1rem; color: #444; margin-bottom: 2rem; line-height: 1.5; }
  .page section { margin-bottom: 2rem; }
  .page section h2 { font-size: 1.1rem; margin-bottom: 0.5rem; color: #333; }
  .page ul { padding-left: 1.5rem; margin: 0.5rem 0 0 0; }
  .page li { margin-bottom: 0.35rem; line-height: 1.45; }
  .page a { color: #0a7ea4; text-decoration: none; }
  .page a:hover { text-decoration: underline; }
  .cta { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.95rem; }
</style>
