<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Features</h1>
  <p class="hero">Grid health + solar risk in one response. Outage count + demand stress. State/county/ISO level. Webhook threshold alerts.</p>
  <section><h2>What makes it new</h2><ul>
    <li>Grid health + solar risk in one response</li>
    <li>Outage count + demand stress combined</li>
    <li>State / county / ISO level</li>
    <li>Webhook for threshold alerts</li>
    <li>Historical reliability trends</li>
  </ul></section>
  <section><h2>Target buyers</h2><ul>
    <li><strong>Data centers</strong></li>
    <li><strong>EV charging networks</strong></li>
    <li><strong>Solar / battery companies</strong></li>
    <li><strong>Smart home platforms</strong></li>
    <li><strong>Utility tech startups</strong></li>
  </ul></section>
  <section><h2>Primary sources</h2><p>EIA Open API · PowerOutage.us · NOAA SWPC Geoelectric · DOE Energy Alerts · NERC reliability data.</p></section>
  <p class="cta"><a href="#/pricing">See pricing</a> · <a href="#/api">Sell the API</a> · <a href="#/login">Sign in</a></p>
</div>
<style>.page{max-width:42rem;margin:2rem auto;padding:1.5rem;}.page h1{margin-bottom:0.25rem;}.hero{font-size:1.1rem;color:#444;margin-bottom:2rem;line-height:1.5;}.page section{margin-bottom:2rem;}.page section h2{font-size:1.1rem;margin-bottom:0.5rem;color:#333;}.page ul{padding-left:1.5rem;margin:0.5rem 0 0 0;}.page li{margin-bottom:0.35rem;line-height:1.45;}.page a{color:#0a7ea4;text-decoration:none;}.page a:hover{text-decoration:underline;}.cta{margin-top:2rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.95rem;}</style>
