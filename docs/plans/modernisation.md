# Admin-first modernisation

The original React 15/Create React App and Express/Mongoose application was incomplete. Class and booking writes were public, attendance and member administration were missing, and running the app required an externally configured MongoDB instance.

The implemented stack is Next.js with PostgreSQL and Drizzle, with PostgreSQL running locally through Docker Compose. A local, explicitly seeded demo is the target; this is not a production rollout or a data migration. Entire push access is resolved. Contract details live in docs/api-contract.md; the superseded api/ and react/ trees are removed in the integration slice.

The approved visual direction is calm operations with compact density: forest navigation, chalk working surfaces, restrained court-lime accents for live activity, and clear green check-in actions. Preserve readable type, consistent dropdown-arrow insets, and separate admin/member navigation. Use the locally installed Impeccable and Unslop skills. The approved interactive reference is https://ampcode.com/artifacts/visuals/athleta-calm-operations-a60b021c-cfac-40ad-bd23-467991e1d040.

## Reviewable delivery slices

1. **Design and delivery foundation** (`modernise/foundation`): install the complete upstream Impeccable skill locally, record product context, and establish this plan and the API contract. No runtime behavior changes.
2. **Next.js runtime and persistence** (`modernise/runtime`, based on foundation): establish the Next.js/TypeScript app, PostgreSQL Compose service, Drizzle migrations, explicit demo seed, session authentication and roles, and root developer/test commands. Add unit and API feature specs and enable real parallel Buildkite checks. Each feature job provisions disposable PostgreSQL; Playwright builds and starts the production app.
3. **Admin operations** (`modernise/admin-workspace`, based on runtime): implement persistent class scheduling, member management, capacity-safe bookings, dashboard summaries, and rosters/check-in through the Next.js server boundary. Build the responsive workspace from the approved prototype, with feature specs for the admin workflows and authorization.
4. **Member self-service** (`modernise/member-self-service`, based on admin workspace): complete registration, timetable browsing, booking/cancellation, upcoming and past bookings, and profile editing, using the same design system and real API.
5. **Integrated verification** (`modernise/integration`, based on member self-service): verify both-role browser coverage and responsive rendering, remove the superseded api/ and react/ trees, and reconcile the delivery plan. Keep all release/deployment steps mocked; real deployment needs separate authorization. Startup documentation remains in the next, separate README trail.
6. **Developer README** (`docs/rewrite-startup`, based on the verified application): publish the README in a separate trail. Include prerequisites, environment and PostgreSQL setup, migrations and explicit demo seed, login credentials, startup/build/test commands, architecture, common failures, and the distinction between real tests and mock deployments. Verify the commands against the finished application before publishing.

Each feature has its own Amp thread. The master thread owns integration, publication through the existing Entire remote, and the PR/trail ledger. Feature threads work in separate checkouts; use file transfers for unpublished changes, never assume an orb can see local commits. Do not merge PRs or deploy without the user's authorization.

Parallel implementation ownership: the operations thread owns `src/lib/`, `src/app/api/`, `drizzle/`, `drizzle.config.ts`, `scripts/seed.ts`, `scripts/migrate.ts`, and `tests/unit/`; the workspace thread owns application pages, layouts, CSS, public assets and `src/components/`; the workflow thread owns root package/lock/configuration, Compose, developer documentation, `.buildkite/`, `scripts/test-feature.ts`, and `tests/feature/`. The master integrates each slice and runs combined verification. Runtime and feature delivery can be stacked for review without merging the pipeline integration trail.

## Runtime decisions

Use HTTP-only session cookies and server-side authorization, not a role switch masquerading as authentication. Members can access only their own account and bookings. Admins can manage members, scheduled sessions, rosters, and attendance. Class instances use concrete timestamps rather than ambiguous weekly templates. Display gym times in Australia/Melbourne, with explicit timezone handling when editing.

Bookings must enforce capacity and prevent duplicate active reservations. Cancelling a class preserves its history and cancels active reservations. Historical attendance and reporting must be derived from stored records. Delete/archive semantics must not silently erase booking history.

Demo seeding is explicit and repeatable without overwriting existing data. Bind development services locally by default. Document demo credentials as local-only; do not provision a known-password administrator silently in production.

## Verification and mirror testing

### Basic specs

Keep the initial suite small and behaviour-focused. Add specs with the feature that implements them, not placeholder passing tests. Use Vitest for fast unit specs and Playwright for browser-feature specs against the running Next.js app and an isolated PostgreSQL test database. Exercise real persistence and server-side authorization, rather than mocking those boundaries.

**Unit specs** cover rules that are meaningful without a browser or database:

- A class requires positive integer capacity and duration; zero, negative and fractional values are rejected.
- Dashboard day boundaries follow Australia/Melbourne. A session exactly at the start of the day is included; one at the next midnight is excluded. Cover a daylight-saving transition so a fixed 24-hour assumption fails.
- Attendance is available at the class start, but not before it. A cancelled reservation cannot be marked attended. Test just before and exactly at the boundary with a fixed clock.

**Feature specs** prioritise the admin side:

- An admin creates a class, finds it through schedule search, edits its time/capacity, and sees the saved values after reload. Reducing capacity below current bookings is rejected without changing the class.
- An admin creates a member and deactivates them. Deactivation prevents login and new bookings, invalidates their existing session, and preserves booking history.
- An admin opens a roster, filters to expected members, checks one in and undoes it. Roster and dashboard counts reflect the persisted attendance after reload. A finished class supports marking a no-show; an upcoming class rejects attendance changes.
- Cancelling a class cancels active reservations and removes it from active dashboard totals while retaining its history.
- A member registers, books a future class, sees it in upcoming bookings, cancels it and can rebook the released place. Past attended classes appear in their history.
- A duplicate booking is rejected. With one place remaining and two members booking concurrently, exactly one succeeds and the class stays within capacity.
- A member cannot access admin pages or mutate admin resources directly, including another member's bookings. Registration and profile editing cannot grant admin privileges. An unauthenticated request is also rejected.

Use fictional fixtures and independent expected counts. Give each feature shard its own test database and production app process; fixture resets must never touch the development/demo database. Unit specs have no external services. Run browser specs with one worker per CI shard initially, avoiding shared-database contention; two Buildkite shards provide job-level parallelism. Inspect desktop and mobile rendering separately, including keyboard focus, dropdown spacing, and attendance states; do not replace behaviour assertions with screenshots.

### Buildkite scaffold

`.buildkite/pipeline.yml` defines lint/typecheck, two parallel unit shards, two parallel feature shards, a production-build check, and a mock package → staging → smoke → manual production approval → production flow. Independent checks run together; the build waits for all checks and test shards to pass. Only master shows the mock production gate. Publishing through the mirror can trigger the existing GitHub-linked CI automatically; it does not authorize a manual build or deployment.

Real checks now run with the root commands: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:unit -- --shard=1/2`, `npm run test:feature -- --shard=1/2 --workers=1`, and `npm run build`. Both test runners use one-based shard numbers; Buildkite supplies a zero-based job index, converted at job runtime. Each shard installs from the lockfile independently. Agent capacity of at least four permits both test classes to run concurrently. Feature shards need independent checkouts because each builds its own `.next` output.

The feature harness creates a random database, applies migrations and fictional seed records, builds/starts its own app, and writes Playwright reports/traces to the artifact paths in the YAML. `.buildkite/test-feature.sh` starts a PostgreSQL 17 container on a free loopback port, using tmpfs rather than the persisted local demo volume, and removes it after the job. Its local-only credentials are disposable; no shared CI database secret is needed. Hosted Linux agents need Node 22, Docker and browser-install privileges. Mock steps only print explicit `MOCK` messages and require no cloud credentials; green mock steps are not evidence of a real deployment or smoke test. Replace them only with separate approval for the real external action.

Combined local verification passes 12 unit specs and 16 API/browser feature specs across two shards, plus lint, strict typechecking and production builds. Desktop and mobile captures were inspected against the approved prototype; the independent finish review returned `ship` with no material fixes. Startup commands use actual Docker Compose PostgreSQL 17. Separate runtime-only and admin-only checkouts also passed their respective feature suites. This is local evidence, not a claim that every remote CI run has completed or that any trail has merged.

Publish each branch through origin (`entire://aws-ap-southeast-2.entire.io/gh/jonathanly/athleta-gym-booking-app`) and verify its SHA on GitHub. Prefer an Entire trail with a linked CI PR where access permits; otherwise create a GitHub PR and record the Entire API access limitation. Do not bypass a failed mirror push with a direct GitHub push.

## Initial state

- Local and GitHub master both started at a17b730dcd556e2e881a61f8e9f7ac446dfe0202.
- Entire push access is resolved using the GitHub login. The standalone pipeline is published on `ci/buildkite-integration`, linked to Entire trail #1 and GitHub PR #5. Use its sentence-case emoji labels with `(mock)` suffixes as the CI baseline, replacing mock checks as their real commands become available. Deployment remains mocked.
- No live Amp runners are connected. Feature threads use orbs and receive the exact foundation as an uploaded archive before editing.
- Impeccable 4.9.2 is copied from pbakaus/impeccable, including its license, reference files, agents, and scripts. No automatic hooks were installed.
