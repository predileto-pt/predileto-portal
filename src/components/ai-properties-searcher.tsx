"use client";

import { useState } from "react";
import { Title } from "@/components/ui/title";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AiSearchListingType = "buy" | "rent";

interface AIPropertiesSearcherProps {
  listingType: AiSearchListingType;
}

const placeholderByListingType: Record<AiSearchListingType, string> = {
  buy: "Ex: apartamento T2 em Lisboa até 300.000€ com varanda...",
  rent: "Ex: casa T3 no Porto até 1.500€/mês com jardim...",
};

export function AIPropertiesSearcher({ listingType }: AIPropertiesSearcherProps) {
  const [query, setQuery] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const canSubmit = query.trim().length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    // eslint-disable-next-line no-console
    console.log("AI search:", { listingType, query, adults, children });
  };

  return (
    <section className="max-w-2xl mx-auto py-10 space-y-6">
      <Title variant="page" className="text-center">
        O que você está buscando?
      </Title>

      <form
        onSubmit={handleSubmit}
        data-type="ai-search-composer"
        className="group/composer border border-rule bg-paper shadow-sm p-2.5 grid grid-cols-[1fr_auto] items-end gap-2 transition-colors focus-within:border-ink-subtle"
        style={{ borderRadius: 28 }}
      >
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSubmit) {
                handleSubmit(event);
              }
            }
          }}
          placeholder={placeholderByListingType[listingType]}
          rows={1}
          aria-label="Descreva o que procura"
          className="w-full resize-none bg-transparent outline-none text-base leading-body placeholder:text-ink-muted max-h-52 overflow-auto py-2 px-2"
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Pesquisar"
          className="h-9 w-9 rounded-full bg-ink text-paper flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-80 transition-opacity"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
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
            <SelectTrigger aria-label="Adultos" className="h-7 w-24 px-2 py-0 text-xs rounded-none">
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
            <SelectTrigger aria-label="Crianças" className="h-7 w-24 px-2 py-0 text-xs rounded-none">
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
    </section>
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
