import { credentialResponse, options } from "@/lib/lms/server/open-badge-http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const download = new URL(request.url).searchParams.get("download") === "1";
  return credentialResponse(id, download);
}
