import { SearchPage } from "@/components/search-page";

export default async function AlugarLocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; location: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, location } = await params;
  const sp = await searchParams;

  return (
    <SearchPage
      locationSlugs={location}
      listingType="rent"
      listingSlug="arrendar"
      locale={locale}
      searchParams={sp}
    />
  );
}
