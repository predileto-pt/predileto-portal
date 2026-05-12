"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Title } from "@/components/ui/title";
import {
  availableTypologies,
  type Typology,
} from "@/lib/search-rules";
import type { LocationSelection } from "@/lib/estate-os";
import { LocationCombobox } from "@/components/location-combobox";
import { TypologyMultiSelect } from "@/components/typology-multi-select";

export type AiSearchListingType = "buy" | "rent";

export interface AiSearchPayload {
  query: string;
  listingType: AiSearchListingType;
  location: LocationSelection | null;
  minPrice?: number;
  maxPrice?: number;
  typology?: Typology;
}

interface AIPropertiesSearcherProps {
  listingType: AiSearchListingType;
  onSearch: (payload: AiSearchPayload) => void;
  compact?: boolean;
  clearOnSubmit?: boolean;
  initialQuery?: string;
  initialLocation?: LocationSelection | null;
}

const placeholderByListingType: Record<AiSearchListingType, string> = {
  buy: "Ex: apartamento T2 em Lisboa até 300.000€ com varanda...",
  rent: "Ex: casa T3 no Porto até 1.500€/mês com jardim...",
};

export function AIPropertiesSearcher({
  listingType,
  onSearch,
  compact = false,
  clearOnSubmit = true,
  initialQuery = "",
  initialLocation = null,
}: AIPropertiesSearcherProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState<LocationSelection | null>(
    initialLocation,
  );
  const [typologies, setTypologies] = useState<Typology[]>([]);

  const typologyOptions = availableTypologies({ listingType });
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  // q non-empty needs a location; otherwise the form is submittable
  // (structured-only browse — query is optional).
  const canSubmit = !hasQuery || location !== null;

  const submit = () => {
    if (!canSubmit) return;
    // TODO: BE accepts a single `typology` param — pass the first valid
    // selection. Multi-typology requires a query-param list change.
    const valid = typologies.filter((t) => typologyOptions.includes(t));
    onSearch({
      query: trimmedQuery,
      listingType,
      location,
      typology: valid[0],
    });
    if (clearOnSubmit) setQuery("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submit();
  };

  return (
    <section
      className={cn(
        "space-y-3",
        compact ? "w-full" : "max-w-2xl mx-auto py-8",
      )}
    >
      <Title
        variant="card"
        level={2}
        className={compact ? "" : "text-center"}
      >
        O que você está buscando?
      </Title>

      <form
        onSubmit={handleSubmit}
        data-type="ai-search-composer"
        className={cn(
          "group/composer relative grid grid-cols-[1fr_auto] items-end gap-2 p-2 rounded-[20px] transition-colors",
          "bg-white border border-gray-200 focus-within:border-gray-400",
        )}
      >
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={placeholderByListingType[listingType]}
          rows={1}
          aria-label="Descreva o que procura"
          className="w-full resize-none bg-transparent outline-none leading-body placeholder:text-ink-muted overflow-auto py-1.5 px-2 max-h-40"
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Pesquisar"
          className="rounded-full bg-ink text-paper flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-80 transition-opacity h-8 w-8"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </form>

      <div
        className={cn(
          "rounded-2xl bg-white border border-rule shadow-sm",
          compact ? "p-3" : "p-4 lg:p-5",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch gap-4 sm:gap-0">
          {/* Localização */}
          <FilterGroup label="Localização" className="sm:pr-5">
            <LocationCombobox
              value={location}
              onChange={setLocation}
              variant="inline"
            />
          </FilterGroup>

          <Divider />

          {/* Tipologia — multi-select dropdown */}
          <FilterGroup label="Tipologia" className="flex-1 min-w-0 sm:pl-5">
            <TypologyMultiSelect
              options={typologyOptions}
              value={typologies}
              onChange={setTypologies}
            />
          </FilterGroup>
        </div>
      </div>

      {hasQuery && !location && !compact && (
        <p
          role="status"
          className="text-xs text-ink-muted text-center"
        >
          Escolha uma localização para pesquisar com texto livre.
        </p>
      )}
    </section>
  );
}

function FilterGroup({
  label,
  icon,
  className,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-center gap-1.5 text-[10px] text-ink-muted uppercase tracking-body font-heading">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="hidden sm:block self-stretch w-px bg-rule"
    />
  );
}

