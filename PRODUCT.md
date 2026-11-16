# Athleta

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Gym administrators are the primary audience for this rewrite. They maintain the class schedule, manage members and bookings, and record attendance. Members browse classes and manage their own bookings and account.

## Product Purpose

Replace manual group-training schedules and phone or paper signups with a usable booking application. The existing app is incomplete; this rewrite prioritizes completing basic administrative workflows over marketing pages.

## Operating Context

This repository is also a test bed for Entire's GitHub mirror. Deliver changes in logical, separately reviewable feature branches and PRs/trails. The coordinating Amp thread is https://ampcode.com/threads/T-01a1e1d4-8dc1-7151-bfe5-b79862494882.

## Capabilities and Constraints

Preserve the Athleta gym-booking purpose while replacing the old implementation. Keep admin and member permissions distinct. Persist real changes rather than building a static dashboard. All sample members, classes, and statistics are demo data, not claims about a real gym.

The agreed stack is Next.js with PostgreSQL and Drizzle, with local PostgreSQL provided by Docker Compose. The user has approved implementation, and Entire push access is resolved. No production deployment or legacy MongoDB migration is included. Payments, memberships/billing, recurring-schedule engines, email delivery, and multi-location administration are outside the basic-feature rewrite.

The approved design uses compact density, forest navigation, chalk working surfaces, restrained court-lime live-activity accents and clear green check-in actions. Preserve consistent dropdown-arrow padding. Use the project-local Impeccable and Unslop skills for design work.

The rewrite brief in docs/plans/modernisation.md includes basic unit and browser-feature specifications, weighted toward admin workflows. Buildkite splits both test classes into parallel shards. Enable real checks with the runtime and test harness; deployment steps remain labelled mocks with no external side effects.

## Evidence on Hand

README.md contains the original business problem and user stories. api/ and react/ contain the incomplete legacy implementation. There are no supplied current production credentials, customer datasets, testimonials, or contemporary visual references.
