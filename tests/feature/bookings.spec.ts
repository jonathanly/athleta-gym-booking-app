import { test, expect, member, session, book, login, unique, password } from "./fixtures";

test("member registers, cancels and rebooks a released place", async ({ admin, request }) => {
  const registration = await request.post("/api/auth/register", { data: {
    firstName: "Alex", lastName: "Feature", email: `${unique("alex")}@athleta.local`, password,
  } });
  expect(registration.status()).toBe(201);
  expect(await registration.json()).toMatchObject({ role: "member" });
  const scheduled = await session(admin, 1);
  const reservation = await book(request, scheduled.id);
  expect((await request.post("/api/bookings", { data: { sessionId: scheduled.id } })).status()).toBe(409);
  expect(await (await request.get("/api/bookings")).json()).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: reservation.id, status: "booked" }),
  ]));
  expect((await request.patch(`/api/bookings/${reservation.id}`, { data: { status: "cancelled" } })).status()).toBe(200);
  const rebooked = await book(request, scheduled.id);
  expect(rebooked.status).toBe("booked");
  expect(await (await admin.get(`/api/sessions/${scheduled.id}`)).json()).toMatchObject({ bookedCount: 1 });
});

test("two members racing for the final place cannot overbook", async ({ admin, playwright, baseURL }) => {
  const scheduled = await session(admin, 1);
  const first = await member(admin);
  const second = await member(admin);
  const a = await playwright.request.newContext({ baseURL });
  const b = await playwright.request.newContext({ baseURL });
  try {
    await Promise.all([login(a, first.email), login(b, second.email)]);
    const responses = await Promise.all([a, b].map((api) => api.post("/api/bookings", { data: { sessionId: scheduled.id } })));
    expect(responses.map((response) => response.status()).sort()).toEqual([201, 409]);
    expect(await (await admin.get(`/api/sessions/${scheduled.id}`)).json()).toMatchObject({ bookedCount: 1, capacity: 1 });
    const bookings = await (await admin.get(`/api/bookings?sessionId=${scheduled.id}`)).json();
    expect(bookings.filter((booking: { status: string }) => booking.status !== "cancelled")).toHaveLength(1);
  } finally { await Promise.all([a.dispose(), b.dispose()]); }
});
