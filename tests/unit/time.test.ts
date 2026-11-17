import { describe, expect, it } from "vitest";
import { gymDate, gymDayBounds } from "@/lib/rules";

describe("Melbourne calendar days", () => {
  it.each([
    ["2026-04-05", "2026-04-04T13:00:00.000Z", "2026-04-05T14:00:00.000Z", 25],
    ["2026-10-04", "2026-10-03T14:00:00.000Z", "2026-10-04T13:00:00.000Z", 23],
  ])("resolves %s across daylight saving", (date, expectedStart, expectedEnd, hours) => {
    const { start, end } = gymDayBounds(date);
    expect(start.toISOString()).toBe(expectedStart);
    expect(end.toISOString()).toBe(expectedEnd);
    expect((end.getTime() - start.getTime()) / 3600000).toBe(hours);
    expect(gymDate(new Date(start.getTime() - 1))).not.toBe(date);
    expect(gymDate(start)).toBe(date);
    expect(gymDate(new Date(end.getTime() - 1))).toBe(date);
    expect(gymDate(end)).not.toBe(date);
  });

  it("rejects normalized nonexistent calendar dates", () => {
    expect(() => gymDayBounds("2026-02-30")).toThrow("valid YYYY-MM-DD");
    expect(() => gymDayBounds("2026-2-3")).toThrow("valid YYYY-MM-DD");
  });
});
