"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Title } from "@/components/ui/title";
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

export type AiSearchListingType = "buy" | "rent";

export interface AiSearchPayload {
  query: string;
  adults: number;
  children: number;
  minPrice?: number;
  maxPrice?: number;
  typologies: Typology[];
  listingType: AiSearchListingType;
}

interface AIPropertiesSearcherProps {
  listingType: AiSearchListingType;
  onSearch: (payload: AiSearchPayload) => void;
  compact?: boolean;
  clearOnSubmit?: boolean;
  initialQuery?: string;
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
}: AIPropertiesSearcherProps) {
  const [query, setQuery] = useState(initialQuery);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [typologies, setTypologies] = useState<Typology[]>([]);

  const typologyOptions = availableTypologies({ listingType });

  const canSubmit = query.trim().length > 0;

  const toggleTypology = (t: Typology) => {
    setTypologies((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };

  const submit = () => {
    if (!canSubmit) return;
    onSearch({
      query: query.trim(),
      adults,
      children,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      typologies: typologies.filter((t) => typologyOptions.includes(t)),
      listingType,
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
        className="group/composer border border-rule bg-paper shadow-sm grid grid-cols-[1fr_auto] items-end gap-2 p-2 transition-colors focus-within:border-ink-subtle"
        style={{ borderRadius: 20 }}
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
          className="w-full resize-none bg-transparent outline-none leading-body placeholder:text-ink-muted overflow-auto py-1.5 px-2 text-sm max-h-40"
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

      <div className="flex gap-3">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs text-ink-muted uppercase tracking-body font-heading">
            <AdultIcon />
            Adultos
          </span>
          <Select
            value={String(adults)}
            onValueChange={(value) => setAdults(Number(value))}
          >
            <SelectTrigger
              aria-label="Adultos"
              className="h-7 w-24 px-2 py-0 text-xs rounded-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs text-ink-muted uppercase tracking-body font-heading">
            <ChildIcon />
            Crianças
          </span>
          <Select
            value={String(children)}
            onValueChange={(value) => setChildren(Number(value))}
          >
            <SelectTrigger
              aria-label="Crianças"
              className="h-7 w-24 px-2 py-0 text-xs rounded-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-xs text-ink-muted uppercase tracking-body font-heading">
          <EuroIcon />
          Preço
        </span>
        <div className="flex gap-2">
          <PriceInput
            aria-label="Preço mínimo"
            placeholder="Mín"
            value={minPrice}
            onChange={setMinPrice}
          />
          <PriceInput
            aria-label="Preço máximo"
            placeholder="Máx"
            value={maxPrice}
            onChange={setMaxPrice}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-ink-muted uppercase tracking-body font-heading">
          Tipologia
        </span>
        <div className="flex flex-wrap gap-1.5">
          {typologyOptions.map((t) => {
            const active = typologies.includes(t);
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
      </div>
    </section>
  );
}

function PriceInput({
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  "aria-label": string;
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
      className="h-7 w-full px-2 text-xs border border-rule bg-paper outline-none focus:border-ink-subtle"
    />
  );
}

function EuroIcon() {
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
      <path d="M4 10h12" />
      <path d="M4 14h9" />
      <path d="M19 6a7.5 7.5 0 1 0 0 12" />
    </svg>
  );
}

function AdultIcon() {
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
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  );
}

function ChildIcon() {
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
      <circle cx="12" cy="8" r="3" />
      <path d="M7 21v-3a5 5 0 0 1 10 0v3" />
      <path d="M9.5 14l-1 2" />
      <path d="M14.5 14l1 2" />
    </svg>
  );
}
