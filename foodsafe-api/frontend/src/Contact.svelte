<script> let info = {}; fetch("/api").then((r) => r.json()).then((d) => (info = d)).catch(() => {}); </script>
<div class="page">
  <h1>Contact</h1>
  <p class="hero">Need higher volume, custom sources, or a partner plan? Let's talk about your use case.</p>

  <section class="contact-info">
    <h2>Get in touch</h2>
    <ul>
      <li><strong>General:</strong> <a href="mailto:hello@foodsafe.local">hello@foodsafe.local</a></li>
      <li><strong>Sales / demo:</strong> <a href="mailto:sales@foodsafe.local">sales@foodsafe.local</a></li>
      <li><strong>Support:</strong> <a href="mailto:support@foodsafe.local">support@foodsafe.local</a></li>
    </ul>
    <p><a href="#/contact" class="btn">Book a demo</a> (placeholder — wire to /book-demo or external scheduler)</p>
  </section>

  <section class="form-section">
    <h2>Contact form</h2>
    <p class="note">Placeholder — wire to your backend or a form service.</p>
    <form class="form" on:submit|preventDefault>
      <label>Name <input type="text" placeholder="Your name" /></label>
      <label>Company <input type="text" placeholder="Company" /></label>
      <label>Work email <input type="email" placeholder="you@company.com" /></label>
      <label>Use case <input type="text" placeholder="e.g. Retail recall dashboard" /></label>
      <label>Estimated monthly requests <input type="text" placeholder="e.g. 10,000" /></label>
      <label>Message <textarea rows="3" placeholder="Tell us about your project"></textarea></label>
      <button type="submit" class="btn btn-primary">Send</button>
    </form>
  </section>

  <p class="cta"><a href="#/">← Home</a> · <a href="#/pricing">Pricing</a> · <a href="#/docs">API Docs</a></p>
</div>
<style>
  .page { max-width: 42rem; margin: 2rem auto; padding: 1.5rem; background: #F8FAFC; }
  .page h1 { font-size: 1.5rem; color: #0d3b2e; margin-bottom: 0.5rem; }
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
