import { describe, expect, it } from "vitest";
import { assertAttendanceChange } from "@/lib/rules";

describe("attendance transitions", () => {
  const start = new Date("2026-11-16T07:00:00.000Z");
  it("opens exactly at class start, not one millisecond earlier", () => {
    expect(() => assertAttendanceChange("booked", "scheduled", start, new Date(start.getTime() - 1))).toThrow("when the class starts");
    expect(() => assertAttendanceChange("booked", "scheduled", start, start)).not.toThrow();
    expect(() => assertAttendanceChange("attended", "scheduled", start, start)).not.toThrow();
  });

  it("never resurrects cancelled reservations or attendance on cancelled classes", () => {
    expect(() => assertAttendanceChange("cancelled", "scheduled", start, start)).toThrow("cannot be restored");
    expect(() => assertAttendanceChange("booked", "cancelled", start, start)).toThrow("cancelled class");
  });
});
