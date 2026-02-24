"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Property } from "@/lib/types";
import { formatPrice, formatArea, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";

interface PropertyCardProps {
  property: Property;
  selected: boolean;
  locale: string;
}

export function PropertyCard({ property, selected, locale }: PropertyCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dict = useDictionary();
  const propertyTypesDict = dict.propertyTypes as Record<string, string>;

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", property.id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left border px-3 py-2 hover:bg-gray-50 transition-colors",
        selected
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200",
      )}
    >
      <div className="flex gap-3">
        {property.images?.[0]?.url ? (
          <img
            src={property.images[0].url}
            alt={property.images[0].alt || property.title}
            className="w-20 h-20 object-cover shrink-0 bg-gray-100"
          />
        ) : (
          <div className="w-20 h-20 shrink-0 bg-gray-100" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold">
            {property.price > 0 ? formatPrice(property.price, locale) : "-"}
          </div>
          <div className="text-[11px] text-gray-400 truncate">
            {property.address.city}
            {property.address.region ? `, ${property.address.region}` : ""}
          </div>
          <div className="text-[13px] font-medium truncate">{property.title}</div>
          <div className="flex gap-3 mt-1 text-[11px] text-gray-400">
            <span>{propertyTypesDict[property.propertyType] || property.propertyType}</span>
            {property.features.bedrooms > 0 && (
              <span>T{property.features.bedrooms}</span>
            )}
            {property.features.areaSqm > 0 && (
              <span>{formatArea(property.features.areaSqm)}</span>
            )}
          </div>
          <div className="flex justify-between mt-1.5 text-[11px] text-gray-400">
            <span>{property.sources?.[0]?.name || ""}</span>
            <span>{formatDate(property.updatedAt, locale)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
