# Luxtronic Digital Quotation Form

A web app for building and managing PC build quotations — enter component
details and prices, get a shareable/printable quotation, and keep a
searchable history of past quotes.

## Features

- **New Quotation** — build a quote component-by-component (CPU, cooling,
  motherboard, RAM, storage x2, GPU, case, PSU, fans, OS, monitor, other)
  with details, quantity, unit price, and optional upgrade notes per part.
- **Latest Quotation view** — shows the most recent quote (or any past one
  via the dropdown), with an optional toggle to reveal individual part
  prices, and a print-formatted layout.
- **Quotation Records** — table of all quotations with view, edit,
  duplicate, delete, and favorite actions, plus filtering.
- **Analytics** — aggregate stats/trends across saved quotations.
- **Centrecom product search** — proxy endpoint that queries StaticICE to
  help look up current part prices without hitting CORS restrictions.

## Tech stack

- Node.js + Express (`src/app.js`, routes in `src/route/middleware.js`)
- PostgreSQL (via `pg`)
- Static HTML/CSS/vanilla JS frontend (`src/public/`)
- Docker Compose for local Postgres (`docker/`)

## Getting started

### 1. Start the database

```bash
cd docker
docker compose up -d
```

This starts a Postgres container (`luxtronic_postgres`) and, **on first run
only**, runs `docker/init.sql` to create the `quotations` and `favorites`
tables.

> Postgres only runs init scripts against an empty data volume. If you're
> reusing an existing `docker_postgres_data` volume that was initialized for
> a different database, the target database won't exist yet. Create it
> manually and re-apply the schema:
> ```bash
> docker exec -it luxtronic_postgres psql -U luxtronic_user -d postgres -c "CREATE DATABASE luxtronic_db;"
> docker exec -i luxtronic_postgres psql -U luxtronic_user -d luxtronic_db < docker/init.sql
> ```

### 2. Configure environment variables

Copy `.env.example` to `.env` and adjust to match your database (the values
must match `docker/docker-compose.yml`'s `POSTGRES_*` settings):

```bash
cp .env.example .env
```

```env
DB_USER=luxtronic_user
DB_HOST=localhost
DB_NAME=luxtronic_db
DB_PASSWORD=luxtronic_password
DB_PORT=5432
PORT=80
```

### 3. Install dependencies and run

```bash
npm install
npm start
```

The app is served at `http://localhost:<PORT>` (default `80`).

### Running with PM2

To keep the app running in the background and restart it automatically,
use the included [`ecosystem.config.js`](ecosystem.config.js):

```bash
npm install -g pm2
pm2 start ecosystem.config.js          # production
pm2 start ecosystem.config.js --env development  # dev, with file watching
```

Useful commands:

```bash
pm2 status                # process status
pm2 logs digital-quotation-form   # tail logs
pm2 restart digital-quotation-form
pm2 stop digital-quotation-form
pm2 delete digital-quotation-form
```

Logs are written to `logs/out.log` and `logs/error.log`.

## Database migrations

Existing databases created before certain features were added may need:

- `migration.sql` — adds `*_price` columns per component to `quotations`.
- `add-favorites-table.sql` — adds the `favorites` table.

Both are idempotent-safe to run against an existing database:

```bash
docker exec -i luxtronic_postgres psql -U luxtronic_user -d luxtronic_db < migration.sql
docker exec -i luxtronic_postgres psql -U luxtronic_user -d luxtronic_db < add-favorites-table.sql
```

New setups using the current `docker/init.sql` already include these, so
this is only needed when upgrading an older database.

## Project structure

```
src/
  app.js                 Express app, page routes, StaticICE proxy
  route/middleware.js     /api/* quotation & favorites endpoints
  public/
    index.html            Latest quotation view
    newQuotation.html      Create a quotation
    records.html           Quotation history / management
    analytics.html         Aggregate stats
    centrecom.html          Part price lookup
    css/, js/, images/
docker/
  docker-compose.yml      Postgres service
  init.sql                 Schema for a fresh database
migration.sql              *_price columns migration (legacy DBs)
add-favorites-table.sql    favorites table migration (legacy DBs)
ecosystem.config.js        PM2 process config
```
