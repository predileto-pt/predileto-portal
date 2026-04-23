"use client";

import { useState } from "react";
import { cn, formatPrice, formatArea } from "@/lib/utils";
import { Small } from "@/components/ui/small";
import { Title } from "@/components/ui/title";

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  price: number;
  areaSqm: number;
  bedrooms: number;
  imageUrl?: string;
  listingType: "buy" | "rent";
}

interface SearchResultsProps {
  items: SearchResultItem[] | null;
  loading?: boolean;
  locale: string;
}

export function SearchResults({ items, loading, locale }: SearchResultsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between h-7">
        <Title variant="card" level={2}>
          Resultados
        </Title>
        {items && items.length > 0 && (
          <Small variant="meta">
            {items.length} {items.length === 1 ? "imóvel" : "imóveis"}
          </Small>
        )}
      </div>

      {loading ? (
        <ul className="space-y-3" aria-busy aria-live="polite">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </ul>
      ) : items === null ? (
        <div className="border border-dashed border-rule bg-paper-muted py-16 text-center">
          <Small variant="default">Os resultados aparecerão aqui.</Small>
        </div>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-rule bg-paper-muted py-16 text-center">
          <Small variant="default">Nenhum imóvel encontrado.</Small>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <ResultCard key={item.id} item={item} locale={locale} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ResultCard({
  item,
  locale,
}: {
  item: SearchResultItem;
  locale: string;
}) {
  const [interested, setInterested] = useState(false);

  return (
    <li className="border border-rule bg-paper overflow-hidden flex gap-3">
      <div className="w-56 aspect-[4/3] shrink-0 bg-paper-muted">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex-1 min-w-0 py-2 pr-3 flex flex-col">
        <div className="space-y-1 flex-1 min-h-0">
          <p className="text-sm font-heading font-bold truncate landing-gradient-text">
            {item.title}
          </p>
          <p className="text-lg font-bold text-ink">
            {formatPrice(item.price, locale)}
            {item.listingType === "rent" && (
              <span className="text-xs font-normal text-ink-muted">/mês</span>
            )}
          </p>
          <p className="text-sm text-ink-subtle leading-body line-clamp-2">
            {item.description}
          </p>
          <div className="flex gap-3 text-xs text-ink-subtle">
            {item.bedrooms > 0 && <span>T{item.bedrooms}</span>}
            {item.areaSqm > 0 && <span>{formatArea(item.areaSqm)}</span>}
          </div>
        </div>

        <div className="flex gap-1 pt-2 mt-2 border-t border-rule -mr-3">
          <CardActionButton
            active={interested}
            onClick={() => setInterested((v) => !v)}
            icon={<HeartIcon filled={interested} />}
            label="Interesse"
          />
          <CardActionButton
            onClick={() => {
              // TODO: open a comment composer
            }}
            icon={<ChatIcon />}
            label="Comentar"
          />
        </div>
      </div>
    </li>
  );
}

function CardActionButton({
  active,
  onClick,
  icon,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 text-xs font-heading cursor-pointer",
        "text-ink-subtle hover:text-primary",
        active && "text-primary",
      )}
    >
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <li className="border border-rule bg-paper overflow-hidden flex gap-3">
      <div className="w-56 aspect-[4/3] shrink-0 bg-paper-muted animate-pulse" />
      <div className="flex-1 py-2 pr-3 space-y-2">
        <div className="h-3 w-3/4 bg-paper-muted animate-pulse rounded-sm" />
        <div className="h-5 w-1/3 bg-paper-muted animate-pulse rounded-sm" />
        <div className="flex gap-3 pt-1">
          <div className="h-2.5 w-8 bg-paper-muted animate-pulse rounded-sm" />
          <div className="h-2.5 w-12 bg-paper-muted animate-pulse rounded-sm" />
        </div>
      </div>
    </li>
  );
}
