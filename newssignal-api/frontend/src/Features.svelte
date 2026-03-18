<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Features</h1>
  <p class="hero">Breaking news and official disaster reports — topic-clustered alerts from dozens of trusted sources.</p>
  <section><h2>Feature bullets</h2><ul>
    <li>Disaster news clustering</li>
    <li>Sentiment tagging</li>
    <li>Topic filtering</li>
    <li>Multi-source aggregation</li>
  </ul></section>
  <section><h2>Sources</h2><p>Reuters · BBC · Associated Press · TechCrunch · CNN.</p></section>
  <p class="cta"><a href="#/pricing">See pricing</a> · <a href="#/api">Sell the API</a> · <a href="#/login">Sign in</a></p>
</div>
<style>.page{max-width:42rem;margin:2rem auto;padding:1.5rem;}.page h1{margin-bottom:0.25rem;}.hero{font-size:1.1rem;color:#444;margin-bottom:2rem;line-height:1.5;}.page section{margin-bottom:2rem;}.page section h2{font-size:1.1rem;margin-bottom:0.5rem;color:#333;}.page ul{padding-left:1.5rem;margin:0.5rem 0 0 0;}.page li{margin-bottom:0.35rem;line-height:1.45;}.page a{color:#0a7ea4;text-decoration:none;}.page a:hover{text-decoration:underline;}.cta{margin-top:2rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.95rem;}</style>
