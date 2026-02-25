"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { PROPERTY_TYPES, SORT_OPTIONS } from "@/lib/constants";
import { useDictionary } from "@/components/dictionary-provider";
import { searchAddress, type GeoapifyResult } from "@/lib/geoapify";
import {
  getRegioes,
  getDistritos,
  getConcelhos,
  getFreguesias,
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

  const currentRegiao = resolved?.regiao?.slug || "";
  const currentDistrito = resolved?.distrito?.slug || "";
  const currentConcelho = resolved?.concelho?.slug || "";
  const currentFreguesia = resolved?.freguesia?.slug || "";

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

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
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
      params.delete("region");
      params.delete("city");
      const base = `/${locale}/${listingSlug}`;
      const path = slugs.length > 0 ? `${base}/${slugs.join("/")}` : base;
      const qs = params.toString();
      router.push(qs ? `${path}?${qs}` : path);
    },
    [searchParams, router, locale, listingSlug],
  );

  // Autocomplete state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<GeoapifyResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (text.length < 3) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      setIsLoading(true);
      const data = await searchAddress(text, locale);
      setResults(data);
      setIsOpen(data.length > 0);
      setActiveIndex(-1);
      setIsLoading(false);
    },
    [locale],
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  }

  function selectResult(result: GeoapifyResult) {
    setQuery(result.formatted);
    setIsOpen(false);
    const updates: Record<string, string> = { q: result.formatted };
    if (result.district) updates.region = result.district;
    if (result.city) updates.city = result.city;
    updateParams(updates);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      selectResult(results[activeIndex]);
      return;
    }
    setIsOpen(false);
    updateParam("q", query.trim());
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

  const sortDict = dict.sort as Record<string, string>;
  const propertyTypesDict = dict.propertyTypes as Record<string, string>;
  const filtersDict = dict.filters as Record<string, string>;

  // Location dropdown data
  const regioes = getRegioes();
  const distritos = currentRegiao ? getDistritos(currentRegiao) : [];
  const concelhos =
    currentRegiao && currentDistrito
      ? getConcelhos(currentRegiao, currentDistrito)
      : [];
  const freguesias =
    currentRegiao && currentDistrito && currentConcelho
      ? getFreguesias(currentRegiao, currentDistrito, currentConcelho)
      : [];

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

          {isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <svg
                className="h-3 w-3 animate-spin text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}

          {isOpen && (
            <ul
              role="listbox"
              className="absolute z-50 mt-1 w-full border border-gray-200 bg-white shadow-sm"
            >
              {results.map((result, index) => (
                <li
                  key={index}
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
                  <div className="font-medium">
                    {result.city || result.district}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">
                    {result.formatted}
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

      {/* Cascading location dropdowns */}
      <div>
        <label className="text-[11px] text-gray-400 uppercase">
          {filtersDict.regiao}
        </label>
        <select
          value={currentRegiao}
          onChange={(e) => {
            const slug = e.target.value;
            navigateToLocation(slug ? [slug] : []);
          }}
          className="border border-gray-200 px-2 py-1 text-[12px] focus:outline-none w-full"
        >
          <option value="">{filtersDict.allRegions}</option>
          {regioes.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {distritos.length > 0 && (
        <div>
          <label className="text-[11px] text-gray-400 uppercase">
            {filtersDict.distrito}
          </label>
          <select
            value={currentDistrito}
            onChange={(e) => {
              const slug = e.target.value;
              navigateToLocation(
                slug ? [currentRegiao, slug] : [currentRegiao],
              );
            }}
            className="border border-gray-200 px-2 py-1 text-[12px] focus:outline-none w-full"
          >
            <option value="">{filtersDict.allDistritos}</option>
            {distritos.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {concelhos.length > 0 && (
        <div>
          <label className="text-[11px] text-gray-400 uppercase">
            {filtersDict.concelho}
          </label>
          <select
            value={currentConcelho}
            onChange={(e) => {
              const slug = e.target.value;
              navigateToLocation(
                slug
                  ? [currentRegiao, currentDistrito, slug]
                  : [currentRegiao, currentDistrito],
              );
            }}
            className="border border-gray-200 px-2 py-1 text-[12px] focus:outline-none w-full"
          >
            <option value="">{filtersDict.allConcelhos}</option>
            {concelhos.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {freguesias.length > 0 && (
        <div>
          <label className="text-[11px] text-gray-400 uppercase">
            {filtersDict.freguesia}
          </label>
          <select
            value={currentFreguesia}
            onChange={(e) => {
              const slug = e.target.value;
              navigateToLocation(
                slug
                  ? [currentRegiao, currentDistrito, currentConcelho, slug]
                  : [currentRegiao, currentDistrito, currentConcelho],
              );
            }}
            className="border border-gray-200 px-2 py-1 text-[12px] focus:outline-none w-full"
          >
            <option value="">{filtersDict.allFreguesias}</option>
            {freguesias.map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
