"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n";

const AISearchPage = dynamic(
  () => import("@/components/ai-search-page").then((m) => m.AISearchPage),
  { ssr: false },
);

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  if (!isValidLocale(locale)) notFound();

  // Home renders the same hero + featured-destinations + location-tree
  // experience that used to live at /pt/arrendar (AISearchPage). Default
  // mode is "rent" — the page's internal search UI handles switching
  // intent via the prompt. If we want an explicit buy/rent toggle at
  // the top of the page, that's a follow-up.
  return <AISearchPage listingType="rent" locale={locale} />;
}
