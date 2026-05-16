import { AISearchClient } from "@/components/ai-search-client";
import { getServerLocale } from "@/lib/server-locale";

export default async function HomePage() {
  const locale = await getServerLocale();
  // Home defaults to rent. Users switch listing type via the AI search
  // UI or by navigating to /comprar.
  return <AISearchClient listingType="rent" locale={locale} />;
}
