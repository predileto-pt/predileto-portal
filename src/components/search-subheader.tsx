"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const activeTypologies = current.typologies.filter((t) =>
    typologyOptions.includes(t),
  );

  function applyPatch(patch: Partial<AiSearchPayload>) {
    const next: AiSearchPayload = {
      ...current,
      ...patch,
      typologies: (patch.typologies ?? current.typologies).filter((t) =>
        availableTypologies({
          listingType: patch.listingType ?? current.listingType,
        }).includes(t),
      ),
    };
    onSearch(next);
  }

  function toggleTypology(t: Typology) {
    const next = activeTypologies.includes(t)
      ? activeTypologies.filter((x) => x !== t)
      : [...activeTypologies, t];
    applyPatch({ typologies: next });
  }

  return (
    <>
      <div className="border-b border-rule bg-paper sticky top-0 z-30">
        <div className="px-4 py-3 space-y-3">
          {/* Top row: listing toggle + truncated query button */}
          <div className="flex items-center gap-3">
            <ListingToggle
              value={current.listingType}
              onChange={(listingType) => applyPatch({ listingType })}
            />

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={modalOpen}
              className={cn(
                "flex-1 min-w-0 flex items-center gap-2 text-left",
                "h-9 px-3 border border-rule bg-paper hover:bg-paper-muted",
                "transition-colors cursor-text",
              )}
              style={{ borderRadius: 18 }}
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
                {current.query || placeholderByListingType[current.listingType]}
              </span>
              <PencilIcon />
            </button>

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
                const active = activeTypologies.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTypology(t)}
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

            <CompactSelect
              ariaLabel="Adultos"
              value={String(current.adults)}
              options={Array.from({ length: 10 }, (_, i) => ({
                value: String(i + 1),
                label: `${i + 1} ${i + 1 === 1 ? "adulto" : "adultos"}`,
              }))}
              onChange={(value) => applyPatch({ adults: Number(value) })}
            />
            <CompactSelect
              ariaLabel="Crianças"
              value={String(current.children)}
              options={Array.from({ length: 11 }, (_, i) => ({
                value: String(i),
                label:
                  i === 0
                    ? "Sem crianças"
                    : `${i} ${i === 1 ? "criança" : "crianças"}`,
              }))}
              onChange={(value) => applyPatch({ children: Number(value) })}
            />

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

function CompactSelect({
  ariaLabel,
  value,
  options,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-7 w-auto px-2 py-0 text-xs rounded-full border-rule"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
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

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 text-ink-muted shrink-0"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}
