import { SearchPage } from "@/components/search-page";

export default async function ComprarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  return (
    <SearchPage
      locationSlugs={[]}
      listingType="buy"
      listingSlug="comprar"
      locale={locale}
      searchParams={sp}
    />
  );
}
