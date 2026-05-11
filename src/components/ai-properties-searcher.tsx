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
        className={cn(
          "group/composer relative grid grid-cols-[1fr_auto] items-end gap-2 p-2 rounded-[20px] transition-all",
          // Frosted glass body — linear sheen baked in as bg-image, semi-translucent for backdrop blur to show through
          "bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,255,255,0.78)_45%,rgba(255,255,255,0.88))]",
          "backdrop-blur-2xl backdrop-saturate-150",
          // Layered shadows: top inner sheen, hairline bottom inner shadow, contact, mid lift, soft far shadow
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.18),0_20px_40px_-20px_rgba(0,0,0,0.15)]",
          // Gradient hairline border via ::before + mask trick (Apple "liquid glass" highlight)
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[20px] before:p-px",
          "before:[background:linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.3)_25%,rgba(255,255,255,0)_55%,rgba(0,0,0,0.06)_100%)]",
          "before:[mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)]",
          "before:[mask-composite:exclude]",
          // Focus state: stronger sheen and lift
          "focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.06),0_12px_28px_-12px_rgba(0,0,0,0.22),0_24px_48px_-20px_rgba(0,0,0,0.2)]",
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

      <div
        className={cn(
          "rounded-2xl bg-white border border-rule shadow-sm",
          compact ? "p-3" : "p-4 lg:p-5",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch gap-4 sm:gap-0">
          {/* Hóspedes */}
          <FilterGroup label="Hóspedes" className="sm:pr-5">
            <div className="flex gap-2">
              <Select
                value={String(adults)}
                onValueChange={(value) => setAdults(Number(value))}
              >
                <SelectTrigger
                  aria-label="Adultos"
                  className="h-8 w-[72px] px-2 py-0 text-xs rounded-md gap-1"
                >
                  <span className="flex items-center gap-1 text-ink-muted">
                    <AdultIcon />
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "adulto" : "adultos"}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={String(children)}
                onValueChange={(value) => setChildren(Number(value))}
              >
                <SelectTrigger
                  aria-label="Crianças"
                  className="h-8 w-[72px] px-2 py-0 text-xs rounded-md gap-1"
                >
                  <span className="flex items-center gap-1 text-ink-muted">
                    <ChildIcon />
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "criança" : "crianças"}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </FilterGroup>

          <Divider />

          {/* Preço */}
          <FilterGroup label="Preço" icon={<EuroIcon />} className="sm:px-5">
            <div className="flex h-8 items-center rounded-md border border-rule bg-paper overflow-hidden focus-within:border-ink-subtle transition-colors">
              <PriceInput
                aria-label="Preço mínimo"
                placeholder="Mín"
                value={minPrice}
                onChange={setMinPrice}
              />
              <span aria-hidden className="self-center w-px h-4 bg-rule" />
              <PriceInput
                aria-label="Preço máximo"
                placeholder="Máx"
                value={maxPrice}
                onChange={setMaxPrice}
              />
            </div>
          </FilterGroup>

          <Divider />

          {/* Tipologia */}
          <FilterGroup label="Tipologia" className="flex-1 min-w-0 sm:pl-5">
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
          </FilterGroup>
        </div>
      </div>
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
      className="h-full w-20 px-2 text-xs bg-transparent outline-none placeholder:text-ink-muted [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
