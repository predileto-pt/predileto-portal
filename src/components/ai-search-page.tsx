"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AIPropertiesSearcher,
  type AiSearchListingType,
  type AiSearchPayload,
} from "@/components/ai-properties-searcher";
import {
  SearchThread,
  type SearchMessage,
} from "@/components/search-thread";
import {
  SearchResults,
  type SearchResultItem,
} from "@/components/search-results";
import { SearchSubheader } from "@/components/search-subheader";
import {
  ResultsFilterSidebar,
  applyResultsFilter,
  initialFilterState,
  type ResultsFilterState,
} from "@/components/results-filter-sidebar";
import type {
  ListedListingType,
  ListedTypology,
  LocationSelection,
  PaginatedListings,
} from "@/lib/estate-os";
import { mapListedToSearchResult } from "@/lib/estate-os";
import type { Typology } from "@/lib/search-rules";
import {
  ActivePropertyProvider,
  useActivePropertyId,
} from "@/components/active-property-provider";
import { PropertyChat } from "@/components/property-chat";

interface AISearchPageProps {
  listingType: AiSearchListingType;
  locale: string;
  initialQuery?: string;
  initialLocation?: LocationSelection | null;
}

type SearchError =
  | { kind: "validation"; code: string; message: string }
  | { kind: "server"; message: string };

// Portal typologies map 1:1 onto estate-os typologies today.
const TYPOLOGY_TO_ESTATE_OS: Record<Typology, ListedTypology> = {
  house: "house",
  apartment: "apartment",
  land: "land",
  ruin: "ruin",
};

function listingTypeToEstateOs(t: AiSearchListingType): ListedListingType {
  return t === "buy" ? "sale" : "purchase";
}

function locationParam(
  location: LocationSelection | null,
): { key: "district" | "municipality" | "parish"; value: string } | null {
  if (!location) return null;
  return { key: location.level, value: location.name };
}

function buildSearchUrl(payload: AiSearchPayload): string {
  const params = new URLSearchParams();
  const trimmed = payload.query.trim();
  if (trimmed) params.set("q", trimmed);
  params.set("listing_type", listingTypeToEstateOs(payload.listingType));
  const loc = locationParam(payload.location);
  if (loc) params.set(loc.key, loc.value);
  if (payload.typology) {
    params.set("typology", TYPOLOGY_TO_ESTATE_OS[payload.typology]);
  }
  if (payload.minPrice !== undefined)
    params.set("min_price", String(payload.minPrice));
  if (payload.maxPrice !== undefined)
    params.set("max_price", String(payload.maxPrice));
  return `/api/listings/search?${params.toString()}`;
}

export function AISearchPage({
  listingType,
  locale,
  initialQuery,
  initialLocation = null,
}: AISearchPageProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [results, setResults] = useState<SearchResultItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SearchError | null>(null);
  const [lastPayload, setLastPayload] = useState<AiSearchPayload | null>(null);
  const [filterState, setFilterState] =
    useState<ResultsFilterState>(initialFilterState);
  const [chatOpen, setChatOpen] = useState(true);
  const bootstrappedRef = useRef(false);

  function openAgentForCard(item: SearchResultItem) {
    const node = document.querySelector(
      `[data-property-id="${CSS.escape(item.id)}"]`,
    );
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    setChatOpen(true);
  }

  const hasSearched = messages.length > 0;

  const handleSearch = useCallback(async (payload: AiSearchPayload) => {
    const message: SearchMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      query: payload.query,
      location: payload.location,
      at: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
    setLastPayload(payload);
    setFilterState(initialFilterState);
    setLoading(true);
    setResults(null);
    setError(null);
    setChatOpen(true);

    try {
      const res = await fetch(buildSearchUrl(payload), { method: "GET" });
      if (res.status === 422) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: { code?: string; message?: string };
        };
        setError({
          kind: "validation",
          code: body.error?.code ?? "validation_error",
          message:
            body.error?.message ??
            "Escolha uma localização para pesquisar com texto livre.",
        });
        setResults([]);
        return;
      }
      if (!res.ok) {
        setError({
          kind: "server",
          message: `Não foi possível pesquisar (HTTP ${res.status}).`,
        });
        setResults([]);
        return;
      }
      const payload2 = (await res.json()) as PaginatedListings;
      setResults(payload2.items.map(mapListedToSearchResult));
    } catch (err) {
      setError({
        kind: "server",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível pesquisar.",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSubheaderSearch(payload: AiSearchPayload) {
    if (payload.listingType !== listingType) {
      const target = payload.listingType === "buy" ? "comprar" : "arrendar";
      const params = new URLSearchParams();
      if (payload.query) params.set("q", payload.query);
      const loc = locationParam(payload.location);
      if (loc) params.set(loc.key, loc.value);
      const qs = params.toString();
      router.push(`/${locale}/${target}${qs ? `?${qs}` : ""}`);
      return;
    }
    void handleSearch(payload);
  }

  useEffect(() => {
    if (bootstrappedRef.current) return;
    const seed = initialQuery?.trim();
    if (!seed) return;
    if (!initialLocation) return; // q+location both required to auto-fire
    bootstrappedRef.current = true;
    void handleSearch({
      query: seed,
      listingType,
      location: initialLocation,
    });
  }, [initialQuery, initialLocation, listingType, handleSearch]);

  const availableBedrooms = useMemo(() => {
    if (!results || results.length === 0) return [];
    const set = new Set<number>();
    for (const item of results) {
      if (item.bedrooms >= 4) set.add(4);
      else if (item.bedrooms >= 0) set.add(item.bedrooms);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [results]);

  if (!hasSearched) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-3 lg:px-6 lg:py-4">
        <AIPropertiesSearcher
          listingType={listingType}
          onSearch={handleSearch}
          initialQuery={initialQuery}
          initialLocation={initialLocation}
        />
      </div>
    );
  }

  const subheaderPayload: AiSearchPayload = lastPayload ?? {
    query: initialQuery ?? "",
    listingType,
    location: initialLocation,
  };

  const filteredResults =
    results === null ? null : applyResultsFilter(results, filterState);

  return (
    <ActivePropertyProvider>
      <SearchSubheader
        current={subheaderPayload}
        loading={loading}
        onSearch={handleSubheaderSearch}
      />

      <div className="mx-auto px-2 lg:px-3 py-4 lg:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Mobile: collapsible filters above the feed */}
        <div className="lg:hidden">
          <ResultsFilterSidebar
            state={filterState}
            onChange={setFilterState}
            total={results?.length ?? 0}
            matched={filteredResults?.length ?? 0}
            availableBedrooms={availableBedrooms}
            collapsible
          />
        </div>

        <aside className="hidden lg:block lg:col-span-2 lg:sticky lg:top-28">
          <ResultsFilterSidebar
            state={filterState}
            onChange={setFilterState}
            total={results?.length ?? 0}
            matched={filteredResults?.length ?? 0}
            availableBedrooms={availableBedrooms}
          />
        </aside>

        <section className="lg:col-span-6 space-y-3">
          {error && (
            <SearchErrorBanner
              error={error}
              onRetry={
                lastPayload && error.kind === "server"
                  ? () => void handleSearch(lastPayload)
                  : undefined
              }
            />
          )}
          <SearchResults
            items={filteredResults}
            loading={loading}
            locale={locale}
            onOpenAgent={openAgentForCard}
          />
        </section>

        <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
          <ChatRail
            results={results ?? []}
            locale={locale}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
          />
          <SearchThread messages={messages} />
        </aside>
      </div>
    </ActivePropertyProvider>
  );
}

/**
 * Renders the property chat panel for the currently-active result card.
 * Sits inside the right rail above the search history. `forcedId` lets the
 * caller pin the chat to a specific property (used by the "Falar com agente"
 * card action) until the user scrolls to a different active id.
 */
function ChatRail({
  results,
  locale,
  open,
  onClose,
}: {
  results: SearchResultItem[];
  locale: string;
  open: boolean;
  onClose: () => void;
}) {
  const activeId = useActivePropertyId();
  const property = useMemo(
    () => results.find((r) => r.id === activeId) ?? null,
    [results, activeId],
  );
  if (!property) return null;
  return (
    <PropertyChat
      property={property}
      locale={locale}
      open={open}
      onClose={onClose}
    />
  );
}

function SearchErrorBanner({
  error,
  onRetry,
}: {
  error: SearchError;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="border border-rule bg-paper-muted text-ink-secondary text-sm rounded-md px-4 py-3 flex items-center justify-between gap-3"
    >
      <span>{error.message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold text-primary underline underline-offset-2 cursor-pointer"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
