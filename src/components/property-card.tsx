"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { type Property, isEasyBook } from "@/lib/types";
import { formatPrice, formatArea, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";
import { PropertyDetailPanel } from "@/components/property-detail-panel";
import { Badge } from "@/components/ui/badge";

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
          "w-full text-left border bg-white hover:bg-gray-50 transition-colors cursor-pointer",
          selected ? "border-gray-900 bg-gray-50" : "border-gray-200",
        )}
      >
        <div className="flex gap-3">
          <div className="w-1/3 shrink-0 bg-gray-100 overflow-hidden h-36">
            {property.images?.[0]?.url ? (
              <img
                src={property.images[0].url}
                alt={property.images[0].alt || property.title}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 px-3 py-2">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-blue-600 truncate font-heading flex-1">
                {property.title}
              </div>
              {isEasyBook(property) && (
                <div className="flex justify-end">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5">
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
                </div>
              )}
            </div>

            <div className="text-lg font-extrabold">
              {property.price > 0 ? formatPrice(property.price, locale) : "-"}
            </div>
            <div className="text-xs text-gray-400 font-medium truncate">
              {property.address.municipality}
              {property.address.district
                ? `, ${property.address.district}`
                : ""}
            </div>
            <div className="flex gap-3 mt-1 text-xs text-gray-400">
              {property.features.bedrooms > 0 && (
                <span>T{property.features.bedrooms}</span>
              )}
              {property.features.areaSqm > 0 && (
                <span>{formatArea(property.features.areaSqm)}</span>
              )}
            </div>
            <div className="mt-1.5">
              <Badge>
                {propertyTypesDict[property.propertyType] ||
                  property.propertyType}
              </Badge>
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-gray-400">
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
