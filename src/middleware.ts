import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isValidLocale, type Locale } from "@/lib/i18n";

/**
 * Locale detection middleware.
 *
 * URLs no longer carry a `/[locale]/` prefix — preference flows through
 * a `locale` cookie. First-time visitors get the cookie set from their
 * `Accept-Language` header; subsequent visits read the cookie and pass
 * through untouched.
 *
 * Server components read the cookie via `getServerLocale()`; client
 * components read it via `useLocale()`.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files — middleware matcher already
  // excludes most of these, but be defensive against edge cases.
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const cookieLocale = request.cookies.get("locale")?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return NextResponse.next();
  }

  // First visit (or stale/invalid cookie): pick a locale from
  // Accept-Language and persist it.
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const detected = detectLocale(acceptLanguage);
  const response = NextResponse.next();
  response.cookies.set("locale", detected, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  return response;
}

function detectLocale(acceptLanguage: string): Locale {
  // Parse a typical header like "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7"
  // — split on commas, drop q-values, take the language code prefix.
  // No need for full RFC 4647 matching; the locale set is tiny.
  const candidates = acceptLanguage
    .toLowerCase()
    .split(",")
    .map((entry) => entry.trim().split(";")[0]?.split("-")[0])
    .filter(Boolean) as string[];

  for (const code of candidates) {
    if (locales.includes(code as Locale)) {
      return code as Locale;
    }
  }
  return defaultLocale;
}

export const config = {
  // Run on all paths except Next internals, the api proxy, and the
  // favicon. Static assets (anything with a `.`) are short-circuited
  // inside the middleware body for belt-and-braces.
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
