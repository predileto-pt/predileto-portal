"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { parseInitialLocation } from "@/lib/search-url";

const AISearchPage = dynamic(
  () => import("@/components/ai-search-page").then((m) => m.AISearchPage),
  { ssr: false },
);

export default function ArrendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = use(params);
  const sp = use(searchParams);
  const initialQuery = typeof sp.q === "string" ? sp.q : undefined;
  const initialLocation = parseInitialLocation(sp);

  return (
    <AISearchPage
      listingType="rent"
      locale={locale}
      initialQuery={initialQuery}
      initialLocation={initialLocation}
      landingMode="subheader"
    />
  );
}
