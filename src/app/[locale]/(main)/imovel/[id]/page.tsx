import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import {
  fetchListedPropertyById,
  mapListedToProperty,
  mapListedToSearchResult,
} from "@/lib/estate-os";
import { PropertyDetailClient } from "./property-detail-client";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);

  const listed = await fetchListedPropertyById(id);
  if (!listed) notFound();

  const property = mapListedToProperty(listed);
  const searchResult = mapListedToSearchResult(listed);

  return (
    <PropertyDetailClient
      locale={locale}
      propertyId={id}
      dict={dict}
      property={property}
      searchResult={searchResult}
      pois={listed.pois ?? listed.matched_pois ?? []}
    />
  );
}
