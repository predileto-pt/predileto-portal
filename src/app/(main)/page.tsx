"use client";

import dynamic from "next/dynamic";
import { useLocale } from "@/lib/locale-context";

const AISearchPage = dynamic(
  () => import("@/components/ai-search-page").then((m) => m.AISearchPage),
  { ssr: false },
);

export default function HomePage() {
  // Home renders the same hero + featured-destinations + location-tree
  // experience that lives at /arrendar (AISearchPage). Default mode is
  // "rent" — the page's internal search UI handles switching intent
  // via the prompt. If we want an explicit buy/rent toggle at the top
  // of the page, that's a follow-up.
  const { locale } = useLocale();
  return <AISearchPage listingType="rent" locale={locale} />;
}
