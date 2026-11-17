import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "member"] }).notNull().default("member"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [check("users_role_check", sql`${t.role} in ('admin', 'member')`)]);

export const authSessions = pgTable("auth_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (t) => [index("auth_sessions_user_idx").on(t.userId)]);

export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  coach: text("coach").notNull(),
  location: text("location").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  capacity: integer("capacity").notNull(),
  status: text("status", { enum: ["scheduled", "cancelled"] }).notNull().default("scheduled"),
}, (t) => [
  check("classes_capacity_check", sql`${t.capacity} > 0`),
  check("classes_duration_check", sql`${t.durationMinutes} > 0`),
  check("classes_status_check", sql`${t.status} in ('scheduled', 'cancelled')`),
  index("classes_starts_at_idx").on(t.startsAt),
]);

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  sessionId: uuid("session_id").notNull().references(() => classes.id),
  status: text("status", { enum: ["booked", "attended", "no_show", "cancelled"] }).notNull().default("booked"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("bookings_active_member_session").on(t.userId, t.sessionId).where(sql`${t.status} <> 'cancelled'`),
  index("bookings_session_idx").on(t.sessionId),
  check("bookings_status_check", sql`${t.status} in ('booked', 'attended', 'no_show', 'cancelled')`),
]);

export type UserRow = typeof users.$inferSelect;
export type ClassRow = typeof classes.$inferSelect;
export type BookingRow = typeof bookings.$inferSelect;
export type PublicUser = Omit<UserRow, "passwordHash">;

export function publicUser(row: UserRow): PublicUser {
  return {
    id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email,
    phone: row.phone, role: row.role, active: row.active, createdAt: row.createdAt,
  };
}
