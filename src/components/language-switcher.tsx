"use client";

import { locales, localeNames, isValidLocale, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Locale picker. Reads the active locale + setter from the
 * `LocaleProvider` context (cookie-backed) instead of mutating the
 * URL's first segment — URLs no longer carry a `/[locale]/` prefix.
 *
 * The `locale` prop is retained for callers that already have the
 * value at hand; if omitted, falls back to the context.
 */
export function LanguageSwitcher({ locale }: { locale?: Locale }) {
  const { locale: ctxLocale, setLocale } = useLocale();
  const current = locale ?? ctxLocale;

  function handleChange(value: string) {
    if (!isValidLocale(value)) return;
    setLocale(value as Locale);
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger aria-label="Language" className="h-8 w-auto min-w-[6rem]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l} value={l}>
            {localeNames[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
