# Rewrite API contract

The feature threads share this contract for the approved Next.js rewrite. All routes are under `/api`, implemented within Next.js rather than a separate Express service. JSON requests and responses use camelCase and string IDs. Errors are `{ "message": "Readable error" }` with an appropriate 400/401/403/404/409 status. Collections return plain arrays. Authentication uses an HTTP-only same-site session cookie and same-origin requests. No browser token storage is needed. Persistence uses PostgreSQL and Drizzle; tests use isolated PostgreSQL databases, never the development/demo database.

## Records

- **User:** `{ id, firstName, lastName, email, phone, role, active, createdAt }`, where role is `admin` or `member`, active is boolean, and timestamps are ISO strings. Never return password hashes or session tokens.
- **Session:** `{ id, title, description, coach, location, startsAt, durationMinutes, capacity, status, bookedCount, attendedCount }`, where status is `scheduled` or `cancelled`. startsAt is an ISO timestamp with timezone, representing a concrete class instance. Counts include only non-cancelled bookings. Positive integer duration and capacity are required.
- **Booking:** `{ id, userId, sessionId, status, createdAt, user, session }`, where status is `booked`, `attended`, `no_show`, or `cancelled`. Nested user and session use the public records above. Active bookings means all statuses except cancelled; a member's past attended booking still occupies its historical seat.

## Authentication and own account

- `GET /health` → `{ status: "ok" }`, unauthenticated.
- `POST /auth/login` with `{ email, password }` → User, and set cookie.
- `POST /auth/register` with `{ firstName, lastName, email, phone?, password }` → member User, and set cookie. Cannot grant admin privileges.
- `POST /auth/logout` → `{ message }`, and clear cookie.
- `GET /auth/me` → current User, or 401.
- `PATCH /auth/me` with `{ firstName, lastName, phone }` → updated User. Email/role changes are not part of own-profile editing.

## Scheduled sessions

- `GET /sessions?search=&from=&to=&status=` → Session[]. Authenticated users; free-text search covers title/coach. from/to are ISO instants, inclusive lower and exclusive upper bounds. Default returns all sessions in chronological order; the frontend supplies date filters.
- `GET /sessions/:id` → Session.
- Admin `POST /sessions` with `{ title, description, coach, location, startsAt, durationMinutes, capacity }` → Session, status 201.
- Admin `PATCH /sessions/:id` with editable session fields or `{ status: "cancelled" }` → Session. Cannot reduce capacity below active reservations; cancellation cancels existing active reservations. Cancelled sessions cannot be reopened. Changing a past session's scheduling fields is rejected.

## Members and bookings

- Admin `GET /members?search=` → User[] for member-role accounts, searched by name/email.
- Admin `POST /members` with `{ firstName, lastName, email, phone?, password }` → member User, status 201.
- Admin `PATCH /members/:id` with `{ firstName?, lastName?, phone?, active? }` → User. Deactivation blocks login and new bookings, preserves history, and invalidates existing member sessions. Reactivation permits login again.
- `GET /bookings?sessionId=&userId=` → Booking[]. Admin sees all, member sees only their own. Members cannot request another member's bookings.
- `POST /bookings` with `{ sessionId, userId? }` → Booking, status 201. Members may book only themselves; admins may specify a member. Enforce active membership, future scheduled session, capacity, and uniqueness of active member/session reservation. A cancelled reservation can be booked again if space remains.
- `PATCH /bookings/:id` with `{ status: "cancelled" }` → Booking. Admin may cancel; member may cancel their own future reservation. Admin may also set status to `booked`, `attended`, or `no_show` for a non-cancelled class; attendance changes require that the class has started and must not resurrect cancelled reservations or overbook a class.

## Admin dashboard

- Admin `GET /dashboard?date=YYYY-MM-DD` → `{ date, totalMembers, activeMembers, sessionsToday, bookingsToday, attendedToday, capacityToday, recentBookings }`.
- Date is a calendar day in Australia/Melbourne, defaulting to today there. sessionsToday is Session[]; recentBookings is up to eight Booking[] newest-first. All numeric aggregates derive from stored rows, exclude cancelled classes/reservations, and use the requested gym-local day. attendedToday counts attended reservations on that day's sessions; capacityToday sums those sessions' capacity.

## Local demo

The explicit seed command creates `admin@athleta.local` and `member@athleta.local`, both with local-only password `AthletaDemo123!`, sample members, and past/future sessions relative to seed time. Use synthetic names and gym-relevant classes. Seed only an empty database, never silently reset persisted edits. Explain the seed data is fictional in the UI and startup docs. Tests use their own temporary database and do not mutate the demo database.
