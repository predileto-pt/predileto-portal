import { SearchPage } from "@/components/search-page";

export default async function ComprarLocationPage({
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
      listingType="buy"
      listingSlug="comprar"
      locale={locale}
      searchParams={sp}
    />
  );
}
