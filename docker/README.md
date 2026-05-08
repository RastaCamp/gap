# Docker

Each **API** is a Bun container; each **web** UI is nginx serving the Vite build and proxying `/api/*` to the matching API service on the Docker network.

## Prerequisite

- Install **Docker Desktop** (Windows/macOS) or Docker Engine + Compose (Linux).
- **Start Docker Desktop** (or the daemon) before running compose. If `docker version` shows “cannot connect to the Docker API”, the engine is not running.

## Quick start (one product)

From the **repository root**:

```bash
docker compose up --build foodsafe-api foodsafe-web
```

- API: [http://localhost:3001](http://localhost:3001)
- UI (proxied API): [http://localhost:5173](http://localhost:5173)

If those **host ports are already in use** (for example Bun + Vite still running), publish on alternate ports:

```bash
docker compose --env-file docker/ports-alt.env up --build -d foodsafe-api foodsafe-web
```

Then open [http://localhost:13001](http://localhost:13001) (API) and [http://localhost:15173](http://localhost:15173) (UI). You can also set individual `GAP_PORT_*` variables in a `.env` file next to `docker-compose.yml`.

Copy `foodsafe-api/.env.example` to `foodsafe-api/.env` and adjust variables; to load them in Compose, use an `env_file` entry (see `docker-compose.yml` comments) or export vars before `up`.

## Full stack

```bash
docker compose up --build
```

Starts all nine APIs, nine frontends, and **static-sites** on port **8090** (raw HTML consoles; set `API_BASE_URL` in each page’s script to reach an API from the browser).

## Data

Named volumes persist each product’s SQLite `data/` directory across restarts.

## Save points (git tags)

Example: `git tag -l 'savepoint/*'`
