import { Suspense } from "react";
import { getProperties } from "@/lib/api";
import type { PropertySearchParams } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import { SearchFilters } from "@/components/search-filters";
import { PropertyList } from "@/components/property-list";
import { Pagination } from "@/components/pagination";
import { PropertyDetailPanel } from "@/components/property-detail-panel";

export default async function AlugarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const dict = await getDictionary(locale as Locale);

  const search: PropertySearchParams = {
    q: typeof sp.q === "string" ? sp.q : undefined,
    propertyType: typeof sp.propertyType === "string" ? sp.propertyType : undefined,
    listingType: "rent",
    minPrice: typeof sp.minPrice === "string" ? sp.minPrice : undefined,
    maxPrice: typeof sp.maxPrice === "string" ? sp.maxPrice : undefined,
    bedrooms: typeof sp.bedrooms === "string" ? sp.bedrooms : undefined,
    region: typeof sp.region === "string" ? sp.region : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
    page: typeof sp.page === "string" ? sp.page : undefined,
  };

  const result = await getProperties(search);

  const rawParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") rawParams[key] = value;
  }

  const selectedId = typeof sp.selected === "string" ? sp.selected : undefined;

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-2">
        <Suspense>
          <SearchFilters />
        </Suspense>
      </div>
      <div className="col-span-6">
        <h1 className="text-sm font-bold mb-4">
          {dict.nav.rent}{" "}
          <span className="text-gray-400 font-normal">
            ({dict.properties.found.replace("{count}", String(result.total))})
          </span>
        </h1>
        <PropertyList
          properties={result.data}
          total={result.total}
          page={result.page}
          pageSize={result.pageSize}
          locale={locale}
          selectedId={selectedId}
        />
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          searchParams={rawParams}
          basePath={`/${locale}/alugar`}
          locale={locale}
        />
      </div>
      <div className="col-span-4">
        <Suspense>
          <PropertyDetailPanel locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
