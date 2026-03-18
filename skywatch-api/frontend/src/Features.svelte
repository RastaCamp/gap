<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Features</h1>
  <p class="hero">Solar flare alerts, geomagnetic storms, satellite passes, asteroid flybys, and space weather in one feed.</p>
  <section><h2>What makes it new</h2><ul>
    <li>All sky events in one response</li>
    <li>Aurora probability by coords</li>
    <li>Grid disruption risk from solar</li>
    <li>Satellite flare time predictions</li>
    <li>Plain-language sky summary field</li>
  </ul></section>
  <section><h2>Target buyers</h2><ul>
    <li><strong>Astrophotography apps</strong></li>
    <li><strong>Weather apps</strong> adding sky layer</li>
    <li><strong>Camping / outdoor apps</strong></li>
    <li><strong>Ham radio operators</strong></li>
    <li><strong>Prepper / off-grid platforms</strong></li>
  </ul></section>
  <section><h2>Primary sources</h2><p>NOAA SWPC API · N2YO Satellite API · Moon Giant · Heavens Above · SpaceWeather.com.</p></section>
  <p class="cta"><a href="#/pricing">See pricing</a> · <a href="#/api">Sell the API</a> · <a href="#/login">Sign in</a></p>
</div>
<style>.page{max-width:42rem;margin:2rem auto;padding:1.5rem;}.page h1{margin-bottom:0.25rem;}.hero{font-size:1.1rem;color:#444;margin-bottom:2rem;line-height:1.5;}.page section{margin-bottom:2rem;}.page section h2{font-size:1.1rem;margin-bottom:0.5rem;color:#333;}.page ul{padding-left:1.5rem;margin:0.5rem 0 0 0;}.page li{margin-bottom:0.35rem;line-height:1.45;}.page a{color:#0a7ea4;text-decoration:none;}.page a:hover{text-decoration:underline;}.cta{margin-top:2rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.95rem;}</style>
