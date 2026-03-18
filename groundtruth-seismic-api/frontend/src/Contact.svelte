<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Contact</h1>
  <p class="hero">Need higher volume, custom event filters, webhook setup, or a partner plan? We're happy to discuss your use case. Enterprise and insurance/utility deals often include onboarding, SLA, and dedicated support.</p>

  <section class="contact-info">
    <h2>Get in touch</h2>
    <ul>
      <li><strong>General:</strong> <a href="mailto:hello@groundtruth.local">hello@groundtruth.local</a></li>
      <li><strong>Sales / demo:</strong> <a href="mailto:sales@groundtruth.local">sales@groundtruth.local</a> — tell us your regions, volume, and whether you need API-only or Event Monitor.</li>
      <li><strong>Support:</strong> <a href="mailto:support@groundtruth.local">support@groundtruth.local</a> — API keys, rate limits, and documentation.</li>
    </ul>
    <p><a href="#/contact" class="btn">Book a demo</a> — we'll walk you through the events endpoint, response shape, and pricing. (Wire to your scheduler when ready.)</p>
  </section>

  <section class="form-section">
    <h2>Send us a message</h2>
    <p class="note">Include company, use case (e.g. insurance risk, emergency management), and estimated monthly requests. We typically respond within one business day.</p>
    <form class="form" on:submit|preventDefault>
      <label>Name <input type="text" placeholder="Your name" /></label>
      <label>Company <input type="text" placeholder="Company" /></label>
      <label>Work email <input type="email" placeholder="you@company.com" /></label>
      <label>Use case <input type="text" placeholder="e.g. Risk dashboard" /></label>
      <label>Estimated monthly requests <input type="text" placeholder="e.g. 10,000" /></label>
      <label>Message <textarea rows="3" placeholder="Tell us about your project"></textarea></label>
      <button type="submit" class="btn btn-primary">Send</button>
    </form>
  </section>

  <p class="cta"><a href="#/">← Home</a> · <a href="#/pricing">Pricing</a> · <a href="#/docs">API Docs</a></p>
</div>
<style>
  .page { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .page h1 { font-size: 1.5rem; color: #1a3a5c; margin-bottom: 0.5rem; }
  .hero { font-size: 1.05rem; color: #334155; margin-bottom: 2rem; }
  .contact-info { margin-bottom: 2rem; }
  .contact-info ul { list-style: none; padding: 0; }
  .contact-info li { margin-bottom: 0.5rem; }
  .form-section .note { font-size: 0.9rem; color: #64748B; margin-bottom: 0.75rem; }
  .form label { display: block; margin-bottom: 0.75rem; font-size: 0.9rem; color: #334155; }
  .form input, .form textarea { width: 100%; max-width: 24rem; padding: 0.5rem; margin-top: 0.25rem; border: 1px solid #E2E8F0; border-radius: 4px; }
  .form button { margin-top: 0.5rem; }
  .btn { padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; }
  .btn-primary { background: #0a7ea4; color: #fff; border: none; cursor: pointer; }
  .cta { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; }
  .page a { color: #0a7ea4; }
</style>
