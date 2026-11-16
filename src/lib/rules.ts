import { z } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const name = z.string().trim().min(1).max(100);
export const idSchema = z.uuid();
export const instantSchema = z.iso.datetime({ offset: true }).transform((value) => new Date(value));
export const memberInput = z.object({
  firstName: name,
  lastName: name,
  email: z.email().trim().toLowerCase().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  password: z.string().min(10).refine((value) => new TextEncoder().encode(value).length <= 72, "Password must be at most 72 bytes"),
}).strict();
export const profileInput = z.object({ firstName: name.optional(), lastName: name.optional(), phone: z.string().trim().max(40).optional() }).strict()
  .refine((value) => Object.keys(value).length > 0, "Provide profile fields to update");
export const memberPatchInput = z.object({
  firstName: name.optional(), lastName: name.optional(), phone: z.string().trim().max(40).optional(), active: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide member fields to update");

export const classInput = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(5000).default(""),
  coach: name,
  location: z.string().trim().min(1).max(160),
  startsAt: instantSchema,
  durationMinutes: z.number().int().positive().max(2147483647),
  capacity: z.number().int().positive().max(2147483647),
}).strict();
export const classPatchInput = classInput.partial().extend({
  description: z.string().trim().max(5000).optional(),
  status: z.enum(["scheduled", "cancelled"]).optional(),
}).strict()
  .refine((value) => Object.keys(value).length > 0, "Provide class fields to update");
export const bookingInput = z.object({ sessionId: idSchema, userId: idSchema.optional() }).strict();
export const bookingPatchInput = z.object({ status: z.enum(["booked", "attended", "no_show", "cancelled"]) }).strict();

export function assertClassEdit(startsAt: Date, input: z.infer<typeof classPatchInput>, now: Date) {
  const schedulingFields = ["startsAt", "durationMinutes", "capacity", "coach", "location"];
  if (startsAt <= now && schedulingFields.some((field) => field in input)) {
    throw new HttpError(409, "Scheduling fields cannot be changed after a class starts");
  }
}

export function assertAttendanceChange(bookingStatus: string, classStatus: string, startsAt: Date, now: Date) {
  if (bookingStatus === "cancelled") throw new HttpError(409, "Cancelled reservations cannot be restored; create a new booking");
  if (classStatus === "cancelled") throw new HttpError(409, "Attendance is unavailable for a cancelled class");
  if (startsAt > now) throw new HttpError(409, "Attendance is available when the class starts");
}

export const gymTimezone = "Australia/Melbourne";
const dateParts = new Intl.DateTimeFormat("en-CA", { timeZone: gymTimezone, year: "numeric", month: "2-digit", day: "2-digit" });

export function gymDate(now = new Date()): string {
  const parts = dateParts.formatToParts(now);
  return ["year", "month", "day"].map((key) => parts.find((part) => part.type === key)!.value).join("-");
}

// Melbourne changes offset at 02:00/03:00, never midnight. Resolve each
// calendar midnight separately so DST days are 23 or 25 hours, not always 24.
function midnight(calendarUtc: number) {
  let instant = calendarUtc - 10 * 3600000;
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: gymTimezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  });
  for (let i = 0; i < 2; i++) {
    const parts = formatter.formatToParts(instant);
    const part = (key: string) => Number(parts.find((p) => p.type === key)!.value);
    const represented = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
    instant -= represented - calendarUtc;
  }
  return new Date(instant);
}

export function gymDayBounds(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpError(400, "Date must be a valid YYYY-MM-DD calendar date");
  const utc = new Date(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(utc.getTime()) || utc.toISOString().slice(0, 10) !== date || utc.getUTCFullYear() < 1000) {
    throw new HttpError(400, "Date must be a valid YYYY-MM-DD calendar date");
  }
  return { start: midnight(utc.getTime()), end: midnight(utc.getTime() + 86400000) };
}
