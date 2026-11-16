# Athleta — gym operations demo

An admin-first gym booking application using Next.js App Router, React, TypeScript, PostgreSQL and Drizzle. This is a local demo with fictional people, classes and statistics, not a production service.

## What it covers

Administrators manage scheduled classes, members, reservations, class rosters and attendance. Members register, browse the timetable, book/cancel their own places, review booking history and edit their profile. Server-side session authentication separates these roles; hiding a button is not the authorization boundary.

Gym dates and times use **Australia/Melbourne**, including daylight-saving changes. API timestamps represent concrete instants with timezone information, not recurring weekly templates. Payments, billing, recurring-schedule generation, email delivery, multi-location administration and migration of legacy MongoDB data are out of scope.

## Prerequisites

- Node.js **22.13 or newer**; use Node 22 LTS for the CI-matching development environment (`.node-version`).
- npm 10 or newer. Install reproducibly from the root lockfile with `npm ci`.
- Docker Engine/Desktop with Docker Compose v2 and a running Docker daemon.
- Ports **3000** (Next.js) and **5434** (local PostgreSQL) available. PostgreSQL deliberately avoids port 5433, which may be used by an unrelated Buildkite database.

There is one root npm project. The superseded `api/` and `react/` applications have been removed.

## Start the local demo

1. Copy `.env.example` to `.env` at the repository root (PowerShell: `Copy-Item .env.example .env`; macOS/Linux: `cp .env.example .env`). Keep real credentials out of Git.
2. Run the following from the repository root:

```sh
npm ci
docker compose up -d --wait postgres
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://127.0.0.1:3000/login` on your own machine. Development binds to loopback by default. In an Amp orb, expose the app through an Amp portal rather than sharing a loopback URL.

The seed is **explicit and empty-database-only**. It creates synthetic members, past/future classes and booking history; it does not reset existing edits. An already populated database is left alone. The local-only sign-in accounts are:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@athleta.local` | `AthletaDemo123!` |
| Member | `member@athleta.local` | `AthletaDemo123!` |

Never use these accounts, passwords or Compose database credentials for a public environment. Seeding does not run automatically on app startup.

## Database and environment

`compose.yaml` runs PostgreSQL 17, exposing **127.0.0.1:5434 → container 5432**. Its named `postgres-data` volume persists across container restarts. Use `docker compose stop postgres` to stop it without discarding data. Removing the volume destroys the demo database; no normal setup or test command does that.

- `DATABASE_URL`: app/migration/seed connection string. The local example points to database `athleta`, with local-only user/password `athleta`.
- `TEST_DATABASE_ADMIN_URL`: test-only maintenance connection, normally database `postgres` on the same local server. Its role needs `CREATE DATABASE` permission and ownership of the databases it creates. The Buildkite wrapper supplies this automatically for a disposable container; no shared CI database secret is required.

Next.js loads the local environment for the app; the migration/seed commands and feature harness load root `.env` for local use. Process-provided values take precedence. Do not point feature testing at a production PostgreSQL server, even when using a maintenance database. No MongoDB server or Mongo-to-PostgreSQL migration is required.

## Commands and tests

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run Next.js on loopback port 3000; `-- --port 3002` selects another port |
| `npm run build` | Create the production application build |
| `npm start` | Serve an existing production build on loopback port 3000 |
| `npm run lint` | ESLint/Next.js/TypeScript rules; warnings fail |
| `npm run typecheck` | Strict TypeScript checking without emitting files |
| `npm run db:migrate` | Apply the checked-in Drizzle migrations explicitly |
| `npm run db:seed` | Seed an empty demo database explicitly |
| `npm run test:unit` | Vitest rules tests; no database/browser required |
| `npm run test:feature` | Playwright API/browser features against a private app and temporary database |

Install the Chromium test browser once before running browser features:

```sh
npx playwright install chromium
npm run test:unit
npm run test:feature
```

On Linux CI, `npx playwright install --with-deps chromium` also installs required OS libraries; this needs an appropriately provisioned agent or package-install privileges.

Feature tests **never reset the demo database**. Each invocation/shard generates a unique `athleta_test_<random>` database, verifies that connection, applies migrations and seeds it. Playwright builds and starts the production app on a free loopback port and waits for `/api/health` before testing. Cleanup stops the app and drops only the database name generated by that invocation, on success, test failure or handled interruption. An uncatchable process/host termination can leave an orphan `athleta_test_*` database; inspect its ownership and ensure no test job is using it before removing it manually. Tests do not use `DATABASE_URL` to select their test database.

Keep one worker per feature shard because a shard shares its database. To reproduce the two CI shards locally, run these separately (not simultaneously in the same checkout, because each feature invocation writes the checkout-local `.next` production build). Use a separate checkout when serving a production preview:

```sh
npm run test:unit -- --shard=1/2
npm run test:unit -- --shard=2/2
npm run test:feature -- --shard=1/2 --workers=1
npm run test:feature -- --shard=2/2 --workers=1
```

`npm run test:feature -- --list` lists the real specs without starting PostgreSQL or the app. Feature reports are written to `playwright-report/`; failure traces/screenshots go to `test-results/`. Review traces with `npx playwright show-trace <trace.zip>`.

## Architecture and delivery

`src/app/` owns App Router pages and `/api` routes. `src/components/` contains UI components. `src/lib/` holds database, authentication and business rules; `@/` resolves to `src/`. `drizzle/` contains migrations, with explicit migration/seed entrypoints in `scripts/`. `tests/unit/` checks pure rules; `tests/feature/` exercises real persistence, role boundaries, booking capacity and browser workflows. The detailed request/response and data contracts are in [docs/api-contract.md](docs/api-contract.md).

Work is delivered through separate, ordered feature branches and Entire trails/linked PRs: foundation → runtime/persistence/developer tooling → admin operations → member self-service → integrated verification. The README refresh has its own docs-only trail after commands are checked against the combined app. See [the modernisation plan](docs/plans/modernisation.md) for ownership and acceptance scope. Published branch ancestry is coordinated independently of local slice checkouts; unpublished commits are transferred as archives/patches, not assumed to exist on another machine.

`.buildkite/pipeline.yml` runs real lint/typecheck, **two unit shards and two feature shards**, followed by a real production build. Hosted Linux agents need Node 22, independent checkouts, a working Docker daemon and browser-install privileges. `.buildkite/test-feature.sh` starts a job-local PostgreSQL 17 container on a free loopback port with disposable credentials and tmpfs storage, supplies `TEST_DATABASE_ADMIN_URL`, and removes the container afterward. It never mounts the local demo volume. Four available test agents allow both test classes to run together. Buildkite's zero-based shard index is converted to the runners' one-based index at job runtime; escaped dollars in the pipeline preserve that expansion.

Packaging, staging deployment, staging smoke checks, the master-only production approval gate and production deployment remain explicitly labelled **`(mock)`**. They only print `MOCK` messages. Passing these stages is not evidence of a deployment or smoke test. Publishing through the Entire mirror can automatically trigger the existing GitHub-linked Buildkite pipeline; no real deployment is configured or authorized by those pushes.

## Troubleshooting

- **Docker cannot connect or PostgreSQL is unavailable:** start Docker, run `docker compose ps` and `docker compose logs postgres`, and confirm port 5434 is free. Do not stop an unrelated database to free a port. If you change the Compose port, update both local connection URLs in `.env` to match.
- **Tables are missing or demo login fails:** run `npm run db:migrate`, then `npm run db:seed` against the intended local database. A populated database intentionally skips seeding; it will not restore an edited account or overwrite your data.
- **Feature tests report a missing maintenance URL or database permission:** copy the test URL from `.env.example` into your local `.env` and use the local Compose server. Its demo role can create temporary test databases. Never solve this by granting test access to a production server.
- **Chromium is missing:** run `npx playwright install chromium`. Linux hosts may also need `npx playwright install --with-deps chromium` and permission to install OS packages.
- **Node or startup errors:** check `node --version` against `.node-version`, then run `npm ci`. `npm start` requires a successful `npm run build`; use `npm run dev` for development. Stop another app on port 3000 or choose `npm run dev -- --port 3002`.

## Legacy project history

The original project explored replacing manually maintained group-training timetables and phone/paper signups, including class discovery, bookings, account editing and attendance tracking. It used React 15/Create React App, Express and MongoDB. The rewrite keeps that gym-booking purpose but replaces the runtime; there is no automatic data migration. The [original presentation](https://docs.google.com/presentation/d/1CHX9-wuKX2Up9qWPSobCOzV4RdjpDzKCRQ78UtRbA4k/edit?usp=sharing) remains historical context; old hosting links are not a supported deployment of this rewrite.
