# Athleta

A local gym booking demo: admins manage classes, members and attendance; members book, cancel and view their history. Gym times use Australia/Melbourne.

```text
Browser -> Next.js / TypeScript -> Drizzle -> PostgreSQL
           src/app/               src/lib/   drizzle/ (migrations)
           src/components/ (UI)
```

## Getting started

You'll need Node.js 22.13+, npm and Docker Compose.

```sh
cp .env.example .env
npm ci
docker compose up -d --wait postgres
npm run db:migrate
npm run db:seed
npm run dev
```

Open [the login page](http://127.0.0.1:3000/login):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@athleta.local` | `AthletaDemo123!` |
| Member | `member@athleta.local` | `AthletaDemo123!` |

Seeded records are fictional; credentials are for local use only. Seeding skips populated databases. PostgreSQL data persists across restarts; stop it without deleting data:

```sh
docker compose stop postgres
```

Connection settings live in `.env` (PostgreSQL: `127.0.0.1:5434`). Rerun `npm run db:migrate` after schema changes.

## Checks

```sh
npm run lint
npm run typecheck
npm run test:unit
```

Keep PostgreSQL running for API/browser tests; install Chromium once:

```sh
npx playwright install chromium
npm run test:feature
```

Feature tests create/drop a temporary database using `.env`'s `TEST_DATABASE_ADMIN_URL` (requires CREATE DATABASE), leaving your demo database alone. They build the production app; use a separate checkout from production previews because both write `.next`.

For a production preview:

```sh
npm run build && npm start
```

Buildkite checks the app, but **(mock)** release steps only print messages—nothing is deployed. This isn't production-ready; payments, email delivery and MongoDB migration aren't included.

More: [API contract](docs/api-contract.md), [design notes](DESIGN.md), [delivery plan](docs/plans/modernisation.md).
