# Architecture model and data sources per project

## MyAir Local API (reference)

MyAir uses the **full UI Copy Pack** and architecture:

- **Landing:** Hero “Hyperlocal environmental intelligence in one API call”, CTAs (Start testing, View docs, Book a demo), footer with legal note and Terms/Privacy/Contact.
- **Features:** “One query. Multiple environmental layers.”, core + extended bullets, use-case cards (Real estate, Smart home, Health, Family, Outdoor, Developers).
- **Sectors:** Same use cases as cards + placeholder testimonials.
- **Pricing:** Developer $19, Growth $79, Business $199, Enterprise custom, Pay-as-you-go $9; overage copy; CTAs.
- **API Docs:** Example `GET /environment?lat=&lng=&layers=`, response shape, links to live API.
- **Contact:** Emails (hello@, sales@, support@), placeholder form and Book a demo.
- **ApiProduct:** “Plug environmental intelligence…”, example request/response, pricing link.
- **ServiceProduct:** “MyAir Local Console”, what you get, pricing link.
- **Brand colors:** Deep navy #0F172A, sky blue #2563EB, teal #14B8A6, soft cyan #E0F2FE, amber #F59E0B, background #F8FAFC, text #334155.

**Routes:** `#/`, `#/features`, `#/sectors`, `#/pricing`, `#/docs`, `#/contact`, `#/login`, `#/api`, `#/service`, `#/dashboard`, `#/admin`.

---

## Copying this model to other projects

Use the **same structure** (Landing with hero + CTAs + footer legal, Features, Sectors, Pricing, Docs, Contact, ApiProduct, ServiceProduct) and swap in **project-specific**:

1. **Product name and tagline** (from backend `GET /api` or hardcoded).
2. **Feature bullets** (what the API actually does).
3. **Sectors / use cases** (who it’s for).
4. **Pricing tiers** (can keep placeholder or use real numbers).
5. **Docs:** example endpoint and response (e.g. `/api/events`, `/api/reports`, `/api/alerts`).
6. **Contact:** placeholder emails (e.g. hello@groundtruth.local) or same contact page.
7. **Service name** (e.g. “Event Monitor”, “Recall Watch”, “SkyWatch Dashboard”).

---

## Data sources and copy hints (from your API list)

Use these to fill **feature bullets**, **sectors**, and **docs** for each project.

| Project | Main sources | Use cases / sectors | Example endpoint |
|--------|---------------|----------------------|-------------------|
| **MyAir** | AirNow, RadNet, CAMS, TRI, USGS water | Real estate, smart home, health, family, outdoor, developers | `GET /environment?lat=&lng=&layers=` or `/api/readings` |
| **FoodSafe** | FDA, USDA, CDC, FoodSafety.gov | Retail, supply chain, health apps, compliance | `GET /api/recalls` |
| **GroundTruth Seismic** | USGS Earthquake, IRIS, VAAC, Smithsonian GVP | Risk/insurance, emergency response, research | `GET /api/events` |
| **SkyWatch** | NOAA SWPC, N2YO, moon/astronomy APIs | Space weather, satellite, astronomy apps | `GET /api/observations` |
| **WaterSafe** | EWG Tap Water, EPA SDWIS, USGS water (WDFN) | Utilities, compliance, health, environmental | `GET /api/reports` |
| **GridStatus** | EIA, NOAA SWPC, GridStatus.io | Energy, utilities, smart home, compliance | `GET /api/readings` |
| **NewsSignal** | NOAA Weather Alerts, GDACS, BBC/Reuters/AP/CNN RSS, News API | News, weather, emergency, risk monitoring | `GET /api/alerts` |
| **BioSurge** | CDC, USDA APHIS, ProMED, BirdCast | Healthcare, public health, risk, research | `GET /api/reports` |
| **NeighborhoodScore** | Baltimore open data, CityProtect, CDC PLACES, AirNow, NSOPW | Real estate, community, government, risk | `GET /api/reports` |

Additional domains you listed (flood, drought, polar ice, maritime, disease aggregators) can become **new projects** or **extra layers** in an existing project (e.g. WaterSafe + flood/drought; BioSurge + WHO/HealthMap/EPIWATCH).

---

## Optional: add Sectors, Docs, Contact to other projects

To match MyAir’s architecture on **other 8 projects**:

1. Add **Sectors.svelte**, **Docs.svelte**, **Contact.svelte** (copy from MyAir, then replace product name, use cases, example endpoint, and contact placeholders).
2. In **App.svelte**, add routes: `#/sectors`, `#/docs`, `#/contact`.
3. In **Landing.svelte**, add nav links (Sectors, API Docs, Contact) and the same footer legal + Terms/Privacy/Contact pattern.
4. Use the table above to fill sectors and docs content per project.

Emails, testimonials, and legal copy can stay as placeholders until you finalize them.
