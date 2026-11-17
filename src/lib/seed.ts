import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { bookings, classes, users } from "@/lib/schema";

// Explicitly invoked by scripts/seed.ts, never during application startup.
// All names, bookings and statistics created here are fictional local demo data.
export async function seedDemo() {
  const passwordHash = await bcrypt.hash("AthletaDemo123!", 12);
  return getDb().transaction(async (tx) => {
    // Serialize seeds and refuse any populated domain database, even one with
    // classes but no accounts. Never truncate, upsert or overwrite user edits.
    await tx.execute(sql`lock table users, classes, bookings, auth_sessions in access exclusive mode`);
    const [existing] = await tx.execute<{ populated: boolean }>(sql`
      select exists(select 1 from users) or exists(select 1 from classes)
        or exists(select 1 from bookings) or exists(select 1 from auth_sessions) as populated
    `);
    if (existing.populated) return false;

    await tx.insert(users).values({ firstName: "Alex", lastName: "Morgan", email: "admin@athleta.local", passwordHash, role: "admin" });
    const members = await tx.insert(users).values([
      { firstName: "Jamie", lastName: "Chen", email: "member@athleta.local", phone: "0400 000 001", passwordHash },
      { firstName: "Taylor", lastName: "Reed", email: "taylor@athleta.local", phone: "0400 000 002", passwordHash },
      { firstName: "Casey", lastName: "Patel", email: "casey@athleta.local", passwordHash },
      { firstName: "Riley", lastName: "Brooks", email: "riley@athleta.local", passwordHash },
      { firstName: "Sam", lastName: "Rivera", email: "sam@athleta.local", active: false, passwordHash },
    ]).returning();
    const now = Date.now();
    const hoursFromNow = (hours: number) => new Date(now + hours * 3600000);
    const sessions = await tx.insert(classes).values([
      { title: "Strength foundations", description: "Fictional demo: coached full-body strength.", coach: "Alex Morgan", location: "Studio 1", startsAt: hoursFromNow(-2), durationMinutes: 50, capacity: 12 },
      { title: "Morning mobility", description: "Fictional demo: restorative movement.", coach: "Jordan Ellis", location: "Studio 2", startsAt: hoursFromNow(-25), durationMinutes: 45, capacity: 10 },
      { title: "Functional strength", description: "Fictional demo: build confidence with weights.", coach: "Alex Morgan", location: "Studio 1", startsAt: hoursFromNow(2), durationMinutes: 50, capacity: 12 },
      { title: "Small group conditioning", description: "Fictional demo: a full class with a two-person capacity.", coach: "Jordan Ellis", location: "Training floor", startsAt: hoursFromNow(5), durationMinutes: 45, capacity: 2 },
      { title: "Pilates flow", description: "Fictional demo: controlled movement and balance.", coach: "Avery Quinn", location: "Studio 2", startsAt: hoursFromNow(24), durationMinutes: 45, capacity: 10 },
      { title: "Weekend circuit", description: "Fictional demo: cancelled class retained for history.", coach: "Alex Morgan", location: "Training floor", startsAt: hoursFromNow(48), durationMinutes: 60, capacity: 16, status: "cancelled" },
    ]).returning();
    await tx.insert(bookings).values([
      { userId: members[0].id, sessionId: sessions[0].id, status: "attended" },
      { userId: members[1].id, sessionId: sessions[0].id, status: "booked" },
      { userId: members[2].id, sessionId: sessions[0].id, status: "no_show" },
      { userId: members[0].id, sessionId: sessions[1].id, status: "attended" },
      { userId: members[0].id, sessionId: sessions[2].id },
      { userId: members[1].id, sessionId: sessions[2].id },
      { userId: members[1].id, sessionId: sessions[3].id },
      { userId: members[2].id, sessionId: sessions[3].id },
      { userId: members[3].id, sessionId: sessions[4].id },
      { userId: members[0].id, sessionId: sessions[5].id, status: "cancelled" },
    ]);
    return true;
  });
}
