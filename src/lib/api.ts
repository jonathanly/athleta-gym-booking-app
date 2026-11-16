import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { z, ZodError } from "zod";
import { createLogin, currentUser, logout, requireAdmin, sessionCookie } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { publicUser, users } from "@/lib/schema";
import { bookingInput, bookingPatchInput, classInput, classPatchInput, HttpError, idSchema, memberInput, memberPatchInput, profileInput } from "@/lib/rules";
import * as operations from "@/lib/operations";

function json(value: unknown, status = 200, cookie?: string) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", ...(cookie ? { "Set-Cookie": cookie } : {}) } });
}

async function body(request: Request) {
  try { return await request.json(); }
  catch { throw new HttpError(400, "Request body must be valid JSON"); }
}

async function register(request: Request, signIn: boolean) {
  const { password, ...input } = memberInput.parse(await body(request));
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await getDb().transaction(async (tx) => {
    const [user] = await tx.insert(users).values({ ...input, passwordHash, role: "member" }).returning();
    const cookie = signIn ? await createLogin(tx, user.id) : undefined;
    return { user: publicUser(user), cookie };
  });
  return json(result.user, 201, result.cookie);
}

async function login(request: Request) {
  const input = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(1)
    .refine((value) => new TextEncoder().encode(value).length <= 72, "Password must be at most 72 bytes") }).strict().parse(await body(request));
  const [candidate] = await getDb().select().from(users).where(eq(users.email, input.email));
  if (!candidate || !await bcrypt.compare(input.password, candidate.passwordHash)) throw new HttpError(401, "Email or password is incorrect");
  const result = await getDb().transaction(async (tx) => {
    const [user] = await tx.select().from(users).where(eq(users.id, candidate.id)).for("update");
    if (!user.active) throw new HttpError(403, "Your account is inactive; contact the gym");
    return { user: publicUser(user), cookie: await createLogin(tx, user.id) };
  });
  return json(result.user, 200, result.cookie);
}

export async function handleApi(request: Request, path: string[]) {
  try {
    const method = request.method;
    const route = path.join("/");
    const query = new URL(request.url).searchParams;
    if (!["GET", "HEAD"].includes(method)) {
      const origin = request.headers.get("origin");
      if (origin && new URL(origin).host !== (request.headers.get("host") ?? new URL(request.url).host)) {
        throw new HttpError(403, "Cross-origin requests are not allowed");
      }
    }
    if (method === "GET" && route === "health") return json({ status: "ok" });
    if (method === "POST" && route === "auth/login") return await login(request);
    if (method === "POST" && route === "auth/register") return await register(request, true);
    if (method === "POST" && route === "auth/logout") {
      await logout(request);
      return json({ message: "Signed out" }, 200, sessionCookie("", true));
    }
    const user = await currentUser(request);
    if (route === "auth/me") {
      if (method === "GET") return json(user);
      if (method === "PATCH") {
        const input = profileInput.parse(await body(request));
        const [updated] = await getDb().update(users).set(input).where(and(eq(users.id, user.id), eq(users.active, true))).returning();
        if (!updated) throw new HttpError(401, "Your account is inactive; please sign in again");
        return json(publicUser(updated));
      }
    }
    if (path[0] === "sessions") {
      if (path.length === 1 && method === "GET") return json(await operations.listSessions(query));
      if (path.length === 2 && method === "GET") return json(await operations.getSession(idSchema.parse(path[1])));
      requireAdmin(user);
      if (path.length === 1 && method === "POST") return json(await operations.createSession(classInput.parse(await body(request))), 201);
      if (path.length === 2 && method === "PATCH") return json(await operations.updateSession(idSchema.parse(path[1]), classPatchInput.parse(await body(request))));
    }
    if (path[0] === "members") {
      requireAdmin(user);
      if (path.length === 1 && method === "GET") return json(await operations.listMembers(query.get("search") ?? ""));
      if (path.length === 1 && method === "POST") return await register(request, false);
      if (path.length === 2 && method === "PATCH") return json(await operations.updateMember(idSchema.parse(path[1]), memberPatchInput.parse(await body(request))));
    }
    if (path[0] === "bookings") {
      if (path.length === 1 && method === "GET") return json(await operations.listBookings(user, query));
      if (path.length === 1 && method === "POST") {
        const input = bookingInput.parse(await body(request));
        return json(await operations.createBooking(user, input.sessionId, input.userId), 201);
      }
      if (path.length === 2 && method === "PATCH") {
        const input = bookingPatchInput.parse(await body(request));
        return json(await operations.updateBooking(user, idSchema.parse(path[1]), input.status));
      }
    }
    if (route === "dashboard" && method === "GET") {
      requireAdmin(user);
      return json(await operations.dashboard(query.get("date") ?? undefined));
    }
    throw new HttpError(404, "API route not found");
  } catch (error) {
    if (error instanceof HttpError) return json({ message: error.message }, error.status);
    if (error instanceof ZodError) {
      const issue = error.issues[0];
      return json({ message: `${issue.path.join(".") || "Request"}: ${issue.message}` }, 400);
    }
    // Drizzle preserves postgres errors as the cause of its query error.
    const cause = (error as { cause?: { code?: string; constraint_name?: string } })?.cause ?? error as { code?: string; constraint_name?: string };
    if (cause?.code === "23505") return json({ message: cause.constraint_name === "users_email_unique" ? "Email is already registered" : "An active reservation already exists" }, 409);
    console.error("API request failed", error);
    return json({ message: "An unexpected server error occurred" }, 500);
  }
}
