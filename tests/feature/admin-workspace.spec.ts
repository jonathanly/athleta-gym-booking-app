import { test, expect, unique, password, login, member, session, book } from "./fixtures";

test("admin creates and edits a class through the schedule and reloads persisted values", async ({ page, admin }) => {
  const title = unique("Feature mobility");
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("admin@athleta.local");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin(?:\/|$)/);
  await page.goto("/admin/schedule");
  await page.getByRole("button", { name: "New class", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Class name", { exact: true }).fill(title);
  await dialog.getByLabel("Description", { exact: true }).fill("Fictional browser feature fixture");
  await dialog.getByLabel("Coach", { exact: true }).fill("Morgan Feature");
  await dialog.getByLabel("Location", { exact: true }).fill("Studio 3");
  const tomorrow = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Melbourne" }).format(new Date(Date.now() + 86400_000));
  await dialog.getByLabel("Date", { exact: true }).fill(tomorrow);
  await dialog.getByLabel("Start time", { exact: true }).fill("14:15");
  await dialog.getByLabel("Duration (minutes)", { exact: true }).fill("45");
  await dialog.getByLabel("Capacity", { exact: true }).fill("9");
  await dialog.getByRole("button", { name: "Create class", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.getByLabel("Class date", { exact: true }).fill(tomorrow);
  await page.getByRole("searchbox", { name: "Search classes" }).fill(title);
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page.reload();
  await page.getByLabel("Class date", { exact: true }).fill(tomorrow);
  await page.getByRole("searchbox", { name: "Search classes" }).fill(title);
  await page.getByRole("button", { name: `Edit ${title}`, exact: true }).click();
  await expect(dialog.getByLabel("Capacity", { exact: true })).toHaveValue("9");
  await dialog.getByLabel("Capacity", { exact: true }).fill("12");
  await dialog.getByLabel("Start time", { exact: true }).fill("15:30");
  await dialog.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await page.getByLabel("Class date", { exact: true }).fill(tomorrow);
  await page.getByRole("searchbox", { name: "Search classes" }).fill(title);
  await page.getByRole("button", { name: `Edit ${title}`, exact: true }).click();
  await expect(dialog.getByLabel("Capacity", { exact: true })).toHaveValue("12");
  await expect(dialog.getByLabel("Start time", { exact: true })).toHaveValue("15:30");
  const saved = await (await admin.get(`/api/sessions?search=${encodeURIComponent(title)}`)).json();
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({ capacity: 12, durationMinutes: 45 });
  expect(new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Melbourne", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(saved[0].startsAt))).toBe("15:30");
});

test("admin creates and edits a member and reloads persisted contact details", async ({ page, admin }) => {
  const lastName = unique("Directory");
  const email = `${unique("directory")}@athleta.local`;
  await login(page.request);
  await page.goto("/admin/members");
  await page.getByRole("button", { name: "Add member", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("First name", { exact: true }).fill("Taylor");
  await dialog.getByLabel("Last name", { exact: true }).fill(lastName);
  await dialog.getByLabel("Email", { exact: true }).fill(email);
  await dialog.getByLabel("Phone", { exact: true }).fill("0400000011");
  await dialog.getByLabel("Temporary password", { exact: true }).fill(password);
  await dialog.getByRole("button", { name: "Create member", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await page.getByRole("searchbox", { name: "Search members" }).fill(email);
  const row = page.getByRole("article").filter({ hasText: email });
  await expect(row.getByRole("heading", { name: `Taylor ${lastName}`, exact: true })).toBeVisible();
  await expect(row.getByText("0400000011", { exact: true })).toBeVisible();
  await row.getByRole("button", { name: `Edit Taylor ${lastName}`, exact: true }).click();
  await expect(dialog.getByLabel("Email", { exact: true })).toHaveValue(email);
  await dialog.getByLabel("First name", { exact: true }).fill("Jordan");
  await dialog.getByLabel("Phone", { exact: true }).fill("0400000022");
  await dialog.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await page.getByRole("searchbox", { name: "Search members" }).fill(email);
  await expect(row.getByRole("heading", { name: `Jordan ${lastName}`, exact: true })).toBeVisible();
  await expect(row.getByText("0400000022", { exact: true })).toBeVisible();
  const saved = await admin.get(`/api/members?search=${encodeURIComponent(email)}`);
  expect(saved.status()).toBe(200);
  expect(await saved.json()).toEqual([
    expect.objectContaining({ firstName: "Jordan", lastName, email, phone: "0400000022", active: true }),
  ]);
});

test("admin checks in a roster member and undoes it with both states persisted", async ({ page, admin }) => {
  const user = await member(admin);
  const scheduled = await session(admin);
  const reservation = await book(admin, scheduled.id, user.id);
  // Arrange a started class through the public API after making its future booking.
  const started = await admin.patch(`/api/sessions/${scheduled.id}`, {
    data: { startsAt: new Date(Date.now() - 5 * 60_000).toISOString() },
  });
  expect(started.status(), await started.text()).toBe(200);
  await login(page.request);
  await page.goto(`/admin/sessions/${scheduled.id}`);
  await expect(page.getByRole("heading", { name: scheduled.title, exact: true })).toBeVisible();
  const row = page.getByRole("article").filter({ hasText: user.email });
  await expect(row.getByText("Not checked in", { exact: true })).toBeVisible();
  await row.getByRole("button", { name: "Check in", exact: true }).click();
  await expect(row.getByText("Checked in", { exact: true })).toBeVisible();
  await page.reload();
  await expect(row.getByText("Checked in", { exact: true })).toBeVisible();
  expect(await (await admin.get(`/api/bookings?sessionId=${scheduled.id}`)).json()).toEqual([
    expect.objectContaining({ id: reservation.id, userId: user.id, status: "attended" }),
  ]);
  await row.getByRole("button", { name: "Undo check-in", exact: true }).click();
  await expect(row.getByText("Not checked in", { exact: true })).toBeVisible();
  await page.reload();
  await expect(row.getByText("Not checked in", { exact: true })).toBeVisible();
  await expect(row.getByRole("button", { name: "Check in", exact: true })).toBeEnabled();
  expect(await (await admin.get(`/api/bookings?sessionId=${scheduled.id}`)).json()).toEqual([
    expect.objectContaining({ id: reservation.id, userId: user.id, status: "booked" }),
  ]);
});
