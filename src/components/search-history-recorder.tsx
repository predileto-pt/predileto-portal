"use client";

import { useEffect, useRef } from "react";
import {
  addEntry,
  formatHistoryLabel,
  type ListingType,
} from "@/lib/search-history";
import { useDictionary } from "@/components/dictionary-provider";
import type { ResolvedLocation } from "@/lib/locations";

interface SearchHistoryRecorderProps {
  url: string;
  listingType: ListingType;
  count: number;
  resolved: ResolvedLocation;
  filters: {
    q?: string;
    propertyType?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
  };
  hasFilters: boolean;
}

export function SearchHistoryRecorder({
  url,
  listingType,
  count,
  resolved,
  filters,
  hasFilters,
}: SearchHistoryRecorderProps) {
  const dict = useDictionary();
  const recordedRef = useRef(false);

  useEffect(() => {
    if (recordedRef.current) return;
    if (!hasFilters) return;
    recordedRef.current = true;

    const sh = (dict as unknown as Record<string, Record<string, string>>)
      .searchHistory;
    const ptypes = (dict as unknown as Record<string, Record<string, string>>)
      .propertyTypes;
    const fallback = sh?.entryFallback ?? "Pesquisa";

    const label = formatHistoryLabel({
      resolved,
      filters,
      dict: { propertyTypes: ptypes, searchHistory: sh },
      fallback,
    });

    addEntry(listingType, {
      url,
      label,
      count,
      timestamp: Date.now(),
    });
  }, [url, listingType, count, resolved, filters, hasFilters, dict]);

  return null;
}
