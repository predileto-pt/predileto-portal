"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  availableTypologies,
  typologyLabels,
  type Typology,
} from "@/lib/search-rules";
import {
  type AiSearchListingType,
  type AiSearchPayload,
} from "@/components/ai-properties-searcher";
import { SearchQueryModal } from "@/components/search-query-modal";
import { LocationCombobox } from "@/components/location-combobox";

interface SearchSubheaderProps {
  current: AiSearchPayload;
  loading?: boolean;
  onSearch: (payload: AiSearchPayload) => void;
}

const placeholderByListingType: Record<AiSearchListingType, string> = {
  buy: "Ex: apartamento T2 em Lisboa até 300.000€ com varanda...",
  rent: "Ex: casa T3 no Porto até 1.500€/mês com jardim...",
};

export function SearchSubheader({
  current,
  loading,
  onSearch,
}: SearchSubheaderProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const typologyOptions = availableTypologies({ listingType: current.listingType });
  const activeTypology =
    current.typology && typologyOptions.includes(current.typology)
      ? current.typology
      : undefined;

  function applyPatch(patch: Partial<AiSearchPayload>) {
    const nextListingType = patch.listingType ?? current.listingType;
    const nextTypology = "typology" in patch ? patch.typology : current.typology;
    const allowedTypologies = availableTypologies({
      listingType: nextListingType,
    });
    const next: AiSearchPayload = {
      ...current,
      ...patch,
      listingType: nextListingType,
      typology:
        nextTypology && allowedTypologies.includes(nextTypology)
          ? nextTypology
          : undefined,
    };
    onSearch(next);
  }

  function selectTypology(t: Typology) {
    const next = activeTypology === t ? undefined : t;
    applyPatch({ typology: next });
  }

  return (
    <>
      <div className="border-b border-rule bg-paper sticky top-0 z-30">
        <div className="px-4 py-3 space-y-3">
          {/* Top row: listing toggle + location chip + truncated query button */}
          <div className="flex items-center gap-3">
            <ListingToggle
              value={current.listingType}
              onChange={(listingType) => applyPatch({ listingType })}
            />

            <LocationCombobox
              value={current.location}
              onChange={(location) => applyPatch({ location })}
              variant="trigger"
              placeholder="Localização"
            />

            <div
              className={cn(
                "flex-1 min-w-0 flex items-center",
                "h-9 border border-rule bg-paper hover:bg-paper-muted",
                "transition-colors",
              )}
              style={{ borderRadius: 18 }}
            >
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={modalOpen}
                className="flex-1 min-w-0 h-full flex items-center gap-2 text-left px-3 cursor-text"
              >
                <SearchIcon />
                <span
                  className={cn(
                    "flex-1 truncate text-sm",
                    current.query
                      ? "text-ink"
                      : "text-ink-muted italic",
                  )}
                >
                  {current.query ||
                    placeholderByListingType[current.listingType]}
                </span>
              </button>
              {current.query && (
                <button
                  type="button"
                  onClick={() => applyPatch({ query: "" })}
                  aria-label="Limpar pesquisa"
                  className="h-full px-3 flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
                >
                  <XIcon />
                </button>
              )}
            </div>

            {loading && (
              <span
                className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                aria-label="A pesquisar"
              />
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex flex-wrap gap-1.5">
              {typologyOptions.map((t) => {
                const active = activeTypology === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => selectTypology(t)}
                    aria-pressed={active}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-full border cursor-pointer transition-colors",
                      active
                        ? "bg-primary text-paper border-primary"
                        : "bg-paper text-ink-secondary border-rule hover:border-primary hover:text-primary",
                    )}
                  >
                    {typologyLabels[t]}
                  </button>
                );
              })}
            </div>

            <span className="hidden sm:block w-px h-5 bg-rule" aria-hidden />

            <PriceField
              ariaLabel="Preço mínimo"
              placeholder="Mín €"
              value={current.minPrice ?? ""}
              onChange={(v) =>
                applyPatch({ minPrice: v === "" ? undefined : Number(v) })
              }
            />
            <PriceField
              ariaLabel="Preço máximo"
              placeholder="Máx €"
              value={current.maxPrice ?? ""}
              onChange={(v) =>
                applyPatch({ maxPrice: v === "" ? undefined : Number(v) })
              }
            />
          </div>
        </div>
      </div>

      <SearchQueryModal
        open={modalOpen}
        initialQuery={current.query}
        placeholder={placeholderByListingType[current.listingType]}
        onSubmit={(query) => applyPatch({ query })}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

function ListingToggle({
  value,
  onChange,
}: {
  value: AiSearchListingType;
  onChange: (v: AiSearchListingType) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Tipo de pesquisa"
      className="inline-flex rounded-full border border-rule bg-paper p-0.5 shrink-0"
    >
      {(["buy", "rent"] as AiSearchListingType[]).map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={value === t}
          onClick={() => onChange(t)}
          className={cn(
            "px-3 py-1 text-xs font-heading font-semibold rounded-full cursor-pointer transition-colors",
            value === t
              ? "bg-ink text-paper"
              : "text-ink-subtle hover:text-ink",
          )}
        >
          {t === "buy" ? "Comprar" : "Arrendar"}
        </button>
      ))}
    </div>
  );
}

function PriceField({
  ariaLabel,
  placeholder,
  value,
  onChange,
}: {
  ariaLabel: string;
  placeholder: string;
  value: number | string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      step={1000}
      placeholder={placeholder}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 w-24 px-2 text-xs border border-rule rounded-full bg-paper outline-none focus:border-ink-subtle"
    />
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 text-ink-muted shrink-0"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 shrink-0"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
