# Product portfolio overview

We are building a **multi-domain risk intelligence platform**.

- **Stripe** = payments  
- **Plaid** = finance  
- **Clearbit** = identity  
- **Our ecosystem** = environmental + infrastructure + anomaly intelligence  

---

## Tier 1

| Product | Description |
|--------|-------------|
| **MyAir Local API** | Hyperlocal environmental intelligence — AQI, radiation, toxics, water in one API call. |
| **GroundTruth Seismic API** | Real-time global seismic and volcanic intelligence — earthquakes, volcanoes, tsunami, disaster feeds. |

---

## Tier 2

| Product | Description |
|--------|-------------|
| **SkyWatch Unified API** | Unified solar activity, satellite visibility, and space weather intelligence. |
| **WaterSafe ZIP API** | ZIP-code based drinking water contamination intelligence. |
| **GridStatus Intelligence API** | Real-time power grid stress monitoring — demand, congestion, solar storm impact. |

---

## Tier 3

| Product | Description |
|--------|-------------|
| **NewsSignal API** | Global anomaly and disaster news aggregation — topic-clustered alerts. |
| **BioSurge Early Warning API** | Global biological threat detection — disease outbreaks, ecological anomaly signals. |
| **NeighborhoodScore API** | Local safety and environmental intelligence — crime, environment, health in one neighborhood score. |

---

## Tier 4

| Product | Description |
|--------|-------------|
| **MaritimeRisk API** | Global maritime hazard monitoring — vessel activity, port congestion, incident reports. |
| **FreightPulse API** | (In development) Freight and supply chain risk intelligence. |

---

## Project folders (this repo)

- `myair-api`
- `groundtruth-seismic-api`
- `skywatch-api`
- `watersafe-api`
- `gridstatus-api`
- `newssignal-api`
- `biosurge-api`
- `neighborhoodscore-api`
- `foodsafe-api` (unified food safety recall intelligence)

MaritimeRisk and FreightPulse may be added as separate projects when scoped.

---

## Recommended build order

| Phase   | Timeline   | Products |
|--------|------------|----------|
| **Phase 1** | Month 1–3  | FoodSafe Alert API |
| **Phase 2** | Month 3–5  | MyAir Local API |
| **Phase 3** | Month 5–8  | SkyWatch + WaterSafe (parallel) |
| **Phase 4** | Month 8+   | NeighborhoodScore + BioSurge |

See **PRODUCT_SPEC.md** for endpoint shapes, pricing bands, “what makes it new,” and primary sources per product.
