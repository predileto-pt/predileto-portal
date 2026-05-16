import { SearchPage } from "@/components/search-page";
import { getServerLocale } from "@/lib/server-locale";

export const dynamic = "force-dynamic";

export default async function AlugarLocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ location: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const { location } = await params;
  const sp = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 lg:px-6 lg:py-4">
      <SearchPage
        locationSlugs={location}
        listingType="rent"
        listingSlug="arrendar"
        locale={locale}
        searchParams={sp}
      />
    </div>
  );
}
