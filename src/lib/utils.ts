import { twMerge } from "tailwind-merge";

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return twMerge(classes.filter(Boolean).join(" "));
}

const LOCALE_MAP: Record<string, string> = {
  pt: "pt-PT",
  en: "en-GB",
};

const COUNTRY_FORMAT: Record<string, { locale: string; currency: string }> = {
  Portugal: { locale: "pt-PT", currency: "EUR" },
  PT: { locale: "pt-PT", currency: "EUR" },
};

function priceFormatter(
  locale: string,
  country?: string | null,
): { formatter: Intl.NumberFormat; currency: string } {
  const config =
    (country && COUNTRY_FORMAT[country]) || {
      locale: LOCALE_MAP[locale] || "pt-PT",
      currency: "EUR",
    };
  return {
    formatter: new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    currency: config.currency,
  };
}

export function formatPrice(
  amount: number,
  locale: string = "pt",
  country?: string | null,
): string {
  return priceFormatter(locale, country).formatter.format(amount);
}

/**
 * Same locale/country logic as `formatPrice`, but splits the currency
 * symbol out from the numeric value so the caller can style them
 * separately (e.g. a smaller, lighter € next to a bold number).
 */
export function formatPriceParts(
  amount: number,
  locale: string = "pt",
  country?: string | null,
): { value: string; currency: string } {
  const parts = priceFormatter(locale, country).formatter.formatToParts(amount);
  let currency = "";
  let value = "";
  for (const p of parts) {
    if (p.type === "currency") currency = p.value;
    else value += p.value;
  }
  return { value: value.trim(), currency };
}

export function formatDate(dateString: string, locale: string = "pt"): string {
  return new Date(dateString).toLocaleDateString(LOCALE_MAP[locale] || "pt-PT", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatArea(sqm: number): string {
  return `${sqm} m²`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
