"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import type { Locale } from "./i18n";

interface LocaleContextValue {
  locale: Locale;
  /**
   * Persist a new locale to cookie + reload so server components
   * pick up the new dictionary on next render. Reload is the simplest
   * sync mechanism — fancier approaches (router refresh + per-route
   * dict invalidation) are over-engineering for a two-language site.
   */
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "pt",
  setLocale: () => {
    /* no-op default; replaced by Provider */
  },
});

interface LocaleProviderProps {
  locale: Locale;
  children: ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const setLocale = useCallback((next: Locale) => {
    // 1 year max-age; SameSite=Lax keeps it on top-level navigations.
    document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Read the current locale from a client component. Mirrors the value
 * the server resolved via `getServerLocale()` and set on the provider
 * at the root layout. Re-renders the consumer when the provider value
 * changes (it won't, in steady state — `setLocale` triggers a full
 * page reload).
 */
export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
