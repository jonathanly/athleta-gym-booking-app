import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { getDb, type Database } from "@/lib/db";
import { authSessions, users, publicUser, type PublicUser } from "@/lib/schema";
import { HttpError } from "@/lib/rules";

export const cookieName = "athleta_session";
const lifetimeSeconds = 7 * 24 * 60 * 60;
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

function tokenFrom(request: Request) {
  return request.headers.get("cookie")?.split(";").map((value) => value.trim())
    .find((value) => value.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
}

export function sessionCookie(token: string, clear = false) {
  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear ? 0 : lifetimeSeconds}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

// Called inside the same transaction that verifies the account is active.
export async function createLogin(db: Pick<Database, "insert">, userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.insert(authSessions).values({ tokenHash: digest(token), userId, expiresAt: new Date(Date.now() + lifetimeSeconds * 1000) });
  return sessionCookie(token);
}

export async function logout(request: Request) {
  const token = tokenFrom(request);
  if (token) await getDb().delete(authSessions).where(eq(authSessions.tokenHash, digest(token)));
}

export async function currentUser(request: Request): Promise<PublicUser> {
  const token = tokenFrom(request);
  if (!token) throw new HttpError(401, "Please sign in");
  const [row] = await getDb().select({ user: users }).from(authSessions)
    .innerJoin(users, eq(users.id, authSessions.userId))
    .where(and(eq(authSessions.tokenHash, digest(token)), gt(authSessions.expiresAt, new Date()), eq(users.active, true)));
  if (!row) throw new HttpError(401, "Your session has expired; please sign in");
  return publicUser(row.user);
}

export function requireAdmin(user: PublicUser) {
  if (user.role !== "admin") throw new HttpError(403, "Administrator access required");
}
