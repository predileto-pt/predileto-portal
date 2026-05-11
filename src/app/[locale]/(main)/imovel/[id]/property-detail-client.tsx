"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { DictionaryProvider } from "@/components/dictionary-provider";
import { formatPrice, formatArea } from "@/lib/utils";
import { isEasyBook } from "@/lib/types";

import { PropertyTracker } from "@/components/deal/property-tracker";
import { SectionTracker } from "@/components/deal/section-tracker";
import { ScheduleVisitCTA } from "@/components/deal/schedule-visit-cta";
import { RequestInfoCTA } from "@/components/deal/request-info-cta";
import { FinancingSimulationCTA } from "@/components/deal/financing-simulation-cta";
import { ImageCarousel } from "@/components/deal/image-carousel";
import { NearbyAmenities } from "@/components/nearby-amenities";
import { NearestPlaces } from "@/components/nearest-places";
import { PropertyChatbot } from "@/components/deal/property-chatbot";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { MOCK_PROPERTY, MOCK_PROPERTY_MEDIA } from "@/lib/mock-deal-data";
import type { PropertyAmenityResponse } from "@/lib/types/amenities";

interface Props {
  locale: string;
  propertyId: string;
  dict: Dictionary;
}

export function PropertyDetailClient({ locale, propertyId, dict }: Props) {
  const property = MOCK_PROPERTY;
  const [amenities, setAmenities] = useState<PropertyAmenityResponse[]>([]);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/property/${propertyId}/nearby`)
      .then((res) => res.json())
      .then((data) => setAmenities(data.amenities ?? []))
      .catch(() => setAmenities([]));
  }, [propertyId]);

  const d = dict.propertyDetail as Record<string, string>;
  const propertyTypesDict = dict.propertyTypes as Record<string, string>;
  const sourceUrl = property.sources?.[0]?.url;
  const sourceName = property.sources?.[0]?.name || "";
  const coords = property.address.coordinates;

  return (
    <DictionaryProvider dictionary={dict}>
      <div className="max-w-7xl mx-auto px-4 py-3 lg:px-6 lg:py-4">
      <PropertyTracker propertyId={propertyId} />

      {/* Back link */}
      <div className="mb-4">
        <Link
          href={`/${locale}/comprar`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {d.backToListings}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ===== MAIN CONTENT (left) ===== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Image Carousel */}
          <ImageCarousel media={MOCK_PROPERTY_MEDIA} />

          {/* Header */}
          <SectionTracker propertyId={propertyId} section="header">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold">{property.title}</h1>
                  <p className="text-sm text-gray-400">
                    {property.address.fullAddress}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold">
                    {property.price > 0 ? formatPrice(property.price, locale) : "-"}
                  </p>
                  {property.listingType === "rent" && (
                    <span className="text-xs text-gray-400">{d.perMonth}</span>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {isEasyBook(property) && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5">
                    <svg className="size-3" viewBox="0 0 24 24" fill="currentColor">
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

          {/* Property Details Grid */}
          <SectionTracker propertyId={propertyId} section="details">
            <div className="border border-gray-200 bg-white p-4">
              <h3 className="text-xs text-gray-400 uppercase mb-3">{d.details}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <DetailCard label={d.propertyType} value={propertyTypesDict[property.propertyType] || property.propertyType} />
                {property.features.bedrooms > 0 && (
                  <DetailCard label={d.bedrooms} value={`T${property.features.bedrooms}`} />
                )}
                {property.features.bathrooms > 0 && (
                  <DetailCard label={d.bathrooms} value={String(property.features.bathrooms)} />
                )}
                {property.features.areaSqm > 0 && (
                  <DetailCard label={d.area} value={formatArea(property.features.areaSqm)} />
                )}
                {property.features.floor !== undefined && (
                  <DetailCard label={d.floor} value={`${property.features.floor}/${property.features.totalFloors || "?"}`} />
                )}
                {property.features.parkingSpaces !== undefined && property.features.parkingSpaces > 0 && (
                  <DetailCard label={d.parking} value={`${property.features.parkingSpaces} ${d.parkingSpaces}`} />
                )}
                {property.features.yearBuilt && (
                  <DetailCard label={d.yearBuilt} value={String(property.features.yearBuilt)} />
                )}
              </div>
            </div>
          </SectionTracker>

          {/* Description */}
          {property.fullDescription && (
            <SectionTracker propertyId={propertyId} section="description">
              <div>
                <h3 className="text-xs text-gray-400 uppercase mb-2">{d.description}</h3>
                <Text className={`whitespace-pre-line ${descExpanded ? "" : "line-clamp-4"}`}>
                  {property.fullDescription}
                </Text>
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="text-xs text-blue-500 hover:text-blue-600 mt-1"
                >
                  {descExpanded ? d.showLess : d.showMore}
                </button>
              </div>
            </SectionTracker>
          )}

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <SectionTracker propertyId={propertyId} section="amenities">
              <div>
                <h3 className="text-xs text-gray-400 uppercase mb-2">{d.amenities}</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 border border-gray-200">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </SectionTracker>
          )}

          {/* Map */}
          {coords && (
            <SectionTracker propertyId={propertyId} section="map">
              <div className="border border-gray-200 bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-xs text-gray-400 uppercase">{d.location}</h3>
                </div>
                <iframe
                  title={property.address.fullAddress}
                  width="100%"
                  height="300"
                  className="border-0"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.005}%2C${coords.lat - 0.005}%2C${coords.lng + 0.005}%2C${coords.lat + 0.005}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
                />
              </div>
            </SectionTracker>
          )}

          {/* Structured CTAs */}
          <SectionTracker propertyId={propertyId} section="ctas">
            <div className="border border-gray-200 bg-white p-4">
              <h3 className="text-xs text-gray-400 uppercase mb-3">{d.actions}</h3>
              <div className="space-y-3">
                <ScheduleVisitCTA propertyId={propertyId} dict={d} />
                <RequestInfoCTA propertyId={propertyId} dict={d} />
                <FinancingSimulationCTA
                  propertyId={propertyId}
                  propertyPrice={property.price}
                  locale={locale}
                  dict={d}
                />
              </div>
            </div>
          </SectionTracker>

          {/* Source */}
          {sourceUrl && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-xs text-gray-400 uppercase mb-1">{d.source}</h3>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-500 underline underline-offset-2 hover:text-blue-600"
              >
                {sourceName}
                <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
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

        {/* ===== SIDEBAR (right) ===== */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-4 space-y-4">
            {/* Property summary card */}
            <div className="border border-gray-200 bg-white p-4 space-y-3">
              <h2 className="text-sm font-bold">{property.title}</h2>
              <p className="text-xs text-gray-400">
                {property.address.municipality}
                {property.address.district ? `, ${property.address.district}` : ""}
              </p>
              <div className="text-sm font-bold">
                {property.price > 0 ? formatPrice(property.price, locale) : "-"}
              </div>

              {/* Quick details */}
              <div className="space-y-1 text-sm">
                <h3 className="text-xs text-gray-400 uppercase">{d.details}</h3>
                <div className="flex justify-between">
                  <span className="text-gray-400">{d.propertyType}</span>
                  <span>{propertyTypesDict[property.propertyType] || property.propertyType}</span>
                </div>
                {property.features.bedrooms > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">{d.bedrooms}</span>
                    <span>T{property.features.bedrooms}</span>
                  </div>
                )}
                {property.features.bathrooms > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">{d.bathrooms}</span>
                    <span>{property.features.bathrooms}</span>
                  </div>
                )}
                {property.features.areaSqm > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">{d.area}</span>
                    <span>{formatArea(property.features.areaSqm)}</span>
                  </div>
                )}
              </div>

              {/* CTA buttons */}
              <div className="space-y-2">
                {sourceUrl && (
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="primary" className="w-full">{d.viewProperty}</Button>
                  </a>
                )}
                {isEasyBook(property) && (
                  <Link href={`/${locale}/agendar/${property.id}`} className="block">
                    <Button variant="default" className="w-full">{d.scheduleVisit}</Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Nearby Amenities */}
            <div className="border border-gray-200 bg-white p-4">
              <NearbyAmenities amenities={amenities} dict={dict} />
            </div>

            {/* Nearest Places */}
            <div className="border border-gray-200 bg-white p-4">
              <NearestPlaces amenities={amenities} dict={dict} />
            </div>

            {/* Chatbot */}
            <PropertyChatbot propertyId={propertyId} dict={d} />
          </div>
        </div>
      </div>
      </div>
    </DictionaryProvider>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}
