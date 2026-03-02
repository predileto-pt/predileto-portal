"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { useDictionary } from "@/components/dictionary-provider";
import {
  searchLocations,
  type LocationSearchResult,
  type ResolvedLocation,
} from "@/lib/locations";

interface SearchBarProps {
  locale: string;
  listingSlug: string;
  locationSlugs: string[];
  resolved?: ResolvedLocation;
}

export function SearchBar({
  locale,
  listingSlug,
  locationSlugs,
  resolved,
}: SearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const dict = useDictionary();

  const filtersDict = dict.filters as Record<string, string>;

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

  // Location chip
  const locationLabel =
    resolved?.parish?.name ??
    resolved?.municipality?.name ??
    resolved?.district?.name ??
    resolved?.region?.name;
  const hasLocation = locationSlugs.length > 0;

  function clearLocation() {
    navigateToLocation([]);
  }

  return (
    <div className="w-full max-w-2xl">
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
            placeholder={filtersDict.searchPlaceholder || filtersDict.search + "..."}
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined
            }
            className="border border-gray-200 px-3 py-1.5 w-full text-sm focus:outline-none focus:border-gray-400"
          />

          {isOpen && (
            <ul
              role="listbox"
              className="absolute z-50 mt-1 w-full border border-gray-200 bg-white shadow-sm"
            >
              {results.map((result, index) => (
                <li
                  key={`${result.level}-${result.slugs.join("/")}`}
                  id={`search-suggestion-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectResult(result);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`cursor-pointer px-3 py-1.5 text-sm ${
                    index === activeIndex
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium">{result.name}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {result.context}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          {filtersDict.search}
        </button>
      </form>

      {hasLocation && locationLabel && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 border border-gray-200 max-w-xs">
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
    </div>
  );
}
