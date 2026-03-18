# Content guide — what to supply for marketing & product pages

The placeholder pages (Features, Pricing, Sell API, Sell Service) are filled with **expandable, generic copy** and **placeholder pricing**. To make them production-ready, you can supply the following.

---

## 1. **Pricing (real numbers)**

- **API plans:** Free / Pro / Enterprise — actual request limits, prices, and what’s included (e.g. support level, SLA).
- **Service / dashboard plans:** Starter / Team / Enterprise — actual prices and feature differences.
- **Overage:** What happens over the free/pro limit (e.g. $X per 1,000 requests, or hard cap).
- **Billing:** Payment methods, billing cycle, refund policy (if you want it on the page).

**Where it’s used:** `frontend/src/Pricing.svelte` (and the pricing sections in `ApiProduct.svelte` and `ServiceProduct.svelte`).

---

## 2. **Contact / “Get in touch”**

- **Email:** e.g. `sales@yourcompany.com` or `api@yourproduct.com`.
- **Contact form:** If you add a form, you’ll need an endpoint or service (e.g. Formspree, your backend).
- **Calendly / “Book a demo”:** URL for the CTA.

**Where it’s used:** Pricing page “Get in touch” and any CTA that should go to contact. Right now these link to `#/api` or `#/login`; replace with mailto or external URL as needed.

---

## 3. **API name and description**

- **Name:** e.g. “MyAir API”, “FoodSafe” — shown in nav, hero, and product pages.
- **Short description:** One line used on the landing and Features hero (e.g. “Air quality, radiation, and local environment”).

**Where it’s used:** Fetched from `GET /api` as `name` and `description`. You can change the backend response in each project’s `src/server/index.ts` (root or `/api` handler) so the frontend stays in sync.

---

## 4. **Features page**

- **API & data:** Bullet list of what the API actually provides (sources, filters, guarantees).
- **Use cases:** Industries or scenarios (e.g. “Real estate”, “Smart home”, “Compliance”) — already in a generic form; replace with your real use cases.
- **Why choose us:** Differentiators (e.g. “Only provider that merges X and Y”, “99.9% uptime SLA”).

**Where it’s used:** `frontend/src/Features.svelte`. The hero uses `info.description` from the API; the rest is in the Svelte template.

---

## 5. **Sell the API page (ApiProduct)**

- **Subtitle:** One sentence that clearly states what the API does and for whom.
- **Features:** Match the real capabilities (endpoints, filters, rate limits).
- **Getting started:** If your flow differs (e.g. “Request access” then we send a key), update the steps. The example request (e.g. `GET /api/readings`) is per-project; keep it in sync with your real docs.
- **Docs link:** Replace `/api` with your real docs URL if you host them elsewhere.

**Where it’s used:** `frontend/src/ApiProduct.svelte`.

---

## 6. **Sell the Service page (ServiceProduct)**

- **Service name:** e.g. “Air Watch”, “Recall Watch” — used in the subtitle and CTAs.
- **What you get:** Concrete deliverables (alerts, dashboard, reports, integrations).
- **How it works:** Steps that match your real onboarding (e.g. “We map your locations”, “You get a branded link”).

**Where it’s used:** `frontend/src/ServiceProduct.svelte`.

---

## 7. **Legal and trust**

- **Terms of Service:** URL or inline (footer or dedicated page).
- **Privacy Policy:** URL or inline.
- **SLAs / compliance:** If you mention “SLA” or “compliance”, add a link or short section.

**Where it’s used:** Not yet on the placeholder pages; add links in a footer or a small “Legal” section.

---

## 8. **Branding (optional)**

- **Logo:** URL or path to an image; add to the header in `Landing.svelte` (and optionally other layouts).
- **Favicon:** Replace the default in `frontend/index.html`.
- **Colors / fonts:** The pages use simple CSS (e.g. `#0a7ea4` for links, `#1a3a5c` for header). Override in each component’s `<style>` or a global CSS file.

---

## 9. **Testimonials / social proof (optional)**

- **Quotes:** Customer name, role, company, and a short quote.
- **Logos:** “Used by” or “Trusted by” with customer logos (with permission).

**Where it’s used:** Not in the current placeholders; add a section to `Features.svelte` or `Landing.svelte` if you want it.

---

## 10. **Analytics and tracking (optional)**

- **Google Analytics / Plausible / etc.:** Add the script or snippet to `frontend/index.html` (or your root layout) so you can measure traffic to Features, Pricing, and product pages.

---

## Quick checklist

| Item | Where to update |
|------|------------------|
| Real API/Service pricing | `Pricing.svelte`, pricing text in ApiProduct + ServiceProduct |
| Contact email or form | Pricing “Get in touch”, CTAs |
| API name & description | Backend `GET /api` response |
| Feature bullets & use cases | `Features.svelte` |
| API product copy & example request | `ApiProduct.svelte` |
| Service name & “What you get” | `ServiceProduct.svelte` |
| Terms / Privacy | Footer or new page |
| Logo, favicon, colors | `Landing.svelte`, `index.html`, CSS |

All of this is optional until you’re ready to go live; the current copy is designed to be **replace-in-place** without changing the layout or routing.
