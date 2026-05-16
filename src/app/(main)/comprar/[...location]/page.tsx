import { notFound } from "next/navigation";
import { AISearchClient } from "@/components/ai-search-client";
import { getServerLocale } from "@/lib/server-locale";
import {
  resolveLocationFromSlugs,
  resolvedToLocationSelection,
} from "@/lib/locations";

export const dynamic = "force-dynamic";

export default async function ComprarLocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ location: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const { location } = await params;
  const sp = await searchParams;

  const resolved = resolveLocationFromSlugs(location);
  if (!resolved.valid) notFound();

  const initialQuery = typeof sp.q === "string" ? sp.q : undefined;
  const initialLocation = resolvedToLocationSelection(resolved);

  return (
    <AISearchClient
      listingType="buy"
      locale={locale}
      initialQuery={initialQuery}
      initialLocation={initialLocation}
    />
  );
}
