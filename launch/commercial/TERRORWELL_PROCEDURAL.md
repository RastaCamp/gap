# Terrorwell — procedural narrative & real-time UI

Terrorwell is a mobile horror experience (Expo/React Native). Target: **https://terrorwell.rastacamp.com** (web build or landing + app download).

## Stripe Pro

- **$4.99** — Payment Link: https://buy.stripe.com/4gM3cv2Ni8Bt2gvcdO8AE02
- Buy button ID: `buy_btn_1Th0IKGs5M6VYICJIA8GZCd1`

## Using Terrorwell-style generation for live game content

Procedural story pipelines can drive **real-time UI** and **game state** without hand-authored every branch:

### Architecture

```
User input / biometrics
        ↓
   Context bundle (mood, location, heart rate, choices)
        ↓
   LLM or rules engine → structured JSON scene
        ↓
   Entitlements check (free vs pro depth)
        ↓
   UI renderer (Flutter/React) updates screens + audio cues
```

### Structured scene contract (example)

```json
{
  "scene_id": "well_03",
  "title": "Something moved below",
  "body": "The rope trembles…",
  "choices": [
    { "id": "climb", "label": "Climb down", "risk": 0.7 },
    { "id": "leave", "label": "Run", "risk": 0.2 }
  ],
  "ui": {
    "theme": "red_pulse",
    "haptic": "heavy",
    "sound": "drip_loop"
  },
  "biometric_modifiers": {
    "elevated_hr": { "intensity": 1.2, "extra_line": "Your pulse is loud in the dark." }
  }
}
```

### Biometric hooks

| Signal | Source | Game use |
|--------|--------|----------|
| Heart rate | Watch / phone health API | Increase tension copy, spawn events when HR > baseline |
| Time of day | System clock | Night mode scarier variants |
| Motion | Accelerometer | “Footsteps sync” when user walks |
| Location coarse | Geofence | Place-name insertion in prose |

Always disclose health data use; keep processing on-device when possible.

### Commercial angles

- **Licensed engine** — sell “Terrorwell Core” to indie studios
- **Brand campaigns** — location-based horror promos
- **API tier** — `/v1/scene` returns next beat from prompt + telemetry
- **Pro tier** — longer arcs, voice, custom monsters, export scripts

### Competitors

Generic chat apps — win with **horror-tuned pacing**, **safety rails**, **offline chapters**, and **mobile-native haptics**.

See `Desktop/projects/terrorwell` for the app repo; deploy web landing on Cloudflare Pages when ready.
