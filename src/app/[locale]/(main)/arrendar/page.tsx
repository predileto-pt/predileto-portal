import { SearchPage } from "@/components/search-page";

export const dynamic = "force-dynamic";

export default async function ArrendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 lg:px-6 lg:py-4">
      <SearchPage
        locationSlugs={[]}
        listingType="rent"
        listingSlug="arrendar"
        locale={locale}
        searchParams={sp}
      />
    </div>
  );
}
