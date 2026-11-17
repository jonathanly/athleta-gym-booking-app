export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "member";
  active: boolean;
  createdAt: string;
};
export type Session = {
  id: string;
  title: string;
  description: string;
  coach: string;
  location: string;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  status: "scheduled" | "cancelled";
  bookedCount: number;
  attendedCount: number;
};
export type Booking = {
  id: string;
  userId: string;
  sessionId: string;
  status: "booked" | "attended" | "no_show" | "cancelled";
  createdAt: string;
  user: User;
  session: Session;
};
export type Dashboard = {
  date: string;
  totalMembers: number;
  activeMembers: number;
  sessionsToday: Session[];
  bookingsToday: number;
  attendedToday: number;
  capacityToday: number;
  recentBookings: Booking[];
};
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined")
      window.dispatchEvent(new Event("athleta:unauthorized"));
    throw new ApiError(
      data?.message || "Unable to complete this request. Please try again.",
      response.status,
    );
  }
  return data as T;
}
export const fullName = (user: User) => `${user.firstName} ${user.lastName}`;
export const gymZone = "Australia/Melbourne";
export const formatGym = (
  value: string | Date,
  options: Intl.DateTimeFormatOptions,
) =>
  new Intl.DateTimeFormat("en-AU", { ...options, timeZone: gymZone }).format(
    new Date(value),
  );
export function gymDate(value: string | Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: gymZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  return ["year", "month", "day"]
    .map((key) => parts.find((p) => p.type === key)!.value)
    .join("-");
}
export const gymTime = (value: string) =>
  formatGym(value, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
// Resolve wall-clock input in the gym's timezone, never the browser's timezone.
// Round-tripping also rejects a nonexistent daylight-saving time rather than moving it silently.
export function gymInstant(date: string, time = "00:00") {
  const wall = `${date}T${time}`;
  let instant = new Date(`${wall}:00Z`);
  for (let i = 0; i < 3; i++) {
    const local = `${gymDate(instant)}T${gymTime(instant.toISOString())}`;
    instant = new Date(
      instant.getTime() +
        Date.parse(`${wall}:00Z`) -
        Date.parse(`${local}:00Z`),
    );
  }
  if (`${gymDate(instant)}T${gymTime(instant.toISOString())}` !== wall)
    throw new Error(
      "This time does not exist in Melbourne because daylight saving starts. Choose another time.",
    );
  return instant.toISOString();
}
export function nextDate(date: string) {
  const day = new Date(`${date}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString().slice(0, 10);
}
export function sessionPhase(session: Session) {
  if (session.status === "cancelled") return "Cancelled";
  const now = Date.now(),
    start = Date.parse(session.startsAt);
  return now < start
    ? "Upcoming"
    : now < start + session.durationMinutes * 60000
      ? "In progress"
      : "Completed";
}
