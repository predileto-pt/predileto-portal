"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { PROPERTY_TYPES, SORT_OPTIONS } from "@/lib/constants";
import { useDictionary } from "@/components/dictionary-provider";
import {
  searchLocations,
  type LocationSearchResult,
  type ResolvedLocation,
} from "@/lib/locations";

interface SearchFiltersProps {
  locationSlugs?: string[];
  resolved?: ResolvedLocation;
  locale?: string;
  listingSlug?: string;
}

export function SearchFilters({
  locationSlugs = [],
  resolved,
  locale: localeProp,
  listingSlug: listingSlugProp,
}: SearchFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const dict = useDictionary();

  // Extract locale and listing slug from pathname if not provided as props
  const pathParts = pathname.split("/").filter(Boolean);
  const locale = localeProp || pathParts[0] || "pt";
  const listingSlug = listingSlugProp || pathParts[1] || "comprar";

  const currentRegion = resolved?.region?.slug || "";
  const currentDistrict = resolved?.district?.slug || "";
  const currentMunicipality = resolved?.municipality?.slug || "";
  const currentParish = resolved?.parish?.slug || "";

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

  // Navigate to a location path
  const navigateToLocation = useCallback(
    (slugs: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      const base = `/${locale}/${listingSlug}`;
      const path = slugs.length > 0 ? `${base}/${slugs.join("/")}` : base;
      const qs = params.toString();
      router.push(qs ? `${path}?${qs}` : path);
    },
    [searchParams, router, locale, listingSlug],
  );

  // Autocomplete state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const matches = searchLocations(value);
    setResults(matches);
    setIsOpen(matches.length > 0);
    setActiveIndex(-1);
  }

  function selectResult(result: LocationSearchResult) {
    setQuery("");
    setIsOpen(false);
    navigateToLocation(result.slugs);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      selectResult(results[activeIndex]);
      return;
    }
    if (results.length > 0) {
      selectResult(results[0]);
      return;
    }
    setIsOpen(false);
    if (query.trim()) {
      updateParam("q", query.trim());
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        if (activeIndex >= 0) {
          e.preventDefault();
          selectResult(results[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  function clearLocation() {
    navigateToLocation([]);
  }

  const sortDict = dict.sort as Record<string, string>;
  const propertyTypesDict = dict.propertyTypes as Record<string, string>;
  const filtersDict = dict.filters as Record<string, string>;

  // Build current location label
  const locationLabel =
    resolved?.parish?.name ??
    resolved?.municipality?.name ??
    resolved?.district?.name ??
    resolved?.region?.name;
  const hasLocation = !!(currentRegion || currentDistrict || currentMunicipality || currentParish);

  return (
    <div className="flex flex-col gap-3 text-[12px]">
      <form onSubmit={handleSubmit} className="flex gap-1">
        <div ref={containerRef} className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder={filtersDict.search + "..."}
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
            }
            className="border border-gray-200 px-2 py-1 w-full text-[12px] focus:outline-none focus:border-gray-400"
          />

          {isOpen && (
            <ul
              role="listbox"
              className="absolute z-50 mt-1 w-full border border-gray-200 bg-white shadow-sm"
            >
              {results.map((result, index) => (
                <li
                  key={`${result.level}-${result.slugs.join("/")}`}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectResult(result);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`cursor-pointer px-2 py-1.5 text-[12px] ${
                    index === activeIndex
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium">{result.name}</div>
                  <div className="text-[11px] text-gray-400 truncate">
                    {result.context}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="border border-gray-200 px-2 py-1 hover:bg-gray-50"
        >
          go
        </button>
      </form>

      {hasLocation && locationLabel && (
        <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-1 border border-gray-200">
          <span className="truncate flex-1">{locationLabel}</span>
          <button
            onClick={clearLocation}
            className="shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="Clear location"
          >
            &times;
          </button>
        </div>
      )}

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
