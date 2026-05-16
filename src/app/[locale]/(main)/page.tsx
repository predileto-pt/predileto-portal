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

  // Editorial landing: hero prompt + featured destinations + location
  // tree. AISearchPage delegates to <UnsearchedLanding> when no search
  // has been performed (the default `landingMode="editorial"`).
  // Default listingType is "rent" — switching is handled inside the
  // AISearchPage UI via the prompt.
  return <AISearchPage listingType="rent" locale={locale} />;
}
