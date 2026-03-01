"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Property } from "@/lib/types";
import { formatPrice, formatArea, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";
import { PropertyDetailPanel } from "@/components/property-detail-panel";

interface PropertyCardProps {
  property: Property;
  selected: boolean;
  locale: string;
}

export function PropertyCard({
  property,
  selected,
  locale,
}: PropertyCardProps) {
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
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "w-full text-left border  hover:bg-gray-50 transition-colors",
          selected ? "border-gray-900 bg-gray-50" : "border-gray-200",
        )}
      >
        <div className="flex gap-3">
          <div className="w-1/3 shrink-0 bg-gray-100 overflow-hidden">
            {property.images?.[0]?.url ? (
              <img
                src={property.images[0].url}
                alt={property.images[0].alt || property.title}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 px-3 py-2">
            <div className="text-[13px] truncate">{property.title}</div>

            <div className="text-md font-extrabold">
              {property.price > 0 ? formatPrice(property.price, locale) : "-"}
            </div>
            <div className="text-[11px] text-gray-400 truncate">
              {property.address.municipality}
              {property.address.district
                ? `, ${property.address.district}`
                : ""}
            </div>
            <div className="flex gap-3 mt-1 text-[11px] text-gray-400">
              <span>
                {propertyTypesDict[property.propertyType] ||
                  property.propertyType}
              </span>
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
      {selected && (
        <div className="lg:hidden mt-2">
          <PropertyDetailPanel locale={locale} />
        </div>
      )}
    </div>
  );
}
