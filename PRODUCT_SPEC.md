# Product spec — endpoints, tiers, sources, pricing

Single source of truth for API shapes, differentiators, target buyers, and pricing. Use this to keep docs, landing pages, and product copy aligned.

---

## Tier 1 · Broad appeal · Gov APIs available

### MyAir Local API

**Endpoint:** `GET /environment?lat=39.28&lng=-76.61&layers=aqi,radiation,toxics`

Hyperlocal environmental intelligence stacking EPA AirNow (AQI), EPA RadNet (radiation monitoring), CAMS chemical air forecasts, and National Toxic T-Map industrial releases into a single coordinate-based query. Returns a unified "Environmental Risk Score" that doesn't exist anywhere today — people currently have to visit 4 separate government sites.

**Primary sources:** EPA AirNow API · EPA RadNet · CAMS ECMWF · National Toxic T-Map · USGS Water Quality

**What makes it new:** Single-coord query for all hazards · Composite risk score · Plain-English alert summaries · Historical trend endpoint · Asthma/health risk context

**Target buyers:** Real estate apps · Smart home devices · Health & fitness apps · Parent/family apps · Outdoor activity platforms

**Pricing:** $19–$199/mo · Pay-per-call option for mobile devs

---

### GroundTruth Seismic API

**Endpoint:** `GET /events?lat=34.05&lng=-118.2&radius_km=500&min_mag=2.5`

Enriched seismic + geophysical intelligence layering USGS earthquake data, IRIS seismic monitoring, VAAC volcanic ash advisories, and global incident feeds. Adds anomaly context like correlated animal behavior reports and infrastructure risk scores per event. USGS data is already open — the value is in the cross-source correlation layer.

**Primary sources:** USGS Earthquake API · IRIS Seismic Monitor · VAAC Volcanic Ash · RSOE-EDIS Disaster Feed · Global Incident Map

**What makes it new:** Unified event type schema · Infrastructure proximity score · Aftershock probability field · Volcanic + seismic combined timeline · Webhook alerts per polygon

**Target buyers:** Insurance risk platforms · Emergency management apps · Utility companies · Construction/infrastructure firms · Travel safety apps

**Pricing:** $49–$499/mo · B2B focus — insurance/utility contracts anchor revenue

---

## Tier 2 · Strong market · Build after Tier 1

### SkyWatch Unified API

**Endpoint:** `GET /sky?lat=39.28&lng=-76.6&include=solar,moon,satellites,aurora`

Single endpoint combining NOAA Space Weather (solar flares, CME alerts, Kp index), moon phase data, N2YO satellite pass times, and planetary alignment events. Returns a "tonight's sky" digest with aurora probability, ISS pass windows, and solar storm impact risk.

**Primary sources:** NOAA SWPC API · N2YO Satellite API · Moon Giant · Heavens Above · SpaceWeather.com

**What makes it new:** All sky events in one response · Aurora probability by coords · Grid disruption risk from solar · Satellite flare time predictions · Plain-language sky summary field

**Target buyers:** Astrophotography apps · Weather apps adding sky layer · Camping/outdoor apps · Ham radio operators · Prepper/off-grid platforms

**Pricing:** $9–$79/mo · Consumer-friendly · Hobbyist free tier

---

### WaterSafe ZIP API

**Endpoint:** `GET /water?zip=21201&return=contaminants,risk_score,violations`

ZIP-code-level tap water contaminant lookup combining EWG Tap Water Database, EPA local drinking water reports, USGS water quality data, and state-level MDE reports. Returns plain-English contaminant list with health risk context, violation history, and composite safety score.

**Primary sources:** EWG Tap Water DB · EPA SDWIS · USGS National Water Dashboard · State MDE reports · CDC environmental exposure maps

**What makes it new:** ZIP → contaminant list in one call · Health risk scoring per chemical · Violation timeline endpoint · Filter recommendation field · Comparison vs. national avg

**Target buyers:** Real estate platforms (huge) · Home buyer apps · Water filter companies · Pregnancy/baby apps · Landlord transparency tools

**Pricing:** $29–$249/mo · Real estate integration = highest LTV customer

---

### GridStatus API

**Endpoint:** `GET /grid?state=MD&include=outages,demand,solar_risk,alerts`

Power grid intelligence combining EIA Grid Monitor live supply/demand data, PowerOutage.us state-level failure tracking, NOAA geoelectric field risk (solar storm grid impact), and DOE energy emergency alerts. Returns current grid health per state/ISO region with solar weather risk context.

**Primary sources:** EIA Open API · PowerOutage.us · NOAA SWPC Geoelectric · DOE Energy Alerts · NERC reliability data

**What makes it new:** Grid health + solar risk in one response · Outage count + demand stress combined · State/county/ISO level · Webhook for threshold alerts · Historical reliability trends

**Target buyers:** Data centers · EV charging networks · Solar/battery companies · Smart home platforms · Utility tech startups

**Pricing:** $99–$999/mo · B2B focus · High-value infrastructure clients

---

## Tier 3 · Niche but profitable

### NewsSignal Aggregator API

**Endpoint:** `GET /news?topics=climate,finance&sentiment=true&dedupe=true`

Aggregated, deduplicated, categorized news feed from BBC, Reuters, AP, MarketWatch, TechCrunch, Al Jazeera, and others. Sentiment scoring, topic clustering, cross-outlet coverage scoring (how many sources covered an event = signal strength).

**Sources:** BBC · Reuters · AP · TechCrunch · MarketWatch · Al Jazeera · CNN · XXL Mag · The Source · WJZ-13

---

### BioSurge Early Warning API

**Endpoint:** `GET /biosurge?region=US-East&signals=animals,zoonotic,avian`

Cross-species disease early warning combining CDC zoonotic outbreak data, APHIS animal quarantine zones, ProMED wildlife disease alerts, BirdCast migration anomalies, and marine mammal stranding reports. Correlates unusual animal behavior with emerging human health risks.

**Sources:** CDC Zoonotic · APHIS · ProMED · BirdCast · Marine Mammal Center · HawkCount

---

### NeighborhoodScore API

**Endpoint:** `GET /score?address=123+Main+Baltimore&factors=crime,air,water,health`

Composite neighborhood intelligence: crime heatmaps (OpenBaltimore/CityProtect), CDC chronic disease prevalence, EPA air quality, water safety scores, sex offender registry data into a single address-level score. Walk Score for walkability — this is the safety/health equivalent.

**Sources:** OpenBaltimore · CityProtect · SpotCrime · CDC PLACES · EPA AirNow · EWG Water · NSOPW

---

## Tier 4 · Long-term / complex

### MaritimeRisk + FreightPulse API

Cargo, port congestion, rail incidents, hazmat pipeline. Combines VesselFinder AIS, gCaptain incidents, USCG NAVCEN, Rail Incidents Dashboard, PHMSA pipeline data. High-value to logistics; requires licensing AIS data. Best after Tier 1–2 are live.

**Sources:** VesselFinder · MarineTraffic · gCaptain · USCG NAVCEN · FRA Rail Incidents · PHMSA · FreightWaves

---

## Recommended build order

| Phase   | Timeline   | Products |
|--------|------------|----------|
| Phase 1 | Month 1–3  | FoodSafe Alert API |
| Phase 2 | Month 3–5  | MyAir Local API |
| Phase 3 | Month 5–8  | SkyWatch + WaterSafe (parallel) |
| Phase 4 | Month 8+   | NeighborhoodScore + BioSurge |

All sources have RSS/JSON. High consumer demand. Fastest to ship. Builds credibility with real public-good value.
