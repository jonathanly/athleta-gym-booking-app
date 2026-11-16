import { test, expect, member, session, book, login, unique, password } from "./fixtures";

test("server rejects anonymous access and member access to admin or another account", async ({ admin, request }) => {
  expect((await request.get("/api/sessions")).status()).toBe(401);
  const own = await member(admin);
  const other = await member(admin);
  const scheduled = await session(admin);
  const othersBooking = await book(admin, scheduled.id, other.id);
  await login(request, own.email);
  expect((await request.get("/api/members")).status()).toBe(403);
  expect((await request.get("/api/dashboard")).status()).toBe(403);
  expect((await request.post("/api/sessions", { data: { title: "Unauthorized" } })).status()).toBe(403);
  expect((await request.get(`/api/bookings?userId=${other.id}`)).status()).toBe(403);
  expect((await request.patch(`/api/bookings/${othersBooking.id}`, { data: { status: "cancelled" } })).status()).toBe(403);
  expect((await request.post("/api/bookings", { data: { sessionId: scheduled.id, userId: other.id } })).status()).toBe(403);
  expect((await request.patch("/api/auth/me", { data: { firstName: "Feature", lastName: "Member", phone: "", role: "admin" } })).status()).toBe(400);
  expect(await (await request.get("/api/auth/me")).json()).toMatchObject({ id: own.id, role: "member" });
  expect(await (await admin.get(`/api/bookings?userId=${other.id}`)).json()).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: othersBooking.id, status: "booked" }),
  ]));
});

test("registration cannot grant administrator privileges", async ({ request }) => {
  const response = await request.post("/api/auth/register", { data: {
    firstName: "Privilege", lastName: "Attempt", email: `${unique("role")}@athleta.local`, password, role: "admin",
  } });
  expect(response.status()).toBe(400);
  expect((await request.get("/api/auth/me")).status()).toBe(401);
});
