import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";
import {
  fetchListedPropertyById,
  mapListedToProperty,
  mapListedToSearchResult,
} from "@/lib/estate-os";
import { PropertyDetailClient } from "./property-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const locale = await getServerLocale();
  const { id } = await params;
  const dict = await getDictionary(locale);

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
      agency={listed.agency ?? null}
    />
  );
}
