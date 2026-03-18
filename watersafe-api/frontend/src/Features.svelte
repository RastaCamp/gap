<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Features</h1>
  <p class="hero">Drinking water data, EPA violation reports, and contaminant datasets — one risk score by ZIP.</p>
  <section><h2>What makes it new</h2><ul>
    <li>ZIP → contaminant list in one call</li>
    <li>Health risk scoring per chemical</li>
    <li>Violation timeline endpoint</li>
    <li>Filter recommendation field</li>
    <li>Comparison vs. national avg</li>
  </ul></section>
  <section><h2>Target buyers</h2><ul>
    <li><strong>Real estate platforms</strong> (huge) — property water quality</li>
    <li><strong>Home buyer apps</strong></li>
    <li><strong>Water filter companies</strong></li>
    <li><strong>Pregnancy / baby apps</strong></li>
    <li><strong>Landlord transparency tools</strong></li>
  </ul></section>
  <section><h2>Primary sources</h2><p>EWG Tap Water DB · EPA SDWIS · USGS National Water Dashboard · State MDE reports · CDC environmental exposure maps.</p></section>
  <p class="cta"><a href="#/pricing">See pricing</a> · <a href="#/api">Sell the API</a> · <a href="#/login">Sign in</a></p>
</div>
<style>.page{max-width:42rem;margin:2rem auto;padding:1.5rem;}.page h1{margin-bottom:0.25rem;}.hero{font-size:1.1rem;color:#444;margin-bottom:2rem;line-height:1.5;}.page section{margin-bottom:2rem;}.page section h2{font-size:1.1rem;margin-bottom:0.5rem;color:#333;}.page ul{padding-left:1.5rem;margin:0.5rem 0 0 0;}.page li{margin-bottom:0.35rem;line-height:1.45;}.page a{color:#0a7ea4;text-decoration:none;}.page a:hover{text-decoration:underline;}.cta{margin-top:2rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.95rem;}</style>
