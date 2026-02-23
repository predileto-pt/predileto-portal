"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
    street: string;
    city: string;
    region: string;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
  };
  fullDescription: string;
  sources: { name: string; url: string }[];
}

interface DetailResponse {
  property: PropertyData;
  nearby: NearbyPlacesResult;
}

export function PropertyDetailPanel({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const dict = useDictionary();
  const selectedId = searchParams.get("selected");
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const d = dict.propertyDetail as Record<string, string>;
  const propertyTypesDict = dict.propertyTypes as Record<string, string>;

  useEffect(() => {
    if (!selectedId) {
      setData(null);
      return;
    }

    setLoading(true);
    fetch(`/api/property/${selectedId}/nearby`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  if (!data) return null;

  const { property, nearby } = data;
  const sourceUrl = property.sources?.[0]?.url;
  const sourceName = property.sources?.[0]?.name || "";

  return (
    <div className="sticky top-4 border border-gray-200 p-4 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div>
        <h2 className="text-xs font-bold">{property.title}</h2>
        <p className="text-[10px] text-gray-400">
          {property.address.city}
          {property.address.region ? `, ${property.address.region}` : ""}
        </p>
      </div>

      <div className="text-sm font-bold">
        {property.price > 0 ? formatPrice(property.price, locale) : "-"}
      </div>

      <div className="space-y-1 text-[11px]">
        <h3 className="text-[10px] text-gray-400 uppercase">{d.details}</h3>
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
          <h3 className="text-[10px] text-gray-400 uppercase mb-1">{d.description}</h3>
          <p className="text-[11px] text-gray-600 whitespace-pre-line leading-relaxed">
            {property.fullDescription}
          </p>
        </div>
      )}

      {sourceUrl && (
        <div>
          <h3 className="text-[10px] text-gray-400 uppercase mb-1">{d.source}</h3>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] underline underline-offset-2 hover:text-gray-600"
          >
            {sourceName}
          </a>
        </div>
      )}

      <NearbyAmenities counts={nearby.counts} dict={dict} />
      <NearestPlaces nearest={nearby.nearest} dict={dict} />
    </div>
  );
}
