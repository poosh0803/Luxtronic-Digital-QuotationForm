# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Node.js/Express + PostgreSQL web app for building and managing PC build quotations: enter per-component details/prices, generate a shareable/printable quotation, and browse/search a history of past quotes. Frontend is static HTML/CSS/vanilla JS (no build step, no framework, no bundler).

## Commands

```bash
npm install
npm start          # node src/app.js, serves on $PORT (default 3000; README/.env commonly use 80)
npm test           # jest (all files under tests/**/*.test.js)
npx jest tests/utils/parse.test.js       # run a single test file
npx jest -t "returns 404"                # run tests matching a name pattern
```

Database (local Postgres via Docker):

```bash
cd docker && docker compose up -d        # starts luxtronic_postgres, runs docker/init.sql on first run only
```

`.env` must be created from `.env.example` and its `DB_*` values must match `docker/docker-compose.yml`'s `POSTGRES_*` settings. If reusing an existing Postgres data volume, init scripts won't rerun — create the database and pipe `docker/init.sql` in manually (see README for exact commands).

Two legacy one-off SQL migrations (`migration.sql`, `add-favorites-table.sql`) exist only for databases created before `*_price` columns and the `favorites` table were added to `docker/init.sql`; new setups don't need them.

PM2 is used for process management in production (`ecosystem.config.js`, process name `digital-quotation-form`); logs go to `logs/out.log` / `logs/error.log`.

## Architecture

- `src/app.js` — Express entrypoint. Serves `src/public/` as static assets, mounts the API router at `/api`, and defines the page routes (`/`, `/newQuotation`, `/records`, `/analytics`, `/centrecom`) that each `sendFile` a static HTML page. Also hosts two StaticICE proxy endpoints (`/api/staticice-proxy`, `/api/staticice-proxy-multipage`) used by the Centrecom price-lookup page to bypass CORS when scraping staticice.com.au.
- `src/route/middleware.js` — the entire `/api` surface as one Express router: quotation CRUD (`/quotation`, `/quotation/:id`, `/quotation/latest`, `/quotations`, `/records`) and favorites CRUD (`/favorites`, `/favorites/:quotationId`). Talks directly to Postgres via a `pg.Pool` created in this file (no ORM/query builder, no separate data-access layer). Quotation create/update accept either JSON or `multipart/form-data` (via `multer`) since the frontend submits a `FormData` object.
- `src/utils/parse.js` — `parseIntOrNull` / `parseFloatOrNull`: converts empty-string/missing form fields to SQL `NULL` instead of `0`/`NaN` before they hit the DB.
- `src/public/` — one static HTML page per screen (`index.html` = latest quotation, `newQuotation.html`, `records.html`, `analytics.html`, `centrecom.html`), each with a matching `js/<page>.js` file that does all DOM wiring and calls the `/api/*` endpoints directly with `fetch`. There is no shared frontend state management or component framework — each page's JS is self-contained.

### The quotation schema

`quotations` (see `docker/init.sql`) has a fixed, denormalized set of columns per PC component — `cpu`, `cpu_cooling`, `motherboard`, `ram`, `storage1`, `storage2`, `gpu`, `case`, `psu`, `sys_fan`, `os`, `monitor`, `others` — each with four columns: `<component>_details`, `<component>_price`, `<component>_unit`, `<component>_upgrade_note`. This is not a normalized line-items table; adding a new component slot means adding four new columns plus updating every place that lists them (both `INSERT`/`UPDATE` queries in `src/route/middleware.js`, and the corresponding frontend page(s) — e.g. `newQuotation.js`'s `partMapping`/`components` list).

The `favorites` table stores `quotation_id` only (no user accounts — favorites are global/shared across all clients), with `ON DELETE CASCADE` from `quotations` and a `UNIQUE(quotation_id)` constraint.

## Testing conventions

Tests mock `pg` at the module level (`jest.mock('pg', () => ({ Pool: jest.fn().mockImplementation(() => ({ query: mockQuery })) }))`) and drive the real Express app through `supertest` — no real database is used. `tests/routes/*.test.js` mirror the two resource groups in `middleware.js` (quotations, favorites); `tests/utils/parse.test.js` covers `parse.js` directly; `tests/app.test.js` covers the static page routes and the StaticICE proxy endpoints' input validation.
