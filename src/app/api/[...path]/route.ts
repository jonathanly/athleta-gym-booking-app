import { handleApi } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleApi(request, (await context.params).path);
}

export { handler as GET, handler as POST, handler as PATCH };
