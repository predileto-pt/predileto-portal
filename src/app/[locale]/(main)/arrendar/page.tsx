import { SearchPage } from "@/components/search-page";

export const dynamic = "force-dynamic";

export default async function AlugarPage({
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
      listingType="rent"
      listingSlug="arrendar"
      locale={locale}
      searchParams={sp}
    />
  );
}
