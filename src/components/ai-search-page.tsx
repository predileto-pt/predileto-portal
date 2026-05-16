"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  messagesAtom,
  resultsAtom,
  nextCursorAtom,
  lastPayloadAtom,
  filterStateAtom,
  chatOpenAtom,
} from "@/lib/state/search-atoms";
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
import { useDictionary } from "@/components/dictionary-provider";
import { HomePromptExamples } from "@/components/landing/home-sections";
import { LocationTreeSection } from "@/components/landing/location-tree";
import { FeaturedDestinations } from "@/components/landing/featured-destinations";

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

function buildSearchUrl(payload: AiSearchPayload, cursor?: string): string {
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
  if (cursor) params.set("cursor", cursor);
  return `/api/listings/search?${params.toString()}`;
}

export function AISearchPage({
  listingType,
  locale,
  initialQuery,
  initialLocation = null,
}: AISearchPageProps) {
  const router = useRouter();
  const [messages, setMessages] = useAtom(messagesAtom(listingType));
  const [results, setResults] = useAtom(resultsAtom(listingType));
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useAtom(nextCursorAtom(listingType));
  const [error, setError] = useState<SearchError | null>(null);
  const [lastPayload, setLastPayload] = useAtom(lastPayloadAtom(listingType));
  const [filterState, setFilterState] = useAtom(filterStateAtom(listingType));
  const [chatOpen, setChatOpen] = useAtom(chatOpenAtom(listingType));
  const bootstrappedRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
    setNextCursor(null);
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
      setNextCursor(payload2.next_cursor);
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

  const loadMore = useCallback(async () => {
    if (!lastPayload || !nextCursor || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      const res = await fetch(buildSearchUrl(lastPayload, nextCursor), {
        method: "GET",
      });
      // ADR-016 §9: any 400 from a cursor request means the cursor went
      // stale (schema bump / filter drift). Recovery is to drop the
      // cursor and stop appending — the user keeps the items they have.
      if (res.status === 400) {
        setNextCursor(null);
        return;
      }
      if (!res.ok) return;
      const page = (await res.json()) as PaginatedListings;
      setResults((prev) => [
        ...(prev ?? []),
        ...page.items.map(mapListedToSearchResult),
      ]);
      setNextCursor(page.next_cursor);
    } catch {
      // Swallow — user scrolls again, we retry.
    } finally {
      setLoadingMore(false);
    }
  }, [lastPayload, nextCursor, loadingMore, loading]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !nextCursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void loadMore();
          }
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [nextCursor, loadMore]);

  function handleSubheaderSearch(payload: AiSearchPayload) {
    if (payload.listingType !== listingType) {
      const target = payload.listingType === "buy" ? "comprar" : "arrendar";
      const params = new URLSearchParams();
      if (payload.query) params.set("q", payload.query);
      const loc = locationParam(payload.location);
      if (loc) params.set(loc.key, loc.value);
      const qs = params.toString();
      router.push(`/${target}${qs ? `?${qs}` : ""}`);
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
    // Persisted atom already has state from a prior search on this
    // listing type — don't clobber it by re-firing the seeded query.
    if (messages.length > 0) return;
    void handleSearch({
      query: seed,
      listingType,
      location: initialLocation,
    });
  }, [initialQuery, initialLocation, listingType, handleSearch, messages.length]);

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
      <UnsearchedLanding
        listingType={listingType}
        locale={locale}
        initialQuery={initialQuery}
        initialLocation={initialLocation}
        onSearch={handleSearch}
      />
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
          {nextCursor && (
            <div
              ref={sentinelRef}
              aria-hidden
              className="h-10"
            />
          )}
          {loadingMore && (
            <p
              role="status"
              className="text-center text-xs text-ink-muted py-3"
            >
              A carregar mais resultados…
            </p>
          )}
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

/**
 * Landing layout shown when the user lands on `/comprar` or `/arrendar`
 * with no active search. Hero composer at the top, then prompt examples
 * and a browsable location tree (idealista-style) for discoverability.
 */
function UnsearchedLanding({
  listingType,
  locale,
  initialQuery,
  initialLocation,
  onSearch,
}: {
  listingType: AiSearchListingType;
  locale: string;
  initialQuery?: string;
  initialLocation?: LocationSelection | null;
  onSearch: (payload: AiSearchPayload) => void;
}) {
  const dict = useDictionary() as unknown as Record<
    string,
    Record<string, string>
  >;
  const prompts = dict.homePrompts ?? {};
  const browse = dict.locationsBrowse ?? {};
  const landing = dict.searchLanding ?? {};
  const mode = listingType === "buy" ? "comprar" : "arrendar";

  return (
    <div className="grid grid-cols-12 gap-0">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        aria-labelledby="search-hero-heading"
        className="col-span-12 relative bg-canvas"
      >
        {/* Soft warm radial glow as backdrop — no images, pure CSS */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(38 92% 50% / 0.10), transparent 70%), radial-gradient(ellipse 60% 50% at 20% 40%, hsl(172 66% 50% / 0.08), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary font-semibold mb-4">
              {landing.eyebrow ??
                (listingType === "buy"
                  ? "Comprar em Portugal"
                  : "Arrendar em Portugal")}
            </p>
            <h1
              id="search-hero-heading"
              className="text-balance text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-heading tracking-heading text-ink"
            >
              {landing.heading ?? "Descreve a casa."}{" "}
              <span className="landing-gradient-text italic">
                {landing.headingAccent ?? "Nós encontramos."}
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-ink-secondary leading-body max-w-xl mx-auto">
              {landing.subheading ??
                "Pesquisa em linguagem natural. Sem filtros, sem formulários, só o que importa."}
            </p>
          </div>

          <AIPropertiesSearcher
            listingType={listingType}
            onSearch={onSearch}
            initialQuery={initialQuery}
            initialLocation={initialLocation ?? null}
          />
        </div>
      </section>

      {/* ── Featured destinations ────────────────────────────────── */}
      <FeaturedDestinations
        locale={locale}
        mode={mode}
        eyebrow={landing.destinationsEyebrow ?? "Por onde queres viver"}
        heading={landing.destinationsHeading ?? "Destinos em Portugal"}
        cta={landing.destinationsCta ?? "Ver todos os distritos"}
      />

      {/* ── Prompt examples ──────────────────────────────────────── */}
      <HomePromptExamples copy={prompts} locale={locale} />

      {/* ── Full location tree (anchor target from destinations CTA) */}
      <div id="all-locations" className="col-span-12 contents">
        <LocationTreeSection
          locale={locale}
          mode={mode}
          heading={
            (listingType === "buy"
              ? browse.headingBuy
              : browse.headingRent) ?? ""
          }
          subheading={browse.subheading ?? ""}
        />
      </div>
    </div>
  );
}
