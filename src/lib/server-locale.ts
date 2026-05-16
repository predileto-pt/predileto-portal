import { cookies } from "next/headers";
import { isValidLocale, defaultLocale, type Locale } from "./i18n";

/**
 * Server-side locale resolution.
 *
 * Reads the `locale` cookie set by middleware (which detects the
 * preference from Accept-Language on first visit). Falls back to
 * `defaultLocale` if the cookie is missing or carries an unknown
 * value.
 *
 * Use from server components / route handlers where you'd previously
 * have read `params.locale`. Client components consume the same value
 * via the `LocaleProvider` context — see `src/lib/locale-context.tsx`.
 */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("locale")?.value;
  return value && isValidLocale(value) ? (value as Locale) : defaultLocale;
}
