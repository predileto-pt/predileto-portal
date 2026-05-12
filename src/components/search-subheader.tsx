"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  availableTypologies,
  type Typology,
} from "@/lib/search-rules";
import {
  type AiSearchListingType,
  type AiSearchPayload,
} from "@/components/ai-properties-searcher";
import { SearchQueryModal } from "@/components/search-query-modal";
import { LocationCombobox } from "@/components/location-combobox";
import { TypologyMultiSelect } from "@/components/typology-multi-select";

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

  const typologyOptions = availableTypologies({
    listingType: current.listingType,
  });
  // Local multi-select state — BE still accepts a single `typology` param,
  // so on change we send `typologies[0]`. Seeded from the current payload so
  // an active filter survives subheader re-renders.
  const [typologies, setTypologies] = useState<Typology[]>(
    current.typology ? [current.typology] : [],
  );

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

  function handleTypologiesChange(next: Typology[]) {
    setTypologies(next);
    const valid = next.filter((t) => typologyOptions.includes(t));
    applyPatch({ typology: valid[0] });
  }

  return (
    <>
      <div className="border-b border-rule bg-paper sticky top-0 z-30">
        <div className="px-4 py-3 space-y-3">
          {/* Top row: typology multi-select + location chip + truncated query button */}
          <div className="flex items-center gap-3">
            <TypologyMultiSelect
              options={typologyOptions}
              value={typologies}
              onChange={handleTypologiesChange}
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
