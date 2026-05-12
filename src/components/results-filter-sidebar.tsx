"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Small } from "@/components/ui/small";
import type { SearchResultItem } from "@/components/search-results";

export type ResultsSort = "relevance" | "priceAsc" | "priceDesc" | "areaDesc";

export interface ResultsFilterState {
  minPrice: string;
  maxPrice: string;
  bedrooms: number[];
  minArea: string;
  withComments: boolean;
  sort: ResultsSort;
}

export const initialFilterState: ResultsFilterState = {
  minPrice: "",
  maxPrice: "",
  bedrooms: [],
  minArea: "",
  withComments: false,
  sort: "relevance",
};

interface ResultsFilterSidebarProps {
  state: ResultsFilterState;
  onChange: (next: ResultsFilterState) => void;
  total: number;
  matched: number;
  /** Bedroom values present in the current results (4 = T4+). */
  availableBedrooms: number[];
  collapsible?: boolean;
}

const BEDROOM_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "T0" },
  { value: 1, label: "T1" },
  { value: 2, label: "T2" },
  { value: 3, label: "T3" },
  { value: 4, label: "T4+" },
];

const SORT_OPTIONS: { value: ResultsSort; label: string }[] = [
  { value: "relevance", label: "Relevância" },
  { value: "priceAsc", label: "Preço (menor)" },
  { value: "priceDesc", label: "Preço (maior)" },
  { value: "areaDesc", label: "Área (maior)" },
];

export function ResultsFilterSidebar({
  state,
  onChange,
  total,
  matched,
  availableBedrooms,
  collapsible = false,
}: ResultsFilterSidebarProps) {
  const dirty = useMemo(() => !isPristine(state), [state]);
  const visibleBedroomOptions = useMemo(
    () =>
      BEDROOM_OPTIONS.filter((opt) => availableBedrooms.includes(opt.value)),
    [availableBedrooms],
  );

  function set<K extends keyof ResultsFilterState>(
    key: K,
    value: ResultsFilterState[K],
  ) {
    onChange({ ...state, [key]: value });
  }

  function toggleBedroom(n: number) {
    const next = state.bedrooms.includes(n)
      ? state.bedrooms.filter((x) => x !== n)
      : [...state.bedrooms, n];
    set("bedrooms", next);
  }

  function reset() {
    onChange(initialFilterState);
  }

  const body = (
    <div className="space-y-5">
      <div>
        <Label>Ordenar por</Label>
        <select
          aria-label="Ordenar por"
          value={state.sort}
          onChange={(e) => set("sort", e.target.value as ResultsSort)}
          className="w-full h-9 px-2 text-sm border border-rule bg-paper"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {visibleBedroomOptions.length > 0 && (
        <div>
          <Label>Tipologia</Label>
          <div className="flex flex-wrap gap-1.5">
            {visibleBedroomOptions.map((b) => {
              const active = state.bedrooms.includes(b.value);
              return (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => toggleBedroom(b.value)}
                  aria-pressed={active}
                  className={cn(
                    "px-2.5 py-1.5 text-sm border cursor-pointer transition-colors",
                    active
                      ? "bg-primary text-paper border-primary"
                      : "bg-paper text-ink-secondary border-rule hover:border-primary hover:text-primary",
                  )}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <Label>Preço (€)</Label>
        <div className="flex gap-2">
          <NumberInput
            ariaLabel="Preço mínimo"
            placeholder="Mín"
            value={state.minPrice}
            onChange={(v) => set("minPrice", v)}
          />
          <NumberInput
            ariaLabel="Preço máximo"
            placeholder="Máx"
            value={state.maxPrice}
            onChange={(v) => set("maxPrice", v)}
          />
        </div>
      </div>

      <div>
        <Label>Área mínima (m²)</Label>
        <NumberInput
          ariaLabel="Área mínima"
          placeholder="ex. 60"
          value={state.minArea}
          onChange={(v) => set("minArea", v)}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.withComments}
            onChange={(e) => set("withComments", e.target.checked)}
            className="cursor-pointer accent-[hsl(172_66%_42%)]"
          />
          <span className="text-sm text-ink-secondary">
            Apenas com comentários
          </span>
        </label>
      </div>

      <div className="pt-3 border-t border-rule space-y-2">
        <Small variant="meta">
          {matched === total
            ? `${total} ${total === 1 ? "imóvel" : "imóveis"}`
            : `${matched} de ${total} imóveis`}
        </Small>
        {dirty && (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline cursor-pointer"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <details className="border border-rule bg-paper">
        <summary className="text-sm font-medium cursor-pointer px-3 py-2 select-none flex items-center justify-between">
          <span>Filtrar resultados</span>
          {dirty && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-primary/10 text-primary rounded">
              Ativo
            </span>
          )}
        </summary>
        <div className="px-3 pb-3 pt-1">{body}</div>
      </details>
    );
  }

  return (
    <aside className="border border-rule bg-paper p-4">
      <h2 className="font-heading text-sm font-bold mb-4">
        Filtrar resultados
      </h2>
      {body}
    </aside>
  );
}

export function applyResultsFilter(
  items: SearchResultItem[],
  state: ResultsFilterState,
): SearchResultItem[] {
  const minPrice = parseNumber(state.minPrice);
  const maxPrice = parseNumber(state.maxPrice);
  const minArea = parseNumber(state.minArea);

  const filtered = items.filter((it) => {
    if (minPrice !== null && it.price < minPrice) return false;
    if (maxPrice !== null && it.price > maxPrice) return false;
    if (minArea !== null && it.areaSqm < minArea) return false;
    if (state.bedrooms.length > 0) {
      const matches = state.bedrooms.some((n) =>
        n === 4 ? it.bedrooms >= 4 : it.bedrooms === n,
      );
      if (!matches) return false;
    }
    if (state.withComments && (it.comments?.length ?? 0) === 0) return false;
    return true;
  });

  switch (state.sort) {
    case "priceAsc":
      return [...filtered].sort((a, b) => a.price - b.price);
    case "priceDesc":
      return [...filtered].sort((a, b) => b.price - a.price);
    case "areaDesc":
      return [...filtered].sort((a, b) => b.areaSqm - a.areaSqm);
    case "relevance":
    default:
      return filtered;
  }
}

function isPristine(state: ResultsFilterState): boolean {
  return (
    state.minPrice === "" &&
    state.maxPrice === "" &&
    state.minArea === "" &&
    state.bedrooms.length === 0 &&
    !state.withComments &&
    state.sort === "relevance"
  );
}

function parseNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs uppercase tracking-tight font-semibold text-ink-secondary mb-2">
      {children}
    </span>
  );
}

function NumberInput({
  ariaLabel,
  placeholder,
  value,
  onChange,
}: {
  ariaLabel: string;
  placeholder: string;
  value: string;
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
      className="h-9 w-full px-2 text-sm border border-rule bg-paper outline-none focus:border-ink-subtle"
    />
  );
}
