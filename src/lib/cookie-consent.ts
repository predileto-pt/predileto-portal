// Cookie-consent state — single source of truth for whether the user
// has authorized non-essential cookies (analytics). The actual cookie
// is `cookies_consent` with values "accepted" or "declined"; absence
// means undecided and the modal should be shown.
//
// PostHog is wired up in `posthog-provider.tsx` to subscribe to changes
// here so it can init lazily when the user accepts (and stay dormant
// when they decline).

export const CONSENT_COOKIE = "cookies_consent";
export const CONSENT_EVENT = "cookies-consent-change";

export type ConsentValue = "accepted" | "declined" | "undecided";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) return part.slice(prefix.length);
  }
  return undefined;
}

export function getConsent(): ConsentValue {
  const raw = readCookie(CONSENT_COOKIE);
  if (raw === "accepted" || raw === "declined") return raw;
  return "undecided";
}

export function setConsent(value: Exclude<ConsentValue, "undecided">): void {
  if (typeof document === "undefined") return;
  // 12 months — typical retention for a consent decision under GDPR
  // guidance, after which we should re-ask.
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
  window.dispatchEvent(
    new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }),
  );
}

export function subscribeConsent(
  callback: (value: ConsentValue) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<ConsentValue>).detail;
    callback(detail ?? getConsent());
  };
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}
