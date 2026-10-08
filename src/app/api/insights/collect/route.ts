import { handleInsightsCollect } from "@/lib/website-insights-collect";

/** First-party visit batch. POST only; nothing is cached. */
export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleInsightsCollect(request);
}
