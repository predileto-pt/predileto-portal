"use client";

import { formatPrice, formatArea } from "@/lib/utils";
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
            <li
              key={item.id}
              className="border border-rule bg-paper overflow-hidden flex gap-3"
            >
              <div className="w-32 h-32 shrink-0 bg-paper-muted">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0 py-2 pr-3 space-y-1">
                <p className="text-sm font-heading font-bold text-ink truncate">
                  {item.title}
                </p>
                <p className="text-lg font-bold text-ink">
                  {formatPrice(item.price, locale)}
                  {item.listingType === "rent" && (
                    <span className="text-xs font-normal text-ink-muted">
                      /mês
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-subtle leading-body line-clamp-2">
                  {item.description}
                </p>
                <div className="flex gap-3 text-xs text-ink-subtle">
                  {item.bedrooms > 0 && <span>T{item.bedrooms}</span>}
                  {item.areaSqm > 0 && <span>{formatArea(item.areaSqm)}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <li className="border border-rule bg-paper overflow-hidden flex gap-3">
      <div className="w-32 h-32 shrink-0 bg-paper-muted animate-pulse" />
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
