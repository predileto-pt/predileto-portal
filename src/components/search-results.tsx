"use client";

import { useState } from "react";
import { cn, formatPrice, formatArea } from "@/lib/utils";
import { Small } from "@/components/ui/small";
import { Title } from "@/components/ui/title";
import { CommentsList, type CommentData } from "@/components/comments-list";

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
  imageUrl?: string;
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

  const commentCount = item.comments?.length ?? 0;

  return (
    <li className="border border-rule bg-paper">
      <div className="flex gap-3 h-[216px] overflow-hidden">
        <div className="w-72 shrink-0 bg-paper-muted">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
        <div className="flex-1 min-w-0 py-2 pr-3 flex flex-col overflow-hidden">
          <div className="space-y-1 flex-1 min-h-0 overflow-hidden">
            <p className="text-sm font-heading font-bold truncate landing-gradient-text">
              {item.title}
            </p>
            <p className="text-lg font-bold text-ink">
              {formatPrice(item.price, locale)}
              {item.listingType === "rent" && (
                <span className="text-xs font-normal text-ink-muted">/mês</span>
              )}
            </p>
            <p className="text-sm text-ink-subtle leading-body line-clamp-2 overflow-hidden">
              {item.description}
            </p>
            <div className="flex gap-3 text-xs text-ink-subtle">
              {item.bedrooms > 0 && <span>T{item.bedrooms}</span>}
              {item.areaSqm > 0 && <span>{formatArea(item.areaSqm)}</span>}
            </div>
          </div>

          {item.aiAttributes && item.aiAttributes.length > 0 && (
            <AiAttributesSection attributes={item.aiAttributes} />
          )}

          <div className="flex gap-1 pt-2 mt-2 border-t border-rule -mr-3 shrink-0">
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
        </div>
      </div>

      {commentsOpen && (
        <div className="border-t border-rule bg-paper">
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
    <li className="border border-rule bg-paper overflow-hidden flex gap-3 h-[216px]">
      <div className="w-72 shrink-0 bg-paper-muted animate-pulse" />
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
