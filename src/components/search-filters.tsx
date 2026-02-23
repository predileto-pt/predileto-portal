"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { PROPERTY_TYPES, REGIONS, SORT_OPTIONS } from "@/lib/constants";
import { useDictionary } from "@/components/dictionary-provider";
import { searchAddress, type GeoapifyResult } from "@/lib/geoapify";

export function SearchFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const dict = useDictionary();

  // Extract locale from pathname (e.g. /pt/comprar → pt)
  const locale = pathname.split("/")[1] || "pt";

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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  return (
    <div className="flex flex-col gap-3 text-[11px]">
      <form onSubmit={handleSubmit} className="flex gap-1">
        <div ref={containerRef} className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            placeholder={dict.filters.search + "..."}
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
            className="border border-gray-200 px-2 py-1 w-full text-[11px] focus:outline-none focus:border-gray-400"
          />

          {isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <svg className="h-3 w-3 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
                  onMouseDown={(e) => { e.preventDefault(); selectResult(result); }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`cursor-pointer px-2 py-1.5 text-[11px] ${
                    index === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium">{result.city || result.district}</div>
                  <div className="text-[10px] text-gray-400 truncate">{result.formatted}</div>
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
        <label className="text-[10px] text-gray-400 uppercase">{dict.filters.sortBy}</label>
        <select
          value={searchParams.get("sort") || "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border border-gray-200 px-2 py-1 text-[11px] focus:outline-none w-full"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {sortDict[opt.key] || opt.key}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] text-gray-400 uppercase">{dict.filters.propertyType}</label>
        <select
          value={searchParams.get("propertyType") || ""}
          onChange={(e) => updateParam("propertyType", e.target.value)}
          className="border border-gray-200 px-2 py-1 text-[11px] focus:outline-none w-full"
        >
          <option value="">{dict.filters.allTypes}</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {propertyTypesDict[type] || type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] text-gray-400 uppercase">{dict.filters.bedrooms}</label>
        <select
          value={searchParams.get("bedrooms") || ""}
          onChange={(e) => updateParam("bedrooms", e.target.value)}
          className="border border-gray-200 px-2 py-1 text-[11px] focus:outline-none w-full"
        >
          <option value="">{dict.filters.anyBedrooms}</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      <div>
        <label className="text-[10px] text-gray-400 uppercase">{dict.filters.minPrice}</label>
        <input
          type="number"
          placeholder={dict.filters.minPrice}
          defaultValue={searchParams.get("minPrice") || ""}
          onBlur={(e) => updateParam("minPrice", e.target.value)}
          className="border border-gray-200 px-2 py-1 w-full text-[11px] focus:outline-none focus:border-gray-400"
        />
      </div>

      <div>
        <label className="text-[10px] text-gray-400 uppercase">{dict.filters.maxPrice}</label>
        <input
          type="number"
          placeholder={dict.filters.maxPrice}
          defaultValue={searchParams.get("maxPrice") || ""}
          onBlur={(e) => updateParam("maxPrice", e.target.value)}
          className="border border-gray-200 px-2 py-1 w-full text-[11px] focus:outline-none focus:border-gray-400"
        />
      </div>

      <div>
        <label className="text-[10px] text-gray-400 uppercase">{dict.filters.region}</label>
        <select
          value={searchParams.get("region") || ""}
          onChange={(e) => updateParam("region", e.target.value)}
          className="border border-gray-200 px-2 py-1 text-[11px] focus:outline-none w-full"
        >
          <option value="">{dict.filters.allRegions}</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
