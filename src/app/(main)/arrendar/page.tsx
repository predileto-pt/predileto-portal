import { AISearchClient } from "@/components/ai-search-client";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocationFromSearchParams } from "@/lib/locations";

export const dynamic = "force-dynamic";

export default async function ArrendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const sp = await searchParams;
  const initialQuery = typeof sp.q === "string" ? sp.q : undefined;
  const initialLocation = pickLocationFromSearchParams(sp);

  return (
    <AISearchClient
      listingType="rent"
      locale={locale}
      initialQuery={initialQuery}
      initialLocation={initialLocation}
    />
  );
}
