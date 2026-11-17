import { randomUUID } from "node:crypto";
import { test as base, expect, type APIRequestContext } from "@playwright/test";

export const password = "AthletaDemo123!";
export const unique = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`;

export async function login(api: APIRequestContext, email = "admin@athleta.local") {
  const response = await api.post("/api/auth/login", { data: { email, password } });
  expect(response.status(), await response.text()).toBe(200);
  return response.json();
}

export async function member(api: APIRequestContext) {
  const response = await api.post("/api/members", { data: {
    firstName: "Feature", lastName: unique("Member"),
    email: `${unique("member")}@athleta.local`, password,
  } });
  expect(response.status(), await response.text()).toBe(201);
  return response.json();
}

export async function session(api: APIRequestContext, capacity = 3) {
  const response = await api.post("/api/sessions", { data: {
    title: unique("Strength"), description: "Fictional feature fixture", coach: "Casey",
    location: "Court 2", startsAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
    durationMinutes: 45, capacity,
  } });
  expect(response.status(), await response.text()).toBe(201);
  return response.json();
}

export async function book(api: APIRequestContext, sessionId: string, userId?: string) {
  const response = await api.post("/api/bookings", { data: { sessionId, ...(userId ? { userId } : {}) } });
  expect(response.status(), await response.text()).toBe(201);
  return response.json();
}

export const test = base.extend<{ admin: APIRequestContext }>({
  admin: async ({ playwright, baseURL }, provide) => {
    const api = await playwright.request.newContext({ baseURL });
    await login(api);
    try { await provide(api); }
    finally { await api.dispose(); }
  },
});
export { expect };
