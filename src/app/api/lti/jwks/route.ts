import { handleLti } from "@/lib/lti/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleLti(request);
}
