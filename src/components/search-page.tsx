import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProperties, getLatestProperties } from "@/lib/api";
import type { PropertySearchParams } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import {
  resolveLocationFromSlugs,
  buildBreadcrumbs,
  type ResolvedLocation,
} from "@/lib/locations";
import { SearchFilters } from "@/components/search-filters";
import { SearchBar } from "@/components/search-bar";
import { PropertyList } from "@/components/property-list";
import { PropertyListSkeleton } from "@/components/property-list-skeleton";
import { Pagination } from "@/components/pagination";
import { PropertyDetailPanel } from "@/components/property-detail-panel";
import { LocationBreadcrumbs } from "@/components/location-breadcrumbs";
// import { FeaturedCarousel } from "@/components/featured-carousel";


const FILTER_KEYS = [
  "q",
  "propertyType",
  "minPrice",
  "maxPrice",
  "bedrooms",
];

function hasActiveFilters(sp: Record<string, string | string[] | undefined>) {
  return FILTER_KEYS.some(
    (key) => typeof sp[key] === "string" && sp[key] !== "",
  );
}

interface SearchPageProps {
  locationSlugs: string[];
  listingType: "buy" | "rent";
  listingSlug: "comprar" | "arrendar";
  locale: string;
  searchParams: Record<string, string | string[] | undefined>;
}

export async function SearchPage({
  locationSlugs,
  listingType,
  listingSlug,
  locale,
  searchParams: sp,
}: SearchPageProps) {
  const resolved = resolveLocationFromSlugs(locationSlugs);
  if (!resolved.valid) notFound();

  const dict = await getDictionary(locale as Locale);
  const hasLocation = locationSlugs.length > 0;
  const hasFilters = hasActiveFilters(sp) || hasLocation;
  const latestProperties = !hasFilters
    ? await getLatestProperties(listingType, 10)
    : [];

  const rawParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") rawParams[key] = value;
  }

  const selectedId =
    typeof sp.selected === "string" ? sp.selected : undefined;

  const breadcrumbs = buildBreadcrumbs(resolved, locale, listingSlug);
  const basePath =
    `/${locale}/${listingSlug}` +
    (locationSlugs.length > 0 ? `/${locationSlugs.join("/")}` : "");

  const title = getTitle(resolved, dict, listingType);
  const listingLabel = listingType === "buy" ? dict.nav.buy : dict.nav.rent;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <details>
          <summary className="text-sm font-medium cursor-pointer border border-gray-200 bg-white px-3 py-2 rounded select-none">
            Filtros
          </summary>
          <div className="mt-2">
            <Suspense>
              <SearchFilters />
            </Suspense>
          </div>
        </details>
      </div>

      {/* Desktop filters sidebar */}
      <div className="hidden lg:block lg:col-span-2">
        <div className="border border-gray-200 bg-white p-3">
          <Suspense>
            <SearchFilters />
          </Suspense>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:col-span-6">
        <div className="mb-4">
          <Suspense>
            <SearchBar
              locale={locale}
              listingSlug={listingSlug}
              locationSlugs={locationSlugs}
              resolved={resolved}
            />
          </Suspense>
        </div>

        {/* <FeaturedCarousel
            properties={latestProperties}
            locale={locale}
            heading={(dict as Record<string, Record<string, string>>).carousel?.heading ?? "Latest Properties"}
          /> */}

        <LocationBreadcrumbs
          items={breadcrumbs}
          homeLabel={(dict as Record<string, Record<string, string>>).breadcrumbs?.home ?? "Home"}
          homeHref={`/${locale}`}
          listingLabel={listingLabel}
          listingHref={`/${locale}/${listingSlug}`}
        />
        <h1 className="text-sm font-bold mb-4">{title}</h1>
        {hasFilters ? (
          <Suspense fallback={<PropertyListSkeleton />}>
            <ResultsSection
              locale={locale}
              sp={sp}
              rawParams={rawParams}
              selectedId={selectedId}
              dict={dict}
              resolved={resolved}
              listingType={listingType}
              basePath={basePath}
            />
          </Suspense>
        ) : latestProperties.length > 0 ? (
          <PropertyList
            properties={latestProperties}
            total={latestProperties.length}
            page={1}
            pageSize={10}
            locale={locale}
          />
        ) : null}
      </div>

      {/* Right sidebar */}
      <div className="lg:col-span-4">
        <div className="hidden lg:block lg:sticky lg:top-4">
          <Suspense>
            <PropertyDetailPanel locale={locale} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function getTitle(
  resolved: ResolvedLocation,
  dict: Awaited<ReturnType<typeof getDictionary>>,
  listingType: "buy" | "rent",
): string {
  const base = listingType === "buy" ? dict.nav.buy : dict.nav.rent;
  const locationName =
    resolved.parish?.name ??
    resolved.municipality?.name ??
    resolved.district?.name ??
    resolved.region?.name;
  if (locationName) return `${base} - ${locationName}`;
  return base;
}

async function ResultsSection({
  locale,
  sp,
  rawParams,
  selectedId,
  dict,
  resolved,
  listingType,
  basePath,
}: {
  locale: string;
  sp: Record<string, string | string[] | undefined>;
  rawParams: Record<string, string | undefined>;
  selectedId?: string;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  resolved: ResolvedLocation;
  listingType: "buy" | "rent";
  basePath: string;
}) {
  const search: PropertySearchParams = {
    q: typeof sp.q === "string" ? sp.q : undefined,
    propertyType:
      typeof sp.propertyType === "string" ? sp.propertyType : undefined,
    listingType,
    minPrice: typeof sp.minPrice === "string" ? sp.minPrice : undefined,
    maxPrice: typeof sp.maxPrice === "string" ? sp.maxPrice : undefined,
    bedrooms: typeof sp.bedrooms === "string" ? sp.bedrooms : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
    page: typeof sp.page === "string" ? sp.page : undefined,
    // Hierarchical location from URL path
    region: resolved.region?.slug,
    district: resolved.district?.slug,
    municipality: resolved.municipality?.slug,
    parish: resolved.parish?.slug,
  };

  const result = await getProperties(search);

  return (
    <>
      <div className="text-xs text-gray-400 mb-2">
        {dict.properties.found.replace("{count}", String(result.total))}
      </div>
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
        basePath={basePath}
        locale={locale}
      />
    </>
  );
}
