"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { useDictionary } from "@/components/dictionary-provider";
import { formatPrice, formatArea } from "@/lib/utils";
import { NearbyAmenities } from "@/components/nearby-amenities";
import { NearestPlaces } from "@/components/nearest-places";
import type { NearbyPlacesResult } from "@/lib/geoapify";

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
  nearby: NearbyPlacesResult;
  nearbyError?: string | false;
}

const nearbyCache = new Map<string, NearbyData>();

export function PropertyDetailPanel({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const dict = useDictionary();
  const selectedId = searchParams.get("selected");
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
        posthog.captureException(err instanceof Error ? err : new Error("Unknown error"), {
          property_id: selectedId,
        });
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
          const data: NearbyData = { nearby: json.nearby, nearbyError: json.nearbyError };
          nearbyCache.set(selectedId, data);
          setNearby(data);
          if (json.nearbyError) {
            posthog.captureException(new Error(json.nearbyError), {
              property_id: selectedId,
              address: json.property?.address,
            });
          }
        })
        .catch((err) => {
          setNearby({ nearby: { counts: {}, nearest: {} }, nearbyError: "Failed to load" });
          posthog.captureException(err instanceof Error ? err : new Error("Unknown error"), {
            property_id: selectedId,
            context: "nearby",
          });
        });
    }
  }, [selectedId]);

  if (!selectedId) {
    return null;
  }

  if (loading) {
    return (
      <div className="sticky top-4 border border-gray-200 p-4 space-y-4 animate-pulse">
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
  }

  if (error) {
    return (
      <div className="sticky top-4 border border-gray-200 p-4">
        <p className="text-[12px] text-gray-400">{d.loadError}</p>
      </div>
    );
  }

  if (!property) return null;

  const sourceUrl = property.sources?.[0]?.url;
  const sourceName = property.sources?.[0]?.name || "";

  return (
    <div className="sticky top-4 border border-gray-200 p-4 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div>
        <h2 className="text-[13px] font-bold">{property.title}</h2>
        <p className="text-[11px] text-gray-400">
          {property.address.municipality}
          {property.address.district ? `, ${property.address.district}` : ""}
        </p>
      </div>

      <div className="text-sm font-bold">
        {property.price > 0 ? formatPrice(property.price, locale) : "-"}
      </div>

      <div className="space-y-1 text-[12px]">
        <h3 className="text-[11px] text-gray-400 uppercase">{d.details}</h3>
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

      {property.fullDescription && (
        <div>
          <h3 className="text-[11px] text-gray-400 uppercase mb-1">{d.description}</h3>
          <p className={`text-[12px] text-gray-600 whitespace-pre-line leading-relaxed ${descExpanded ? "" : "line-clamp-4"}`}>
            {property.fullDescription}
          </p>
          <button
            type="button"
            onClick={() => setDescExpanded((v) => !v)}
            className="text-[11px] text-blue-400 hover:text-blue-500 mt-1"
          >
            {descExpanded ? d.showLess || "Show less" : d.showMore || "Show more"}
          </button>
        </div>
      )}

      {sourceUrl && (
        <div>
          <h3 className="text-[11px] text-gray-400 uppercase mb-1">{d.source}</h3>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] underline underline-offset-2 hover:text-gray-600"
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
      ) : nearby.nearbyError ? (
        <p className="text-[12px] text-gray-400">{d.nearbyError}</p>
      ) : (
        <>
          <NearbyAmenities counts={nearby.nearby.counts} dict={dict} />
          <NearestPlaces nearest={nearby.nearby.nearest} dict={dict} />
        </>
      )}
    </div>
  );
}
