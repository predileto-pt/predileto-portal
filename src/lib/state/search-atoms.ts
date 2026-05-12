import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { AiSearchPayload } from "@/components/ai-properties-searcher";
import type { SearchMessage } from "@/components/search-thread";
import type { SearchResultItem } from "@/components/search-results";
import {
  initialFilterState,
  type ResultsFilterState,
} from "@/components/results-filter-sidebar";

/**
 * Per-listing-type search state that must survive a route remount
 * (e.g. clicking a result card, then returning to /comprar via the
 * back link). Transient flags like `loading` / `error` stay in
 * component-local state — only the data shown to the user persists.
 */
type ListingType = "buy" | "rent";

export const messagesAtom = atomFamily((_: ListingType) =>
  atom<SearchMessage[]>([]),
);

export const resultsAtom = atomFamily((_: ListingType) =>
  atom<SearchResultItem[] | null>(null),
);

export const nextCursorAtom = atomFamily((_: ListingType) =>
  atom<string | null>(null),
);

export const lastPayloadAtom = atomFamily((_: ListingType) =>
  atom<AiSearchPayload | null>(null),
);

export const filterStateAtom = atomFamily((_: ListingType) =>
  atom<ResultsFilterState>(initialFilterState),
);

export const chatOpenAtom = atomFamily((_: ListingType) => atom<boolean>(true));
