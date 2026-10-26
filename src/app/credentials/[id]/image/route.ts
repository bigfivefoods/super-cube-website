import { imageResponse, options } from "@/lib/lms/server/open-badge-http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return imageResponse(id);
}
