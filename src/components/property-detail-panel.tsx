"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import posthog from "posthog-js";
import { useDictionary } from "@/components/dictionary-provider";
import { formatPrice, formatArea } from "@/lib/utils";
import { NearbyAmenities } from "@/components/nearby-amenities";
import { NearestPlaces } from "@/components/nearest-places";
import type { PropertyAmenityResponse } from "@/lib/types/amenities";
import { Text } from "@/components/ui/text";
import { Small } from "@/components/ui/small";
import { Button } from "@/components/ui/button";
import { isEasyBook } from "@/lib/types";

interface PropertyData {
  id: string;
  title: string;
  price: number;
  propertyType: string;
  address: {
    fullAddress: string;
    municipality: string;
    district: string;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
  };
  fullDescription: string;
  sources: { name: string; url: string }[];
}

interface NearbyData {
  amenities: PropertyAmenityResponse[];
  error?: string | false;
}

const nearbyCache = new Map<string, NearbyData>();

export function PropertyDetailPanel({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const dict = useDictionary();
  const selectedId = searchParams.get("selected");

  const dismiss = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selected");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }, [searchParams, router, pathname]);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [nearby, setNearby] = useState<NearbyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const d = dict.propertyDetail as Record<string, string>;
  const propertyTypesDict = dict.propertyTypes as Record<string, string>;

  useEffect(() => {
    if (!selectedId) {
      setProperty(null);
      setNearby(null);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);
    setProperty(null);
    setNearby(null);
    setDescExpanded(false);

    // Property fetch — resolves quickly, unblocks rendering
    fetch(`/api/property/${selectedId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        setProperty(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(true);
        setLoading(false);
        posthog.captureException(
          err instanceof Error ? err : new Error("Unknown error"),
          {
            property_id: selectedId,
          },
        );
      });

    // Nearby fetch — slower, renders independently when ready (cached client-side)
    const cached = nearbyCache.get(selectedId);
    if (cached) {
      setNearby(cached);
    } else {
      fetch(`/api/property/${selectedId}/nearby`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch nearby");
          return res.json();
        })
        .then((json) => {
          const data: NearbyData = {
            amenities: json.amenities ?? [],
            error: json.error,
          };
          nearbyCache.set(selectedId, data);
          setNearby(data);
          if (json.error) {
            posthog.captureException(new Error(json.error), {
              property_id: selectedId,
            });
          }
        })
        .catch((err) => {
          setNearby({
            amenities: [],
            error: "Failed to load",
          });
          posthog.captureException(
            err instanceof Error ? err : new Error("Unknown error"),
            {
              property_id: selectedId,
              context: "nearby",
            },
          );
        });
    }
  }, [selectedId]);

  const sourceUrl = property?.sources?.[0]?.url;
  const sourceName = property?.sources?.[0]?.name || "";

  let content: React.ReactNode = null;

  if (selectedId && loading) {
    content = (
      <div className="border border-gray-200 bg-white p-4 space-y-4 animate-pulse">
        <div>
          <div className="h-3 w-3/4 bg-gray-200 rounded" />
          <div className="h-2 w-1/2 bg-gray-100 rounded mt-2" />
        </div>
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
        <div className="space-y-2">
          <div className="h-2 w-1/4 bg-gray-100 rounded" />
          <div className="h-2 w-full bg-gray-100 rounded" />
          <div className="h-2 w-full bg-gray-100 rounded" />
          <div className="h-2 w-full bg-gray-100 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-1/4 bg-gray-100 rounded" />
          <div className="h-2 w-full bg-gray-100 rounded" />
          <div className="h-2 w-full bg-gray-100 rounded" />
          <div className="h-2 w-5/6 bg-gray-100 rounded" />
          <div className="h-2 w-4/6 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      </div>
    );
  } else if (selectedId && error) {
    content = (
      <div className="border border-gray-200 bg-white p-4">
        <Text variant="muted">{d.loadError}</Text>
      </div>
    );
  } else if (selectedId && property) {
    content = (
      <div className="border border-gray-200 bg-white p-4 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            &#x2715; close
          </button>
        </div>
        <div>
          <h2 className="text-sm font-bold">{property.title}</h2>
          <Small>
            {property.address.municipality}
            {property.address.district ? `, ${property.address.district}` : ""}
          </Small>
        </div>

        {isEasyBook(property) && (
          <div>
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
          </div>
        )}

        <div className="mb-2">
          <div className="text-sm font-bold">
            {property.price > 0 ? formatPrice(property.price, locale) : "-"}
          </div>

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-sm text-blue-500 underline underline-offset-2 hover:text-blue-600"
            >
              {d.seePhotos}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="size-3"
              >
                <path
                  fillRule="evenodd"
                  d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          )}
          {isEasyBook(property) && (
            <Link
              href={`/${locale}/agendar/${property.id}`}
              className="inline-flex items-center gap-1 text-sm text-blue-500 underline underline-offset-2 hover:text-blue-600"
            >
              {d.scheduleVisit}
            </Link>
          )}
        </div>

        <div className="space-y-1 text-sm">
          <h3 className="text-xs text-gray-400 uppercase">{d.details}</h3>
          <div className="flex justify-between">
            <span className="text-gray-400">{d.propertyType}</span>
            <span>
              {propertyTypesDict[property.propertyType] ||
                property.propertyType}
            </span>
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
          {sourceUrl && (
            <div className="flex justify-end">
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary">
                  {d.viewProperty}
                </Button>
              </a>
            </div>
          )}
        </div>

        {property.fullDescription && (
          <div>
            <h3 className="text-xs text-gray-400 uppercase mb-1">
              {d.description}
            </h3>
            <Text
              className={`whitespace-pre-line ${descExpanded ? "" : "line-clamp-4"}`}
            >
              {property.fullDescription}
            </Text>
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="text-xs text-blue-500 hover:text-blue-600 mt-1"
            >
              {descExpanded
                ? d.showLess || "Show less"
                : d.showMore || "Show more"}
            </button>
          </div>
        )}

        {sourceUrl && (
          <div>
            <h3 className="text-xs text-gray-400 uppercase mb-1">{d.source}</h3>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 underline underline-offset-2 hover:text-blue-600"
            >
              {sourceName}
            </a>
          </div>
        )}

        {nearby === null ? (
          <div className="space-y-2 animate-pulse">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-100 rounded" />
            </div>
          </div>
        ) : nearby.error ? (
          <Text variant="muted">{d.nearbyError}</Text>
        ) : (
          <>
            <NearbyAmenities amenities={nearby.amenities} dict={dict} />
            <NearestPlaces amenities={nearby.amenities} dict={dict} />
          </>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key={selectedId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.15 }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
