"use client";

import { use } from "react";
import dynamic from "next/dynamic";

const AISearchPage = dynamic(
  () => import("@/components/ai-search-page").then((m) => m.AISearchPage),
  { ssr: false },
);

export default function ArrendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  return <AISearchPage listingType="rent" locale={locale} />;
}
