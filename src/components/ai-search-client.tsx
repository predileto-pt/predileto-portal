"use client";

import dynamic from "next/dynamic";
import type { LocationSelection } from "@/lib/estate-os";
import type { AiSearchListingType } from "@/components/ai-properties-searcher";

// AISearchPage reads localStorage via jotai atomWithStorage, so we keep
// it client-only — server rendering would otherwise crash on the missing
// `window` global.
const AISearchPage = dynamic(
  () => import("@/components/ai-search-page").then((m) => m.AISearchPage),
  { ssr: false },
);

interface AISearchClientProps {
  listingType: AiSearchListingType;
  locale: string;
  initialQuery?: string;
  initialLocation?: LocationSelection | null;
}

export function AISearchClient({
  listingType,
  locale,
  initialQuery,
  initialLocation,
}: AISearchClientProps) {
  return (
    <AISearchPage
      listingType={listingType}
      locale={locale}
      initialQuery={initialQuery}
      initialLocation={initialLocation}
    />
  );
}
