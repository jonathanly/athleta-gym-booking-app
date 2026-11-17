import { test, expect, unique, password, login, member, session } from "./fixtures";

test("member registers and updates their profile with persisted contact details", async ({ page }) => {
  const lastName = unique("Registration");
  const email = `${unique("registration")}@athleta.local`;
  await page.goto("/register");
  await page.getByLabel("First name", { exact: true }).fill("Alex");
  await page.getByLabel("Last name", { exact: true }).fill(lastName);
  await page.getByLabel("Phone", { exact: true }).fill("0400000033");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/member(?:\/|$)/);
  await page.goto("/member/profile");
  await page.reload();
  await expect(page.getByLabel("First name", { exact: true })).toHaveValue("Alex");
  await expect(page.getByLabel("Last name", { exact: true })).toHaveValue(lastName);
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
  await expect(page.getByLabel("Phone", { exact: true })).toHaveValue("0400000033");
  await page.getByLabel("First name", { exact: true }).fill("Sam");
  await page.getByLabel("Last name", { exact: true }).fill(`${lastName} Updated`);
  await page.getByLabel("Phone", { exact: true }).fill("0400000044");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Your profile has been updated");
  await page.reload();
  await expect(page.getByLabel("First name", { exact: true })).toHaveValue("Sam");
  await expect(page.getByLabel("Last name", { exact: true })).toHaveValue(`${lastName} Updated`);
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
  await expect(page.getByLabel("Phone", { exact: true })).toHaveValue("0400000044");
  const saved = await page.request.get("/api/auth/me");
  expect(saved.status()).toBe(200);
  expect(await saved.json()).toMatchObject({
    firstName: "Sam", lastName: `${lastName} Updated`, email, phone: "0400000044", role: "member",
  });
});

test("member books a class and cancels it with both states persisted", async ({ page, admin }) => {
  const user = await member(admin);
  const scheduled = await session(admin, 1);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Melbourne" }).format(new Date(scheduled.startsAt));
  await login(page.request, user.email);
  await page.goto("/member");
  await page.getByLabel("Class date", { exact: true }).fill(date);
  await page.getByRole("searchbox", { name: "Search classes" }).fill(scheduled.title);
  const classRow = page.getByRole("article").filter({ hasText: scheduled.title });
  await classRow.getByRole("button", { name: "Book class", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(scheduled.title);
  await dialog.getByRole("button", { name: "Confirm booking", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(classRow.getByText("You’re booked", { exact: true })).toBeVisible();
  await page.goto("/member/bookings");
  await page.reload();
  const bookingRow = page.getByRole("article").filter({ hasText: scheduled.title });
  await expect(bookingRow.getByText("Booked", { exact: true })).toBeVisible();
  const booked = await page.request.get("/api/bookings");
  expect(booked.status()).toBe(200);
  const reservations = await booked.json();
  expect(reservations).toEqual([
    expect.objectContaining({ sessionId: scheduled.id, userId: user.id, status: "booked" }),
  ]);
  await bookingRow.getByRole("button", { name: "Cancel booking", exact: true }).click();
  await expect(dialog).toContainText(scheduled.title);
  await dialog.getByRole("button", { name: "Cancel booking", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(bookingRow).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Your next class is waiting", { exact: true })).toBeVisible();
  await expect(bookingRow).toHaveCount(0);
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(bookingRow.getByText("Cancelled", { exact: true })).toBeVisible();
  expect(await (await page.request.get("/api/bookings")).json()).toEqual([
    expect.objectContaining({ id: reservations[0].id, sessionId: scheduled.id, userId: user.id, status: "cancelled" }),
  ]);
  expect(await (await admin.get(`/api/sessions/${scheduled.id}`)).json()).toMatchObject({ bookedCount: 0 });
});

test("member sees their seeded attended history", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("member@athleta.local");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/member(?:\/|$)/);
  await page.goto("/member/bookings");
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.getByText("Strength foundations", { exact: true })).toBeVisible();
  await expect(page.getByText("Attended", { exact: true }).first()).toBeVisible();
});

test("member cannot open the administrative workspace", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("member@athleta.local");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/member(?:\/|$)/);
  await page.goto("/admin/members");
  await expect(page).toHaveURL(/\/member(?:\/|$)/);
});
