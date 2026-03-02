"use client";

import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n";
import { Select } from "@/components/ui/select";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    window.location.href = segments.join("/");
  }

  const options = locales.map((l) => ({
    value: l,
    label: localeNames[l],
  }));

  return (
    <Select
      value={locale}
      onValueChange={switchLocale}
      options={options}
      ariaLabel="Language"
    />
  );
}
