# Cloudflare Tunnel — `*.rastacamp.com`

Each **product UI** gets its own hostname, for example `foodsafe.rastacamp.com`. Those names are normal DNS names under your zone **`rastacamp.com`** (one label before the zone, or several if you use something like `app.foodsafe.rastacamp.com`; this repo uses the simple `product.rastacamp.com` pattern).

Traffic flow: **Internet → Cloudflare edge → cloudflared on your machine → localhost port** where Docker publishes the **`*-web`** nginx container (that container already proxies `/api` to the matching API container).

## What you need

1. [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) installed on the same host where Docker (or your dev servers) runs.
2. A Cloudflare zone with **`rastacamp.com`** on the account that owns the tunnel.
3. **`Zone ID`** and **`Account ID`** are visible in the Cloudflare dashboard (Zone overview / Account sidebar). You do **not** have to put them in this repo; they are mainly for APIs, Terraform, or support. The tunnel CLI uses browser login or an API token when you run `cloudflared tunnel login`.

Do **not** commit API tokens, tunnel tokens, or `credentials-file` JSON into git. See `.gitignore` for `cloudflare/config.yml` and `*.json`.

## One-time tunnel

From repo root (or `cloudflare/`):

```bash
cloudflared tunnel login
cloudflared tunnel create gap-rastacamp
```

Cloudflare will show a **tunnel UUID** and write a **credentials file**, typically:

- Windows: `C:\Users\<you>\.cloudflared\<UUID>.json`
- macOS/Linux: `~/.cloudflared/<UUID>.json`

Copy `cloudflare/config.example.yml` to `cloudflare/config.yml`. Edit:

- `tunnel:` → your tunnel **UUID** (or the tunnel name, depending on cloudflared version; UUID is safest).
- `credentials-file:` → full path to that JSON file.

## DNS: one CNAME per hostname

For each hostname in `config.yml`, create a route in Cloudflare (DNS proxied **on**, orange cloud):

```bash
cloudflared tunnel route dns gap-rastacamp foodsafe.rastacamp.com
cloudflared tunnel route dns gap-rastacamp myair.rastacamp.com
# …repeat for every hostname you use
```

Alternatively, in **Zero Trust → Networks → Tunnels → your tunnel → Public hostnames**, add each hostname and the same local URL as in `ingress` (then you can use a minimal config or token-only run — either pattern is fine).

## Port clashes with local dev

If you use `docker compose --env-file docker/ports-alt.env`, the **web** ports become **15173–15181** and static **18090**. Update every `service:` URL in `config.yml` to match (or only include the services you actually run).

## Run the tunnel

```bash
cd cloudflare
cloudflared tunnel --config config.yml run
```

Leave this running while you want the sites public. For a service, use NSSM, systemd, or `cloudflared service install` per Cloudflare docs.

## Static HTML hub

`static.rastacamp.com` in the example maps to the **`static-sites`** nginx stack (default **8090**). Browsers still need `API_BASE_URL` in each HTML file pointing at the public API URL if you use those pages against a remote API (often `https://<product>.rastacamp.com` for same product, or the direct API host if you expose it separately).

## Security note

If you pasted **Account ID**, **Zone ID**, or any **token** into chat or a public issue, rotate **secrets** (API tokens, tunnel secrets); IDs alone are not as sensitive but keep tokens out of the repo.
