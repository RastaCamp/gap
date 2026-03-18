<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="product">
  <h1>Sell the API</h1>
  <p class="subtitle">NeighborhoodScore merges crime data, environmental health indicators, and infrastructure risk signals into a single neighborhood risk score.</p>
  <section><h2>Endpoint</h2><pre class="code">GET /score?address=123+Main+Baltimore&factors=crime,air,water,health</pre></section>
  <section><h2>Example response</h2><pre class="code">{`{
  "neighborhood_score": 64,
  "crime_risk": 48,
  "environmental_risk": 32,
  "health_risk": 21
}`}</pre></section>
  <section><h2>Getting started</h2><ol>
    <li><strong>Sign up</strong> — create an account and choose a plan.</li>
    <li><strong>Get your API key</strong> — from the dashboard; use in <code>Authorization</code> header or query parameter.</li>
    <li><strong>Call the API</strong> — see <a href="#/docs">API Docs</a> and <a href="/api" target="_blank" rel="noopener">live API</a>.</li>
  </ol></section>
  <section><h2>Pricing</h2><p><a href="#/pricing">View full pricing</a>.</p></section>
  <p class="cta"><a href="#/login">Sign in or sign up</a> · <a href="#/pricing">Pricing</a> · <a href="#/service">Or buy the managed service</a></p>
</div>
<style>.product{max-width:42rem;margin:2rem auto;padding:1.5rem;}.subtitle{font-size:1.1rem;color:#555;margin-bottom:1.5rem;line-height:1.5;}.product section{margin-bottom:1.75rem;}.product h2{font-size:1.1rem;margin-bottom:0.5rem;}.product ul,.product ol{padding-left:1.5rem;margin:0.5rem 0 0 0;}.product li{margin-bottom:0.35rem;line-height:1.45;}.product pre.code{background:#1a3a5c;color:#E0F2FE;padding:1rem;border-radius:6px;overflow-x:auto;font-size:0.85rem;}.product code{background:#f0f0f0;padding:0.1rem 0.35rem;border-radius:3px;font-size:0.9em;}.cta{margin-top:1.5rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.95rem;}.product a{color:#0a7ea4;}</style>
