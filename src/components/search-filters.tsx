"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { PROPERTY_TYPES, SORT_OPTIONS } from "@/lib/constants";
import { useDictionary } from "@/components/dictionary-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Small } from "@/components/ui/small";

const ANY = "__any__";
const toInternal = (v: string) => (v === "" ? ANY : v);
const toExternal = (v: string) => (v === ANY ? "" : v);

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

  const sortValue = searchParams.get("sort") || "newest";
  const propertyTypeValue = toInternal(searchParams.get("propertyType") || "");
  const bedroomsValue = toInternal(searchParams.get("bedrooms") || "");

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <Small variant="label" as="label">
          {filtersDict.sortBy}
        </Small>
        <Select
          value={sortValue}
          onValueChange={(value) => updateParam("sort", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {sortDict[opt.key] || opt.key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Small variant="label" as="label">
          {filtersDict.propertyType}
        </Small>
        <Select
          value={propertyTypeValue}
          onValueChange={(value) => updateParam("propertyType", toExternal(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{filtersDict.allTypes}</SelectItem>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {propertyTypesDict[type] || type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Small variant="label" as="label">
          {filtersDict.bedrooms}
        </Small>
        <Select
          value={bedroomsValue}
          onValueChange={(value) => updateParam("bedrooms", toExternal(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{filtersDict.anyBedrooms}</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Small variant="label" as="label">
          {filtersDict.minPrice}
        </Small>
        <input
          type="number"
          placeholder={filtersDict.minPrice}
          defaultValue={searchParams.get("minPrice") || ""}
          onBlur={(e) => updateParam("minPrice", e.target.value)}
          className="border border-gray-200 bg-white px-2 py-1 w-full text-sm focus:outline-none focus:border-gray-400"
        />
      </div>

      <div>
        <Small variant="label" as="label">
          {filtersDict.maxPrice}
        </Small>
        <input
          type="number"
          placeholder={filtersDict.maxPrice}
          defaultValue={searchParams.get("maxPrice") || ""}
          onBlur={(e) => updateParam("maxPrice", e.target.value)}
          className="border border-gray-200 bg-white px-2 py-1 w-full text-sm focus:outline-none focus:border-gray-400"
        />
      </div>
    </div>
  );
}
