import { test, expect, session, book, member } from "./fixtures";

test("check-in, undo and no-show persist and update the gym-day dashboard", async ({ admin }) => {
  const sessions = await (await admin.get("/api/sessions")).json();
  const started = sessions.find((item: { title: string; startsAt: string; status: string }) =>
    item.title === "Strength foundations" && item.status === "scheduled" && Date.parse(item.startsAt) < Date.now());
  expect(started, "Seed provides a started Strength foundations class").toBeTruthy();
  const roster = await (await admin.get(`/api/bookings?sessionId=${started.id}`)).json();
  const target = roster.find((item: { status: string }) => item.status === "booked");
  expect(target, "Seed provides a booked member on the started class").toBeTruthy();
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Melbourne" }).format(new Date(started.startsAt));
  const before = await (await admin.get(`/api/dashboard?date=${date}`)).json();
  expect((await admin.patch(`/api/bookings/${target.id}`, { data: { status: "attended" } })).status()).toBe(200);
  const checkedIn = await (await admin.get(`/api/bookings?sessionId=${started.id}`)).json();
  expect(checkedIn).toEqual(expect.arrayContaining([expect.objectContaining({ id: target.id, status: "attended" })]));
  expect((await (await admin.get(`/api/dashboard?date=${date}`)).json()).attendedToday).toBe(before.attendedToday + 1);
  expect((await admin.patch(`/api/bookings/${target.id}`, { data: { status: "booked" } })).status()).toBe(200);
  expect((await (await admin.get(`/api/dashboard?date=${date}`)).json()).attendedToday).toBe(before.attendedToday);
  expect((await admin.patch(`/api/bookings/${target.id}`, { data: { status: "no_show" } })).status()).toBe(200);
  expect(await (await admin.get(`/api/bookings?sessionId=${started.id}`)).json()).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: target.id, status: "no_show" }),
  ]));
});

test("attendance cannot be recorded for upcoming or cancelled reservations", async ({ admin }) => {
  const scheduled = await session(admin);
  const user = await member(admin);
  const booking = await book(admin, scheduled.id, user.id);
  expect([400, 409]).toContain((await admin.patch(`/api/bookings/${booking.id}`, { data: { status: "attended" } })).status());
  expect((await admin.patch(`/api/bookings/${booking.id}`, { data: { status: "cancelled" } })).status()).toBe(200);
  expect([400, 409]).toContain((await admin.patch(`/api/bookings/${booking.id}`, { data: { status: "attended" } })).status());
  expect(await (await admin.get(`/api/bookings?sessionId=${scheduled.id}`)).json()).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: booking.id, status: "cancelled" }),
  ]));
});
