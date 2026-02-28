export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

const LOCALE_MAP: Record<string, string> = {
  pt: "pt-PT",
  en: "en-GB",
};

export function formatPrice(amount: number, locale: string = "pt"): string {
  return new Intl.NumberFormat(LOCALE_MAP[locale] || "pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
