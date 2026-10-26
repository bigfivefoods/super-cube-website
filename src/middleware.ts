import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  isPrefixedLocale,
  localizedPath,
  stripLocale,
} from "@/lib/i18n/config";

/**
 * /learn pages a visitor who isn't signed in may open when the demo is off.
 *
 * These are page shells only. Payment is enforced by the server: /api/lms/*,
 * /api/certificates/* and the after-test refuse visitors who aren't signed in
 * (401) or haven't paid (402). Session pages outside the free sample render the
 * paywall card instead of their content, so they can be public too.
 * The after-test, mid check-in, report/certificate, coach, org and analytics
 * pages still need a sign-in.
 */
const PUBLIC_LEARN_PREFIXES = [
  "/learn/demo",
  "/learn/start",
  "/learn/onboarding",
  "/learn/feedback",
  "/learn/practice",
  "/learn/account",
  "/learn/consent",
  "/learn/welcome",
  // Progress works on this device when signed out (with a prompt to sign in)
  "/learn/progress",
];
const PUBLIC_LEARN_SECTIONS = ["/learn/pulse", "/learn/programmes", "/learn/courses"];
const PUBLIC_LEARN_EXACT = [
  "/learn",
  // Free baseline entry (orientation + baseline); /learn/assessment/post and /mid stay gated
  "/learn/assessment",
  "/learn/assessment/orientation",
  "/learn/assessment/pre",
];

function isPublicLearnPath(path: string): boolean {
  const p = path.length > 1 ? path.replace(/\/+$/, "") : path;
  if (PUBLIC_LEARN_EXACT.includes(p)) return true;
  if (PUBLIC_LEARN_PREFIXES.some((x) => p.startsWith(x))) return true;
  return PUBLIC_LEARN_SECTIONS.some((x) => p === x || p.startsWith(x + "/"));
}

/**
 * Unprefixed /learn follows the language the visitor already chose.
 * The cookie wins. English in the cookie stays on /learn (so the switcher
 * can leave a French page). With no cookie, a same-site referer such as
 * /fr/pricing keeps them in French. Nothing uses the browser language.
 */
function learnLocaleRedirect(request: NextRequest): NextResponse | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const path = request.nextUrl.pathname;
  if (path !== "/learn" && !path.startsWith("/learn/")) return null;
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie === "en") return null;
  let locale: string | null = null;
  if (isPrefixedLocale(cookie)) locale = cookie;
  else if (!cookie) {
    const ref = request.headers.get("referer");
    if (ref) {
      try {
        const u = new URL(ref);
        if (u.origin === request.nextUrl.origin) {
          const seg = u.pathname.split("/")[1];
          if (isPrefixedLocale(seg)) locale = seg;
        }
      } catch {
        /* ignore a bad referer */
      }
    }
  }
  if (!isPrefixedLocale(locale)) return null;
  const dest = request.nextUrl.clone();
  dest.pathname = localizedPath(locale, path);
  return NextResponse.redirect(dest);
}

export async function middleware(request: NextRequest) {
  const localeRedirect = learnLocaleRedirect(request);
  if (localeRedirect) return localeRedirect;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const demoOpen = process.env.NEXT_PUBLIC_DEMO_LMS_OPEN === "true";
  const path = request.nextUrl.pathname;
  const learnPath = stripLocale(path);

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

  // Hard gate only when Supabase is live and demo is off. Locale prefixes are stripped first.
  if (learnPath.startsWith("/learn") && url && key && !demoOpen) {
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

    // Pages a visitor who isn't signed in may open (see isPublicLearnPath)
    const publicLearn = isPublicLearnPath(learnPath);
    if (!user && !publicLearn) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", path);
      return NextResponse.redirect(login);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/learn",
    "/learn/:path*",
    "/fr/learn",
    "/fr/learn/:path*",
    "/ar/learn",
    "/ar/learn/:path*",
    "/pt/learn",
    "/pt/learn/:path*",
    "/sw/learn",
    "/sw/learn/:path*",
    "/zu/learn",
    "/zu/learn/:path*",
    "/af/learn",
    "/af/learn/:path*",
    "/login",
    "/signup",
    "/auth/callback",
  ],
};
