import type { ResolvedLocation } from "@/lib/locations";

export type ListingType = "buy" | "rent";

export interface SearchHistoryEntry {
  url: string;
  label: string;
  count: number;
  timestamp: number;
}

interface StoredShape {
  buy: SearchHistoryEntry[];
  rent: SearchHistoryEntry[];
}

const STORAGE_KEY = "predileto:search-history:v1";
const MAX_PER_LIST = 10;

const FILTER_KEYS = ["q", "propertyType", "minPrice", "maxPrice", "bedrooms"] as const;

function emptyState(): StoredShape {
  return { buy: [], rent: [] };
}

function safeParse(raw: string | null): StoredShape {
  if (!raw) return emptyState();
  try {
    const parsed = JSON.parse(raw) as Partial<StoredShape> | null;
    return {
      buy: Array.isArray(parsed?.buy) ? (parsed!.buy as SearchHistoryEntry[]) : [],
      rent: Array.isArray(parsed?.rent) ? (parsed!.rent as SearchHistoryEntry[]) : [],
    };
  } catch {
    return emptyState();
  }
}

function readState(): StoredShape {
  try {
    if (typeof window === "undefined") return emptyState();
    return safeParse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return emptyState();
  }
}

function writeState(state: StoredShape): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("predileto:search-history-change"));
  } catch {
    // quota / private mode / disabled — fail silent
  }
}

/**
 * Build the dedupe key for a given URL.
 * Uses pathname + the active filter params (q, propertyType, minPrice,
 * maxPrice, bedrooms). Excludes `page` and `selected` so paginating doesn't
 * pollute history.
 */
export function buildHistoryKey(url: string): string {
  let pathname = url;
  let search = "";
  const qIndex = url.indexOf("?");
  if (qIndex >= 0) {
    pathname = url.slice(0, qIndex);
    search = url.slice(qIndex + 1);
  }
  const incoming = new URLSearchParams(search);
  const out = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = incoming.get(key);
    if (value && value.trim() !== "") out.set(key, value);
  }
  const qs = out.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export interface FormatLabelInputs {
  resolved?: ResolvedLocation;
  filters?: Partial<Record<(typeof FILTER_KEYS)[number], string | undefined>>;
  dict: {
    propertyTypes?: Record<string, string>;
    searchHistory?: Record<string, string>;
  };
  fallback: string;
}

/**
 * Build a human-readable summary like "T2 em Lisboa" from the resolved
 * location and filters. Captured at write time in the visitor's locale; not
 * re-translated on language switch.
 */
export function formatHistoryLabel(input: FormatLabelInputs): string {
  const { resolved, filters, dict, fallback } = input;
  const parts: string[] = [];

  const beds = filters?.bedrooms;
  if (beds && /^\d+$/.test(beds)) parts.push(`T${beds}`);

  const ptype = filters?.propertyType;
  if (ptype) {
    const label = dict.propertyTypes?.[ptype] ?? ptype;
    parts.push(label);
  }

  const locationName =
    resolved?.parish?.name ??
    resolved?.municipality?.name ??
    resolved?.district?.name ??
    resolved?.region?.name;

  const inWord = dict.searchHistory?.in ?? "em";
  if (locationName) {
    if (parts.length > 0) parts.push(`${inWord} ${locationName}`);
    else parts.push(locationName);
  }

  const q = filters?.q?.trim();
  if (q && parts.length === 0) parts.push(`"${q}"`);

  if (filters?.maxPrice && /^\d+$/.test(filters.maxPrice)) {
    const upTo = dict.searchHistory?.upTo ?? "até";
    parts.push(`${upTo} ${formatPriceCompact(Number(filters.maxPrice))}`);
  }

  return parts.length > 0 ? parts.join(" ") : fallback;
}

function formatPriceCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M€`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k€`;
  return `${value}€`;
}

export function listEntries(type: ListingType): SearchHistoryEntry[] {
  return readState()[type];
}

export function addEntry(type: ListingType, entry: SearchHistoryEntry): void {
  const state = readState();
  const key = buildHistoryKey(entry.url);
  const filtered = state[type].filter((e) => buildHistoryKey(e.url) !== key);
  const next = [entry, ...filtered].slice(0, MAX_PER_LIST);
  state[type] = next;
  writeState(state);
}

export function clear(type: ListingType): void {
  const state = readState();
  state[type] = [];
  writeState(state);
}

export const __INTERNAL = { STORAGE_KEY, MAX_PER_LIST, FILTER_KEYS };
