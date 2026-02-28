"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { PROPERTY_TYPES, SORT_OPTIONS } from "@/lib/constants";
import { useDictionary } from "@/components/dictionary-provider";

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

  return (
    <div className="flex flex-col gap-3 text-[12px]">
      <div>
        <label className="text-[11px] text-gray-400 uppercase">
          {filtersDict.sortBy}
        </label>
        <select
          value={searchParams.get("sort") || "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border border-gray-200 px-2 py-1 text-[12px] focus:outline-none w-full"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {sortDict[opt.key] || opt.key}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[11px] text-gray-400 uppercase">
          {filtersDict.propertyType}
        </label>
        <select
          value={searchParams.get("propertyType") || ""}
          onChange={(e) => updateParam("propertyType", e.target.value)}
          className="border border-gray-200 px-2 py-1 text-[12px] focus:outline-none w-full"
        >
          <option value="">{filtersDict.allTypes}</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {propertyTypesDict[type] || type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[11px] text-gray-400 uppercase">
          {filtersDict.bedrooms}
        </label>
        <select
          value={searchParams.get("bedrooms") || ""}
          onChange={(e) => updateParam("bedrooms", e.target.value)}
          className="border border-gray-200 px-2 py-1 text-[12px] focus:outline-none w-full"
        >
          <option value="">{filtersDict.anyBedrooms}</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] text-gray-400 uppercase">
          {filtersDict.minPrice}
        </label>
        <input
          type="number"
          placeholder={filtersDict.minPrice}
          defaultValue={searchParams.get("minPrice") || ""}
          onBlur={(e) => updateParam("minPrice", e.target.value)}
          className="border border-gray-200 px-2 py-1 w-full text-[12px] focus:outline-none focus:border-gray-400"
        />
      </div>

      <div>
        <label className="text-[11px] text-gray-400 uppercase">
          {filtersDict.maxPrice}
        </label>
        <input
          type="number"
          placeholder={filtersDict.maxPrice}
          defaultValue={searchParams.get("maxPrice") || ""}
          onBlur={(e) => updateParam("maxPrice", e.target.value)}
          className="border border-gray-200 px-2 py-1 w-full text-[12px] focus:outline-none focus:border-gray-400"
        />
      </div>
    </div>
  );
}
