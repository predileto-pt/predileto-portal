import { AISearchPage } from "@/components/ai-search-page";

export const dynamic = "force-dynamic";

export default async function ArrendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AISearchPage listingType="rent" locale={locale} />;
}
