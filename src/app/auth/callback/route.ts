import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { limitRequest } from "@/lib/server/rate-limit";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only same-site paths: "/x" but not "//host" or "/\host" (open redirect).
  const rawNext = searchParams.get("next") ?? "/learn";
  const next = /^\/(?![\/\\])/.test(rawNext) ? rawNext : "/learn";

  const limited = await limitRequest(request, "auth-callback");
  if (limited) return NextResponse.redirect(`${origin}/login?error=rate_limited`);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (code && url && key) {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    });
    await supabase.auth.exchangeCodeForSession(code);
    // Client will pull learner_state on next /learn visit via LmsSyncProvider
  }

  return NextResponse.redirect(`${origin}${next}`);
}
