import { and, desc, eq, gte, ilike, inArray, lt, ne, or, sql, type SQL } from "drizzle-orm";
import { getDb, type Reader } from "@/lib/db";
import { bookings, classes, publicUser, users, authSessions, type PublicUser } from "@/lib/schema";
import { assertAttendanceChange, assertClassEdit, classInput, classPatchInput, gymDate, gymDayBounds, HttpError, instantSchema, memberPatchInput } from "@/lib/rules";
import { z } from "zod";

export async function sessionRecords(db: Reader, condition?: SQL) {
  return db.select({
    id: classes.id, title: classes.title, description: classes.description, coach: classes.coach,
    location: classes.location, startsAt: classes.startsAt, durationMinutes: classes.durationMinutes,
    capacity: classes.capacity, status: classes.status,
    bookedCount: sql<number>`count(${bookings.id}) filter (where ${bookings.status} <> 'cancelled')`.mapWith(Number),
    attendedCount: sql<number>`count(${bookings.id}) filter (where ${bookings.status} = 'attended')`.mapWith(Number),
  }).from(classes).leftJoin(bookings, eq(bookings.sessionId, classes.id))
    .where(condition).groupBy(classes.id).orderBy(classes.startsAt, classes.id);
}

async function sessionRecord(db: Reader, id: string) {
  const [session] = await sessionRecords(db, eq(classes.id, id));
  if (!session) throw new HttpError(404, "Class not found");
  return session;
}

export async function bookingRecords(db: Reader, condition?: SQL, limit = 2147483647) {
  const rows = await db.select({ booking: bookings, user: users }).from(bookings)
    .innerJoin(users, eq(users.id, bookings.userId)).where(condition)
    .orderBy(desc(bookings.createdAt), desc(bookings.id)).limit(limit);
  if (!rows.length) return [];
  const sessions = await sessionRecords(db, inArray(classes.id, [...new Set(rows.map((row) => row.booking.sessionId))]));
  const byId = new Map(sessions.map((session) => [session.id, session]));
  return rows.map(({ booking, user }) => ({ ...booking, user: publicUser(user), session: byId.get(booking.sessionId)! }));
}

async function bookingRecord(db: Reader, id: string) {
  const [booking] = await bookingRecords(db, eq(bookings.id, id));
  if (!booking) throw new HttpError(404, "Booking not found");
  return booking;
}

const literalSearch = (value: string) => `%${value.replace(/[\\%_]/g, "\\$&")}%`;

export async function listSessions(query: URLSearchParams) {
  const conditions: SQL[] = [];
  if (query.get("search")) {
    const search = literalSearch(query.get("search")!.trim());
    conditions.push(or(ilike(classes.title, search), ilike(classes.coach, search))!);
  }
  if (query.get("from")) conditions.push(gte(classes.startsAt, instantSchema.parse(query.get("from"))));
  if (query.get("to")) conditions.push(lt(classes.startsAt, instantSchema.parse(query.get("to"))));
  if (query.get("status")) conditions.push(eq(classes.status, z.enum(["scheduled", "cancelled"]).parse(query.get("status"))));
  return sessionRecords(getDb(), and(...conditions));
}

export function getSession(id: string) {
  return sessionRecord(getDb(), id);
}

export async function createSession(input: z.infer<typeof classInput>) {
  const [row] = await getDb().insert(classes).values(input).returning();
  return sessionRecord(getDb(), row.id);
}

export async function updateSession(id: string, input: z.infer<typeof classPatchInput>) {
  return getDb().transaction(async (tx) => {
    // Class lock also serializes reservations, capacity edits, and cancellation.
    const [row] = await tx.select().from(classes).where(eq(classes.id, id)).for("update");
    if (!row) throw new HttpError(404, "Class not found");
    if (row.status === "cancelled") throw new HttpError(409, "Cancelled classes cannot be edited or reopened");
    assertClassEdit(row.startsAt, input, new Date());
    const current = await sessionRecord(tx, id);
    if (input.capacity !== undefined && input.capacity < current.bookedCount) throw new HttpError(409, "Capacity cannot be less than active reservations");
    await tx.update(classes).set(input).where(eq(classes.id, id));
    if (input.status === "cancelled") {
      await tx.update(bookings).set({ status: "cancelled" }).where(and(eq(bookings.sessionId, id), ne(bookings.status, "cancelled")));
    }
    return sessionRecord(tx, id);
  });
}

export async function listMembers(search: string) {
  const pattern = literalSearch(search.trim());
  const rows = await getDb().select().from(users).where(and(eq(users.role, "member"),
    or(ilike(sql`${users.firstName} || ' ' || ${users.lastName}`, pattern), ilike(users.email, pattern))))
    .orderBy(users.firstName, users.lastName, users.id);
  return rows.map(publicUser);
}

export async function updateMember(id: string, input: z.infer<typeof memberPatchInput>) {
  return getDb().transaction(async (tx) => {
    const [row] = await tx.select().from(users).where(and(eq(users.id, id), eq(users.role, "member"))).for("update");
    if (!row) throw new HttpError(404, "Member not found");
    const [updated] = await tx.update(users).set(input).where(eq(users.id, id)).returning();
    if (input.active === false) await tx.delete(authSessions).where(eq(authSessions.userId, id));
    return publicUser(updated);
  });
}

export function listBookings(user: PublicUser, query: URLSearchParams) {
  const userId = query.get("userId");
  if (user.role !== "admin" && userId && userId !== user.id) throw new HttpError(403, "You can only view your own bookings");
  const conditions: SQL[] = [];
  if (query.get("sessionId")) conditions.push(eq(bookings.sessionId, z.uuid().parse(query.get("sessionId"))));
  if (user.role !== "admin" || userId) conditions.push(eq(bookings.userId, z.uuid().parse(user.role === "admin" ? userId : user.id)));
  return bookingRecords(getDb(), and(...conditions));
}

export async function createBooking(user: PublicUser, sessionId: string, requestedUserId?: string) {
  if (user.role !== "admin" && requestedUserId && requestedUserId !== user.id) throw new HttpError(403, "You can only book for yourself");
  const userId = requestedUserId ?? user.id;
  return getDb().transaction(async (tx) => {
    const [session] = await tx.select().from(classes).where(eq(classes.id, sessionId)).for("update");
    if (!session) throw new HttpError(404, "Class not found");
    const [member] = await tx.select().from(users).where(eq(users.id, userId)).for("update");
    if (!member || member.role !== "member") throw new HttpError(404, "Member not found");
    if (!member.active) throw new HttpError(409, "Inactive members cannot make bookings");
    if (session.status !== "scheduled" || session.startsAt <= new Date()) throw new HttpError(409, "Only future scheduled classes can be booked");
    const [duplicate] = await tx.select({ id: bookings.id }).from(bookings)
      .where(and(eq(bookings.userId, userId), eq(bookings.sessionId, sessionId), ne(bookings.status, "cancelled")));
    if (duplicate) throw new HttpError(409, "Member already has an active reservation for this class");
    const current = await sessionRecord(tx, sessionId);
    if (current.bookedCount >= current.capacity) throw new HttpError(409, "This class is full");
    const [booking] = await tx.insert(bookings).values({ userId, sessionId }).returning();
    return bookingRecord(tx, booking.id);
  });
}

export async function updateBooking(user: PublicUser, id: string, status: "booked" | "attended" | "no_show" | "cancelled") {
  return getDb().transaction(async (tx) => {
    const [initial] = await tx.select().from(bookings).where(eq(bookings.id, id));
    if (!initial) throw new HttpError(404, "Booking not found");
    if (user.role !== "admin" && initial.userId !== user.id) throw new HttpError(403, "You can only change your own bookings");
    const [session] = await tx.select().from(classes).where(eq(classes.id, initial.sessionId)).for("update");
    const [booking] = await tx.select().from(bookings).where(eq(bookings.id, id)).for("update");
    const now = new Date();
    if (user.role !== "admin") {
      if (status !== "cancelled") throw new HttpError(403, "Only an administrator can record attendance");
      if (session.startsAt <= now) throw new HttpError(409, "You can only cancel future reservations");
    }
    if (status !== "cancelled") assertAttendanceChange(booking.status, session.status, session.startsAt, now);
    await tx.update(bookings).set({ status }).where(eq(bookings.id, id));
    return bookingRecord(tx, id);
  });
}

export async function dashboard(date = gymDate()) {
  const { start, end } = gymDayBounds(date);
  // One snapshot keeps totals, lists and nested booking counts consistent.
  return getDb().transaction(async (tx) => {
    const sessionsToday = await sessionRecords(tx, and(gte(classes.startsAt, start), lt(classes.startsAt, end), eq(classes.status, "scheduled")));
    const [members] = await tx.select({
      total: sql<number>`count(*)`.mapWith(Number),
      active: sql<number>`count(*) filter (where ${users.active})`.mapWith(Number),
    }).from(users).where(eq(users.role, "member"));
    const recentBookings = await bookingRecords(tx, undefined, 8);
    return {
      date, totalMembers: members.total, activeMembers: members.active, sessionsToday,
      bookingsToday: sessionsToday.reduce((sum, session) => sum + session.bookedCount, 0),
      attendedToday: sessionsToday.reduce((sum, session) => sum + session.attendedCount, 0),
      capacityToday: sessionsToday.reduce((sum, session) => sum + session.capacity, 0), recentBookings,
    };
  }, { isolationLevel: "repeatable read", accessMode: "read only" });
}
