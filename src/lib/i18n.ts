export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export type Dictionary = Awaited<typeof import("@/dictionaries/pt.json")>;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  pt: () => import("@/dictionaries/pt.json"),
  en: () => import("@/dictionaries/en.json"),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const mod = await dictionaries[locale]();
  return { ...mod };
}

export const localeNames: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
};

export const localeToDateLocale: Record<Locale, string> = {
  pt: "pt-PT",
  en: "en-GB",
};
