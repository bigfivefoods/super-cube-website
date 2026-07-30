import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const demoOpen = process.env.NEXT_PUBLIC_DEMO_LMS_OPEN === "true";
  const path = request.nextUrl.pathname;

  // Refresh Supabase session when configured
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
    await supabase.auth.getUser();
  }

  // Hard gate only when Supabase is live and demo is off
  if (path.startsWith("/learn") && url && key && !demoOpen) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !path.startsWith("/learn/welcome")) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", path);
      return NextResponse.redirect(login);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/learn/:path*",
    "/login",
    "/signup",
    "/auth/callback",
  ],
};
