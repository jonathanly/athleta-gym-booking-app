import { test, expect, member, session, book, login } from "./fixtures";

test("admin changes persist and capacity cannot fall below active bookings", async ({ admin }) => {
  const created = await session(admin);
  const startsAt = new Date(Date.now() + 8 * 86400_000).toISOString();
  const update = await admin.patch(`/api/sessions/${created.id}`, { data: { capacity: 2, startsAt } });
  expect(update.status()).toBe(200);
  const found = await admin.get(`/api/sessions?search=${encodeURIComponent(created.title)}`);
  expect(await found.json()).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: created.id, capacity: 2, startsAt }),
  ]));
  const first = await member(admin);
  const second = await member(admin);
  await book(admin, created.id, first.id);
  await book(admin, created.id, second.id);
  const reduction = await admin.patch(`/api/sessions/${created.id}`, { data: { capacity: 1 } });
  expect(reduction.status()).toBe(409);
  const reloaded = await admin.get(`/api/sessions/${created.id}`);
  expect(await reloaded.json()).toMatchObject({ capacity: 2, bookedCount: 2, startsAt });
});

test("deactivation revokes existing sessions and preserves booking history", async ({ admin, playwright, baseURL }) => {
  const user = await member(admin);
  const scheduled = await session(admin);
  const reservation = await book(admin, scheduled.id, user.id);
  const own = await playwright.request.newContext({ baseURL });
  try {
    await login(own, user.email);
    expect((await admin.patch(`/api/members/${user.id}`, { data: { active: false } })).status()).toBe(200);
    expect((await own.get("/api/auth/me")).status()).toBe(401);
    expect((await own.post("/api/bookings", { data: { sessionId: scheduled.id } })).status()).toBe(401);
    expect((await own.post("/api/auth/login", { data: { email: user.email, password: "AthletaDemo123!" } })).status()).toBe(403);
    expect((await admin.post("/api/bookings", { data: { sessionId: (await session(admin)).id, userId: user.id } })).status()).toBe(409);
    const history = await admin.get(`/api/bookings?userId=${user.id}`);
    expect(await history.json()).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: reservation.id, status: "booked" }),
    ]));
  } finally { await own.dispose(); }
});

test("cancelling a class cancels reservations but retains its records", async ({ admin }) => {
  const scheduled = await session(admin);
  const user = await member(admin);
  const reservation = await book(admin, scheduled.id, user.id);
  expect((await admin.patch(`/api/sessions/${scheduled.id}`, { data: { status: "cancelled" } })).status()).toBe(200);
  expect(await (await admin.get(`/api/sessions/${scheduled.id}`)).json()).toMatchObject({ status: "cancelled", bookedCount: 0 });
  expect(await (await admin.get(`/api/bookings?sessionId=${scheduled.id}`)).json()).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: reservation.id, status: "cancelled" }),
  ]));
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Melbourne" }).format(new Date(scheduled.startsAt));
  const dashboard = await (await admin.get(`/api/dashboard?date=${date}`)).json();
  expect(dashboard.sessionsToday.map((item: { id: string }) => item.id)).not.toContain(scheduled.id);
});
