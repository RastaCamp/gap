# External apps & games — launch checklist

Repos outside **gap** that need dev APK, Stripe, and rastacamp.com DNS.

| App | Local path | Pro price | DNS | Dev APK |
|-----|------------|-----------|-----|---------|
| Rep Battle | Clone `RastaCamp/rep-battle` | $4.99 | repbattle.rastacamp.com | `flutter build apk --debug` + pro flag |
| Align | `../align` | $4.99 | align.rastacamp.com | Gate dice modes; Capacitor build |
| Crumble | `../crumble` | $4.99 | crumble.rastacamp.com | Pro toggle → entitlements |
| Terrorwell | `../terrorwell` | $4.99 | terrorwell.rastacamp.com | Expo dev client / EAS |
| Punchie | TBD | $7.99/mo | punchie.rastacamp.com | Needs cloud server (not PC-only) |
| Quotes | TBD | $4.99/mo | — | — |
| Audiobook Creator | TBD | $7.99/mo | — | Gate book editor features |
| Ascension | tunnel legacy | $4.99 | ascension.rastacamp.com | — |

Stripe configs for all: **`launch/stripe-products.json`** → `appsAndGames`.

## Dev APK pattern (Capacitor / Flutter)

1. Enable **pro for dev**: env `DEV_PRO=true` or hidden settings gesture.
2. Embed Stripe Payment Link or in-app purchase SKU matching live product.
3. Build: `cd android && ./gradlew assembleDebug` (Capacitor) or `flutter build apk --debug`.
4. Ship APK from GitHub Releases on **RastaCamp** org.

## Rep Battle fix (in-game quit)

After quit from match menu → route to **MainMenu**, not black “no current match” screen. Per-mode save/resume slots on main menu.

## DNS conflict rule

If deploy fails (name taken on another account), use **`{name}s.rastacamp.com`** and update CNAME in Leerie zone.
