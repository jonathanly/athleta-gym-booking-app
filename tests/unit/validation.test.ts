import { describe, expect, it } from "vitest";
import { assertClassEdit, classInput, classPatchInput, memberInput, profileInput } from "@/lib/rules";

const validClass = {
  title: "Strength", description: "Coached strength", coach: "Alex", location: "Studio 1",
  startsAt: "2027-01-12T09:00:00+11:00", durationMinutes: 45, capacity: 12,
};

describe("scheduled class input", () => {
  it.each([0, -1, 1.5])("rejects capacity or duration of %s", (value) => {
    expect(classInput.safeParse({ ...validClass, capacity: value }).success).toBe(false);
    expect(classInput.safeParse({ ...validClass, durationMinutes: value }).success).toBe(false);
  });

  it("accepts positive integers and requires an explicit timestamp offset", () => {
    expect(classInput.parse({ ...validClass, capacity: 1, durationMinutes: 1 }).startsAt.toISOString()).toBe("2027-01-11T22:00:00.000Z");
    expect(classInput.safeParse({ ...validClass, startsAt: "2027-01-12T09:00:00" }).success).toBe(false);
  });

  it("does not clear omitted fields in partial updates", () => {
    expect(classPatchInput.parse({ capacity: 7 })).toEqual({ capacity: 7 });
    expect(classPatchInput.parse({ status: "cancelled" })).toEqual({ status: "cancelled" });
    expect(profileInput.parse({ firstName: "Jamie" })).toEqual({ firstName: "Jamie" });
    expect(classPatchInput.safeParse({}).success).toBe(false);
  });

  it("permits started-class description corrections without rewriting its schedule", () => {
    const start = new Date("2026-11-16T07:00:00.000Z");
    expect(() => assertClassEdit(start, { title: "Corrected title", description: "Corrected description" }, start)).not.toThrow();
    for (const patch of [{ startsAt: new Date(start.getTime() + 3600000) }, { capacity: 20 }, { durationMinutes: 60 }, { coach: "Other coach" }, { location: "Other studio" }]) {
      expect(() => assertClassEdit(start, patch, start)).toThrow("Scheduling fields cannot be changed");
    }
    expect(() => assertClassEdit(start, { capacity: 20 }, new Date(start.getTime() - 1))).not.toThrow();
  });
});

describe("account input boundaries", () => {
  it("rejects privilege escalation through registration or own profile", () => {
    const member = { firstName: "Jamie", lastName: "Chen", email: "jamie@example.test", password: "A-long-demo-password" };
    expect(memberInput.parse(member).phone).toBe("");
    expect(memberInput.safeParse({ ...member, role: "admin" }).success).toBe(false);
    expect(profileInput.safeParse({ role: "admin" }).success).toBe(false);
    expect(profileInput.safeParse({ email: "other@example.test" }).success).toBe(false);
    expect(memberInput.safeParse({ ...member, password: "🔑".repeat(19) }).success).toBe(false);
  });
});
