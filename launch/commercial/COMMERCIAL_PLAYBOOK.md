# Commercial playbook — RastaCamp API products

How to **use**, **sell**, and **compete** with each GAP intelligence API. Copy per-product sections into proposals or site copy.

---

## How we win vs alternatives

| Advantage | Why it matters |
|-----------|----------------|
| **Unified auth + billing** | One signup, Stripe subscription, usage dashboard per product |
| **Multi-source fusion** | Normalized JSON from EPA, NOAA, CDC, etc. — not raw scrapes |
| **Self-serve + managed service** | Developers buy API access; operators buy hosted dashboards |
| **rastacamp.com edge** | Cloudflare Pages global, no tunnel/PC dependency |
| **Transparent pricing** | Public Payment Links + documented `$19.99/mo` API tier |

---

## FoodSafe (`foodsafe.rastacamp.com`)

**Data:** FDA/USDA recalls, enforcement, multi-agency food safety signals.

**Sell to:** grocery chains, food brands, restaurant groups, insurance, compliance consultants.

**Use cases:**
- Recall alert API in ERP or inventory systems
- Weekly compliance digest for QA teams
- White-label “recall watch” widget for consumer apps

**Compete with:** Manual FDA list subscriptions, generic news APIs — win on **structured recall fields**, **filters by product/class**, **webhook-ready freshness**.

---

## MyAir (`myair.rastacamp.com`)

**Data:** Air quality readings (AirNow, RadNet, Copernicus roadmap).

**Sell to:** Health apps, smart home, schools, municipal portals.

**Use cases:** Location-based AQI in mobile apps; school district dashboards; HR wellness programs.

**Compete with:** IQAir, BreezoMeter — win on **US public-sector sources**, **API-first**, **lower entry price**.

---

## GridStatus (`gridstatus.rastacamp.com`)

**Data:** Grid stress, outages, geomagnetic / space weather affecting infrastructure.

**Sell to:** Data centers, energy traders, facility managers, prepper/community tools.

**Use cases:** Outage risk scoring; datacenter failover playbooks; regional resilience reports.

---

## WaterSafe, BioSurge, NewsSignal, NeighborhoodScore, SkyWatch, GroundTruth

Each follows the same model:

1. **Developer tier** — REST JSON, bearer token, subscription gate
2. **Managed tier** — we host alerts/dashboards (upsell on Contact page)
3. **Enterprise** — custom SLAs, dedicated ingestion, private endpoints

See `{product}-api/frontend/src/Sectors.svelte` for vertical-specific bullets.

---

## Packaging ideas

| Package | Contents |
|---------|----------|
| **Starter API** | 10k req/mo, email support |
| **Pro** | Stripe Payment Link products in `launch/stripe-products.json` |
| **Bundle** | 3 APIs one invoice — custom Stripe price |
| **White-label** | Static site in `static-sites/` + your domain CNAME |

---

## Next steps for sales

1. Live demo URL on every `Pricing.svelte`
2. `Docs.svelte` with curl examples + OpenAPI-style tables
3. Case study placeholders on `Landing.svelte`
4. Contact form → admin email blast (`/api/admin/email-blast`)
