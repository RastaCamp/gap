<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Contact</h1>
  <p class="hero">Need higher limits, custom scoring, a partner plan, or the pay-per-call option? We're happy to discuss your use case, volume, and timeline. Enterprise and custom plans include onboarding and optional SLA; demos are free and non-binding.</p>

  <section class="contact-info">
    <h2>Get in touch</h2>
    <ul>
      <li><strong>General inquiries:</strong> <a href="mailto:hello@myairlocal.com">hello@myairlocal.com</a></li>
      <li><strong>Sales / demo:</strong> <a href="mailto:sales@myairlocal.com">sales@myairlocal.com</a> — tell us your app, expected volume, and whether you need API-only or Console.</li>
      <li><strong>Support:</strong> <a href="mailto:support@myairlocal.com">support@myairlocal.com</a> — technical issues, key problems, and documentation questions.</li>
    </ul>
    <p><a href="#/contact" class="btn">Book a demo</a> — we'll walk you through the API, response shape, and pricing. (Wire this CTA to your scheduler or Calendly when ready.)</p>
  </section>

  <section class="form-section">
    <h2>Send us a message</h2>
    <p class="note">Include your company, use case, and estimated monthly requests so we can suggest the right plan. We typically respond within one business day.</p>
    <form class="form" on:submit|preventDefault>
      <label>Name <input type="text" placeholder="Your name" /></label>
      <label>Company <input type="text" placeholder="Company" /></label>
      <label>Work email <input type="email" placeholder="you@company.com" /></label>
      <label>Use case <input type="text" placeholder="e.g. Real estate app" /></label>
      <label>Estimated monthly requests <input type="text" placeholder="e.g. 10,000" /></label>
      <label>Message <textarea rows="3" placeholder="Tell us about your project"></textarea></label>
      <button type="submit" class="btn btn-primary">Send</button>
    </form>
  </section>

  <p class="cta"><a href="#/">← Home</a> · <a href="#/pricing">Pricing</a> · <a href="#/docs">API Docs</a></p>
</div>
<style>
  .page { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .page h1 { font-size: 1.5rem; color: #0F172A; margin-bottom: 0.5rem; }
  .hero { font-size: 1.05rem; color: #334155; margin-bottom: 2rem; }
  .contact-info { margin-bottom: 2rem; }
  .contact-info ul { list-style: none; padding: 0; }
  .contact-info li { margin-bottom: 0.5rem; }
  .form-section .note { font-size: 0.9rem; color: #64748B; margin-bottom: 0.75rem; }
  .form label { display: block; margin-bottom: 0.75rem; font-size: 0.9rem; color: #334155; }
  .form input, .form textarea { width: 100%; max-width: 24rem; padding: 0.5rem; margin-top: 0.25rem; border: 1px solid #E2E8F0; border-radius: 4px; }
  .form button { margin-top: 0.5rem; }
  .btn { padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; }
  .btn-primary { background: #2563EB; color: #fff; border: none; cursor: pointer; }
  .cta { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; }
  .page a { color: #2563EB; }
</style>
