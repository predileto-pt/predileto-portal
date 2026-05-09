"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatPrice, formatArea } from "@/lib/utils";
import { Small } from "@/components/ui/small";
import { Title } from "@/components/ui/title";
import { CommentsList, type CommentData } from "@/components/comments-list";
import {
  ResultMediaCarousel,
  type ResultMediaItem,
} from "@/components/result-media-carousel";

export interface AiAttribute {
  key: string;
  label: string;
  value: string;
  icon?: "euro" | "fuel" | "commute" | "noise" | "amenity";
}

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  price: number;
  areaSqm: number;
  bedrooms: number;
  /** @deprecated prefer `media`. Kept as a fallback for single-image entries. */
  imageUrl?: string;
  /** Mixed image / video carousel items. Wins over `imageUrl` when present. */
  media?: ResultMediaItem[];
  listingType: "buy" | "rent";
  aiAttributes?: AiAttribute[];
  comments?: CommentData[];
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
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const commentCount = item.comments?.length ?? 0;
  const detailHref = `/${locale}/imovel/${item.id}`;
  const media: ResultMediaItem[] =
    item.media && item.media.length > 0
      ? item.media
      : item.imageUrl
        ? [{ type: "image", url: item.imageUrl, alt: item.title }]
        : [];

  return (
    <li className="group border border-rule bg-paper transition-shadow hover:shadow-md">
      {/* Header strip */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-rule">
        <div
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white"
          style={{
            background:
              "linear-gradient(135deg, hsl(172 66% 50%), hsl(38 92% 50%))",
          }}
          aria-hidden
        >
          <SparkleIcon />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate">Sugestão IA</p>
          <p className="text-xs text-ink-muted truncate">
            Predileto · {item.title}
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded">
          {item.listingType === "buy" ? "Comprar" : "Arrendar"}
        </span>
      </header>

      {/* Title + price */}
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-heading text-base font-bold leading-snug">
            <Link
              href={detailHref}
              className="hover:underline underline-offset-2 decoration-1"
            >
              {item.title}
            </Link>
          </h3>
          <p className="shrink-0 font-heading text-lg font-extrabold tracking-heading text-primary">
            {formatPrice(item.price, locale)}
            {item.listingType === "rent" && (
              <span className="text-xs font-normal text-ink-muted">/mês</span>
            )}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-secondary">
          {item.bedrooms > 0 && (
            <span className="font-medium">T{item.bedrooms}</span>
          )}
          {item.areaSqm > 0 && <span>{formatArea(item.areaSqm)}</span>}
        </div>
      </div>

      {/* Hero carousel */}
      <div className="mt-4">
        <ResultMediaCarousel
          media={media}
          altFallback={item.title}
          prevLabel="Anterior"
          nextLabel="Seguinte"
        />
      </div>

      {/* AI attributes */}
      {item.aiAttributes && item.aiAttributes.length > 0 && (
        <div className="px-4 pt-3">
          <AiAttributesSection attributes={item.aiAttributes} />
        </div>
      )}

      {/* Description */}
      {item.description && (
        <div className="px-4 pt-3">
          <p
            className={cn(
              "text-sm text-ink leading-relaxed",
              !descExpanded && "line-clamp-3",
            )}
          >
            {item.description}
          </p>
          {item.description.length > 120 && (
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-1 text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline cursor-pointer"
            >
              {descExpanded ? "Ler menos" : "Ler mais"}
            </button>
          )}
        </div>
      )}

      {/* Action row */}
      <footer className="flex items-center justify-between gap-2 px-4 py-3 mt-3 border-t border-rule">
        <div className="flex gap-1">
          <CardActionButton
            active={interested}
            onClick={() => setInterested((v) => !v)}
            icon={<HeartIcon filled={interested} />}
            label="Interesse"
          />
          <CardActionButton
            active={commentsOpen}
            onClick={() => setCommentsOpen((v) => !v)}
            icon={<ChatIcon />}
            label={`Comentários (${commentCount})`}
            ariaExpanded={commentsOpen}
          />
        </div>
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold font-heading uppercase tracking-tight px-3.5 py-2 bg-primary text-paper rounded-md shadow-sm hover:opacity-90 transition-opacity"
        >
          Ver detalhe
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
            aria-hidden
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </footer>

      {commentsOpen && (
        <div className="border-t border-rule bg-paper-muted">
          <CommentsList comments={item.comments ?? []} />
        </div>
      )}
    </li>
  );
}

function AiAttributesSection({ attributes }: { attributes: AiAttribute[] }) {
  return (
    <div className="pt-2 space-y-1.5 shrink-0">
      <Small className="font-semibold">Análise para sua pesquisa</Small>
      <ul className="flex gap-1.5 overflow-x-auto scrollbar-hide -mr-3 pr-3">
        {attributes.map((attr) => (
          <li
            key={attr.key}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full shrink-0 whitespace-nowrap"
          >
            <AttributeIcon name={attr.icon} />
            <span className="text-ink-secondary">{attr.label}:</span>
            <span className="font-bold">{attr.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AttributeIcon({ name }: { name?: AiAttribute["icon"] }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "w-3.5 h-3.5 shrink-0",
    "aria-hidden": true,
  };
  switch (name) {
    case "euro":
      return (
        <svg {...props}>
          <path d="M4 10h12" />
          <path d="M4 14h9" />
          <path d="M19 6a7.5 7.5 0 1 0 0 12" />
        </svg>
      );
    case "fuel":
      return (
        <svg {...props}>
          <line x1="3" y1="22" x2="15" y2="22" />
          <line x1="4" y1="9" x2="14" y2="9" />
          <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
          <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V8l-3-3" />
        </svg>
      );
    case "commute":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
      );
    case "noise":
      return (
        <svg {...props}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      );
    case "amenity":
      return (
        <svg {...props}>
          <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    default:
      return null;
  }
}

function CardActionButton({
  active,
  onClick,
  icon,
  label,
  ariaExpanded,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  ariaExpanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaExpanded === undefined ? active : undefined}
      aria-expanded={ariaExpanded}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 text-xs font-heading cursor-pointer",
        "text-ink-subtle hover:text-primary",
        active && "text-primary"
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
    <li className="border border-rule bg-paper overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-rule">
        <div className="w-9 h-9 rounded-full bg-paper-muted animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-1/3 bg-paper-muted animate-pulse rounded-sm" />
          <div className="h-2.5 w-1/2 bg-paper-muted animate-pulse rounded-sm" />
        </div>
      </div>
      <div className="px-4 pt-4 space-y-2">
        <div className="h-4 w-3/4 bg-paper-muted animate-pulse rounded-sm" />
        <div className="h-3 w-1/4 bg-paper-muted animate-pulse rounded-sm" />
      </div>
      <div className="mt-4 aspect-[4/3] sm:aspect-video bg-paper-muted animate-pulse" />
      <div className="px-4 py-3 mt-3 border-t border-rule flex justify-between">
        <div className="h-3 w-24 bg-paper-muted animate-pulse rounded-sm" />
        <div className="h-3 w-16 bg-paper-muted animate-pulse rounded-sm" />
      </div>
    </li>
  );
}

function SparkleIcon() {
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
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M6 6l2.5 2.5" />
      <path d="M15.5 15.5 18 18" />
      <path d="M6 18l2.5-2.5" />
      <path d="M15.5 8.5 18 6" />
    </svg>
  );
}
