"use client";

/**
 * Search history bridges to the existing `src/lib/search-history.ts` module
 * — it stays client-only (per ADR-001 §4) and lives in its own localStorage
 * key (`predileto:search-history:v1`). This file exists so consumers can
 * import from a uniform session-slice namespace; the implementation is
 * still the existing module under the hood.
 */

export {
  addEntry,
  listEntries,
  clear,
  buildHistoryKey,
  formatHistoryLabel,
} from "@/lib/search-history";
export type { SearchHistoryEntry, ListingType } from "@/lib/search-history";
