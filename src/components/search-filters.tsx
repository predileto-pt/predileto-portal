"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { PROPERTY_TYPES, SORT_OPTIONS } from "@/lib/constants";
import { useDictionary } from "@/components/dictionary-provider";
import { Select } from "@/components/ui/select";

export function SearchFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const dict = useDictionary();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const sortDict = dict.sort as Record<string, string>;
  const propertyTypesDict = dict.propertyTypes as Record<string, string>;
  const filtersDict = dict.filters as Record<string, string>;

  const sortOptions = SORT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: sortDict[opt.key] || opt.key,
  }));

  const propertyTypeOptions = [
    { value: "", label: filtersDict.allTypes },
    ...PROPERTY_TYPES.map((type) => ({
      value: type,
      label: propertyTypesDict[type] || type,
    })),
  ];

  const bedroomOptions = [
    { value: "", label: filtersDict.anyBedrooms },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
  ];

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <label className="text-xs text-gray-400 uppercase">
          {filtersDict.sortBy}
        </label>
        <Select
          value={searchParams.get("sort") || "newest"}
          onValueChange={(value) => updateParam("sort", value)}
          options={sortOptions}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase">
          {filtersDict.propertyType}
        </label>
        <Select
          value={searchParams.get("propertyType") || ""}
          onValueChange={(value) => updateParam("propertyType", value)}
          options={propertyTypeOptions}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase">
          {filtersDict.bedrooms}
        </label>
        <Select
          value={searchParams.get("bedrooms") || ""}
          onValueChange={(value) => updateParam("bedrooms", value)}
          options={bedroomOptions}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase">
          {filtersDict.minPrice}
        </label>
        <input
          type="number"
          placeholder={filtersDict.minPrice}
          defaultValue={searchParams.get("minPrice") || ""}
          onBlur={(e) => updateParam("minPrice", e.target.value)}
          className="border border-gray-200 px-2 py-1 w-full text-sm focus:outline-none focus:border-gray-400"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase">
          {filtersDict.maxPrice}
        </label>
        <input
          type="number"
          placeholder={filtersDict.maxPrice}
          defaultValue={searchParams.get("maxPrice") || ""}
          onBlur={(e) => updateParam("maxPrice", e.target.value)}
          className="border border-gray-200 px-2 py-1 w-full text-sm focus:outline-none focus:border-gray-400"
        />
      </div>
    </div>
  );
}
