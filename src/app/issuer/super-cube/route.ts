import { issuerResponse, options } from "@/lib/lms/server/open-badge-http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export function GET() {
  return issuerResponse();
}
