"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { DictionaryProvider } from "@/components/dictionary-provider";
import { formatPrice, formatArea } from "@/lib/utils";
import { isEasyBook, type Property } from "@/lib/types";
import type { ListedAgency, ListedPoi } from "@/lib/estate-os";

import { PropertyTracker } from "@/components/deal/property-tracker";
import { SectionTracker } from "@/components/deal/section-tracker";
import {
  ImageCarousel,
  type DetailMediaItem,
} from "@/components/deal/image-carousel";
import { PropertyChat } from "@/components/property-chat";
import type { SearchResultItem } from "@/components/search-results";
import {
  MediaTypeBadges,
  type MediaCounts,
} from "@/components/media-type-badges";
import { Text } from "@/components/ui/text";

interface Props {
  locale: string;
  propertyId: string;
  dict: Dictionary;
  property: Property;
  searchResult: SearchResultItem;
  pois: ListedPoi[];
  agency: ListedAgency | null;
}

function formatPoiDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

export function PropertyDetailClient({
  locale,
  propertyId,
  dict,
  property,
  searchResult,
  pois,
  agency,
}: Props) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);

  const media = useMemo<DetailMediaItem[]>(
    () =>
      property.images.map((img) => ({
        type: "image",
        url: img.url,
        alt: img.alt,
      })),
    [property.images]
  );

  const mediaCounts = useMemo<MediaCounts>(() => {
    const c: MediaCounts = { image: 0, video: 0, panorama: 0, ai: 0 };
    for (const m of media) {
      c[m.type] += 1;
      if (m.type === "video" && m.aiGenerated) c.ai += 1;
    }
    return c;
  }, [media]);

  const poisByCategory = useMemo(() => {
    const groups = new Map<string, ListedPoi[]>();
    for (const poi of pois) {
      const list = groups.get(poi.category) ?? [];
      list.push(poi);
      groups.set(poi.category, list);
    }
    for (const list of groups.values()) {
      list.sort((a, b) => a.distance_meters - b.distance_meters);
    }
    const priority = ["hospital", "restaurant"];
    return Array.from(groups.entries()).sort(([a, av], [b, bv]) => {
      const ai = priority.indexOf(a);
      const bi = priority.indexOf(b);
      if (ai !== -1 || bi !== -1) {
        return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
      }
      return av[0].distance_meters - bv[0].distance_meters;
    });
  }, [pois]);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  function toggleCategory(category: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function formatCategory(category: string): string {
    return (
      poiCategoriesDict[category] ??
      category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }

  const backHref =
    property.listingType === "rent"
      ? `/arrendar`
      : `/comprar`;

  const d = dict.propertyDetail as Record<string, string>;
  const propertyTypesDict = dict.propertyTypes as Record<string, string>;
  const poiCategoriesDict = dict.poiCategories as Record<string, string>;
  const sourceUrl = property.sources?.[0]?.url;
  const sourceName = property.sources?.[0]?.name || "";
  const coords = property.address.coordinates;

  return (
    <DictionaryProvider dictionary={dict}>
      <div className="max-w-6xl mx-auto px-4 py-3 lg:px-6 lg:py-4">
        <PropertyTracker propertyId={propertyId} />

        {/* Back link */}
        <div className="mb-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {d.backToListings}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ===== MAIN CONTENT (left) ===== */}
          <div className="lg:col-span-8 space-y-6 shadow-lg">
            <div className="space-y-6 pb-8 bg-white border-x border-b border-gray-200">
              {/* Image Carousel */}
              <ImageCarousel media={media} />

              {/* Header */}
              <SectionTracker
                propertyId={propertyId}
                section="header"
                className="px-4 lg:px-6"
              >
                <div className="space-y-3">
                  <div className="space-y-1">
                    <MediaTypeBadges
                      counts={mediaCounts}
                      ariaLabel="Tipos de média"
                      className="mb-2"
                    />
                    <h1 className="text-3xl font-bold leading-tight">
                      {property.title}
                    </h1>
                    <p className="inline-flex items-center gap-1.5 text-base text-gray-600">
                      <svg
                        className="size-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {property.address.fullAddress}
                    </p>
                    <p className="text-3xl font-bold pt-2">
                      {property.price > 0
                        ? formatPrice(property.price, locale)
                        : "-"}
                      {property.listingType === "rent" && (
                        <span className="text-base text-gray-400 font-normal ml-1">
                          {d.perMonth}
                        </span>
                      )}
                    </p>

                    {agency &&
                      (agency.name || agency.email || agency.phone) && (
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 bg-gray-50 px-3 py-2 text-sm text-blue-600">
                          {agency.name && (
                            <span className="inline-flex items-center gap-1.5">
                              <svg
                                className="size-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden
                              >
                                <path d="M3 21h18" />
                                <path d="M5 21V7l8-4v18" />
                                <path d="M19 21V11l-6-4" />
                                <path d="M9 9v.01" />
                                <path d="M9 12v.01" />
                                <path d="M9 15v.01" />
                                <path d="M9 18v.01" />
                              </svg>
                              {agency.name}
                            </span>
                          )}
                          {agency.phone && (
                            <a
                              href={`tel:${agency.phone}`}
                              className="inline-flex items-center gap-1.5 hover:text-blue-700"
                            >
                              <svg
                                className="size-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden
                              >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.71 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.71A2 2 0 0 1 22 16.92z" />
                              </svg>
                              {agency.phone}
                            </a>
                          )}
                          {agency.email && (
                            <a
                              href={`mailto:${agency.email}`}
                              className="inline-flex items-center gap-1.5 hover:text-blue-700"
                            >
                              <svg
                                className="size-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden
                              >
                                <rect
                                  x="2"
                                  y="4"
                                  width="20"
                                  height="16"
                                  rx="2"
                                />
                                <path d="m22 7-10 6L2 7" />
                              </svg>
                              {agency.email}
                            </a>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {isEasyBook(property) && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5">
                        <svg
                          className="size-3"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Easy Book
                      </span>
                    )}
                    {property.features.energyRating && (
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5">
                        {d.energy}: {property.features.energyRating}
                      </span>
                    )}
                    {property.featured && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5">
                        {d.featured}
                      </span>
                    )}
                  </div>
                </div>
              </SectionTracker>

              {/* Description */}
              {property.fullDescription && (
                <SectionTracker
                  propertyId={propertyId}
                  section="description"
                  className="px-4 lg:px-6"
                >
                  <div>
                    <h3 className="text-xs text-gray-400 uppercase mb-2">
                      {d.description}
                    </h3>
                    <Text
                      className={`text-base whitespace-pre-line ${
                        property.fullDescription.length > 300 && !descExpanded
                          ? "line-clamp-4"
                          : ""
                      }`}
                    >
                      {property.fullDescription}
                    </Text>
                    {property.fullDescription.length > 300 && (
                      <button
                        type="button"
                        onClick={() => setDescExpanded((v) => !v)}
                        className="text-base text-blue-500 hover:text-blue-600 mt-1"
                      >
                        {descExpanded ? d.showLess : d.showMore}
                      </button>
                    )}
                  </div>
                </SectionTracker>
              )}

              {/* Characteristics */}
              <SectionTracker
                propertyId={propertyId}
                section="characteristics"
                className="px-4 lg:px-6"
              >
                <h3 className="text-xs text-gray-400 uppercase mb-2">
                  {d.characteristics}
                </h3>
                <ul className="list-disc list-inside text-base text-gray-600 space-y-1">
                  <li>
                    {d.propertyType}:{" "}
                    {propertyTypesDict[property.propertyType] ||
                      property.propertyType}
                  </li>
                  {property.features.bedrooms > 0 && (
                    <li>
                      {d.bedrooms}: T{property.features.bedrooms}
                    </li>
                  )}
                  {property.features.bathrooms > 0 && (
                    <li>
                      {d.bathrooms}: {property.features.bathrooms}
                    </li>
                  )}
                  {property.features.areaSqm > 0 && (
                    <li>
                      {d.area}: {formatArea(property.features.areaSqm)}
                    </li>
                  )}
                  {property.features.floor !== undefined && (
                    <li>
                      {d.floor}: {property.features.floor}
                      {property.features.totalFloors
                        ? `/${property.features.totalFloors}`
                        : ""}
                    </li>
                  )}
                  {property.features.parkingSpaces !== undefined &&
                    property.features.parkingSpaces > 0 && (
                      <li>
                        {d.parking}: {property.features.parkingSpaces}{" "}
                        {d.parkingSpaces}
                      </li>
                    )}
                  {property.features.yearBuilt && (
                    <li>
                      {d.yearBuilt}: {property.features.yearBuilt}
                    </li>
                  )}
                </ul>
              </SectionTracker>

              {/* Map */}
              {coords && (
                <SectionTracker
                  propertyId={propertyId}
                  section="map"
                  className="px-4 lg:px-6"
                >
                  <div className="border border-gray-200 bg-white overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-xs text-gray-400 uppercase">
                        {d.location}
                      </h3>
                    </div>
                    <iframe
                      title={property.address.fullAddress}
                      width="100%"
                      height="300"
                      className="border-0"
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        coords.lng - 0.005
                      }%2C${coords.lat - 0.005}%2C${coords.lng + 0.005}%2C${
                        coords.lat + 0.005
                      }&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
                    />
                  </div>
                </SectionTracker>
              )}

              {/* Source */}
              {sourceUrl && (
                <div className="px-4 lg:px-6 pb-4 border-t border-gray-100 pt-4">
                  <h3 className="text-xs text-gray-400 uppercase mb-1">
                    {d.source}
                  </h3>
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-500 underline underline-offset-2 hover:text-blue-600"
                  >
                    {sourceName}
                    <svg
                      className="size-3"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>

            {/* POIs */}
            <SectionTracker
              propertyId={propertyId}
              section="pois"
              className="bg-white border border-gray-200 p-4 lg:p-6 space-y-6"
            >
              <h3 className="text-xs text-gray-400 uppercase">
                {d.pointsOfInterest}
              </h3>
              {poisByCategory.length === 0 ? (
                <p className="text-sm text-gray-400">{d.nearbyError}</p>
              ) : (
                poisByCategory.map(([category, items]) => {
                  const expanded = expandedCategories.has(category);
                  const visible = expanded ? items : items.slice(0, 3);
                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="text-lg font-medium text-gray-600">
                        {formatCategory(category)}{" "}
                        <span className="text-xs text-gray-400">
                          ({items.length})
                        </span>
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {visible.map((poi, i) => (
                          <li
                            key={`${poi.category}-${poi.name}-${i}`}
                            className="flex gap-3 border border-gray-200 bg-white p-2"
                          >
                            {poi.image_urls?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={poi.image_urls[0]}
                                alt={poi.name}
                                className="w-14 h-14 object-cover shrink-0 bg-gray-100"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gray-100 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <p className="text-sm font-medium truncate">
                                {poi.name}
                              </p>
                              {poi.address && (
                                <p className="text-xs text-gray-400 truncate">
                                  {poi.address}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {formatPoiDistance(poi.distance_meters)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {items.length > 3 && (
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="text-sm text-blue-500 hover:text-blue-600"
                        >
                          {expanded ? d.showLess : d.showMore}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </SectionTracker>
          </div>

          {/* ===== SIDEBAR (right) ===== */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-4">
              {/* Agent chat (same as listing page) */}
              <PropertyChat
                property={searchResult}
                locale={locale}
                open={chatOpen}
                onClose={() => setChatOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </DictionaryProvider>
  );
}
