"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatPriceParts } from "@/lib/utils";
import { Small } from "@/components/ui/small";
import { CommentsList, type CommentData } from "@/components/comments-list";
import {
  ResultMediaCarousel,
  type ResultMediaItem,
} from "@/components/result-media-carousel";
import { useRegisterActiveProperty } from "@/components/active-property-provider";
import { useFavorites } from "@/lib/session/slices/favorites";

export interface AiAttribute {
  key: string;
  label: string;
  value: string;
  icon?: "euro" | "fuel" | "commute" | "noise" | "amenity";
}

export type CharacteristicIcon =
  | "bath"
  | "garage"
  | "energy"
  | "elevator"
  | "balcony"
  | "view"
  | "year"
  | "floor"
  | "area"
  | "heating"
  | "ac"
  | "pool"
  | "garden"
  | "pet"
  | "furnished"
  | "default";

export interface ResultCharacteristic {
  key: string;
  label: string;
  value?: string;
  icon?: CharacteristicIcon;
}

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  price: number;
  /** ISO country name (e.g. "Portugal") — drives currency formatting. */
  country?: string;
  areaSqm: number;
  bedrooms: number;
  /** Building floor (0 = ground floor). */
  floor?: number;
  /** Whether the building has an elevator — drives the "sem/com elevador" hint. */
  hasElevator?: boolean;
  /** @deprecated prefer `media`. Kept as a fallback for single-image entries. */
  imageUrl?: string;
  /** Mixed image / video carousel items. Wins over `imageUrl` when present. */
  media?: ResultMediaItem[];
  listingType: "buy" | "rent";
  /** Drives differentiated agent-chat greetings (land vs built, etc.). */
  propertyType?: "house" | "apartment" | "land" | "ruin";
  aiAttributes?: AiAttribute[];
  /** Property facts and features (bathrooms, garage, energy rating, view, etc). */
  characteristics?: ResultCharacteristic[];
  comments?: CommentData[];
}

interface SearchResultsProps {
  items: SearchResultItem[] | null;
  loading?: boolean;
  locale: string;
  onOpenAgent?: (item: SearchResultItem) => void;
}

export function SearchResults({
  items,
  loading,
  locale,
  onOpenAgent,
}: SearchResultsProps) {
  return (
    <div className="space-y-3">
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
            <ResultCard
              key={item.id}
              item={item}
              locale={locale}
              onOpenAgent={onOpenAgent}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ResultCard({
  item,
  locale,
  onOpenAgent,
}: {
  item: SearchResultItem;
  locale: string;
  onOpenAgent?: (item: SearchResultItem) => void;
}) {
  const favorites = useFavorites();
  const interested = favorites.isFavorite(item.id);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const registerRef = useRegisterActiveProperty(item.id);

  const commentCount = item.comments?.length ?? 0;
  const detailHref = `/imovel/${item.id}`;
  const media: ResultMediaItem[] =
    item.media && item.media.length > 0
      ? item.media
      : item.imageUrl
        ? [{ type: "image", url: item.imageUrl, alt: item.title }]
        : [];

  return (
    <li
      ref={registerRef}
      data-property-id={item.id}
      className="group border border-rule bg-paper transition-shadow hover:shadow-md"
    >
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

      {/* Hero carousel */}
      <div>
        <ResultMediaCarousel
          media={media}
          altFallback={item.title}
          prevLabel="Anterior"
          nextLabel="Seguinte"
        />
      </div>

      {/* Title + price */}
      <div className="px-4 pt-4">
        <h3 className="font-heading text-base font-medium leading-snug">
          <Link
            href={detailHref}
            className="text-blue-600 hover:underline underline-offset-2 decoration-1"
          >
            {item.title}
          </Link>
        </h3>
        <p className="mt-1.5 font-heading text-3xl font-extrabold tracking-heading text-ink">
          {(() => {
            const { value, currency } = formatPriceParts(
              item.price,
              locale,
              item.country,
            );
            return (
              <>
                {value}
                <span className="ml-1 text-xl font-normal text-ink">
                  {currency}
                </span>
              </>
            );
          })()}
          {item.listingType === "rent" && (
            <span className="text-sm font-normal text-ink-muted">/mês</span>
          )}
        </p>

        <ResultCharRow item={item} />
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
              "text-base text-ink leading-relaxed",
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

      {/* Characteristics */}
      {item.characteristics && item.characteristics.length > 0 && (
        <div className="px-4 pt-3">
          <CharacteristicsList items={item.characteristics} />
        </div>
      )}

      {/* Action row */}
      <footer className="flex items-center justify-between gap-2 px-4 py-3 mt-3 border-t border-rule">
        <div className="flex flex-wrap gap-1">
          <CardActionButton
            active={interested}
            onClick={() => void favorites.toggle(item.id)}
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
          {onOpenAgent && (
            <CardActionButton
              onClick={() => onOpenAgent(item)}
              icon={<AgentIcon />}
              label="Falar com agente"
            />
          )}
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

function AgentIcon() {
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
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
      <path d="M19 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
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

function CharacteristicsList({ items }: { items: ResultCharacteristic[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {items.map((c) => (
        <li
          key={c.key}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-paper-muted text-ink-secondary border border-rule rounded-full whitespace-nowrap"
        >
          <CharacteristicIconSvg name={c.icon ?? "default"} />
          <span>
            <span className="font-medium text-ink">{c.label}</span>
            {c.value ? (
              <span className="text-ink-muted">: {c.value}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CharacteristicIconSvg({ name }: { name: CharacteristicIcon }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "w-3.5 h-3.5 shrink-0 text-ink-secondary",
    "aria-hidden": true,
  };
  switch (name) {
    case "bath":
      return (
        <svg {...props}>
          <path d="M2 12h20" />
          <path d="M5 12V6a3 3 0 0 1 6 0" />
          <path d="M4 12v3a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-3" />
        </svg>
      );
    case "garage":
      return (
        <svg {...props}>
          <path d="M3 21V8l9-5 9 5v13" />
          <path d="M3 13h18" />
          <path d="M7 21v-4h10v4" />
        </svg>
      );
    case "energy":
      return (
        <svg {...props}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "elevator":
      return (
        <svg {...props}>
          <rect x="6" y="3" width="12" height="18" rx="1" />
          <polyline points="9 8 12 5 15 8" />
          <polyline points="9 16 12 19 15 16" />
        </svg>
      );
    case "balcony":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="9" rx="1" />
          <path d="M3 21h18" />
          <path d="M7 12v9" />
          <path d="M17 12v9" />
          <path d="M12 12v9" />
        </svg>
      );
    case "view":
      return (
        <svg {...props}>
          <path d="M3 18h18" />
          <path d="M3 14l4-4 3 3 5-6 6 7" />
          <circle cx="17" cy="6" r="2" />
        </svg>
      );
    case "year":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
        </svg>
      );
    case "floor":
      return (
        <svg {...props}>
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M4 9h16" />
          <path d="M4 15h16" />
          <path d="M9 21V3" />
        </svg>
      );
    case "area":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="1" />
          <path d="M3 8h6" />
          <path d="M16 21v-6" />
        </svg>
      );
    case "heating":
      return (
        <svg {...props}>
          <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-4 4-8 4-8z" />
          <path d="M12 22a4 4 0 0 1-4-4" />
        </svg>
      );
    case "ac":
      return (
        <svg {...props}>
          <path d="M12 3v18" />
          <path d="M3 12h18" />
          <path d="m6 6 12 12" />
          <path d="m18 6-12 12" />
        </svg>
      );
    case "pool":
      return (
        <svg {...props}>
          <path d="M2 12c2 2 4 2 6 0s4-2 6 0 4 2 6 0" />
          <path d="M2 17c2 2 4 2 6 0s4-2 6 0 4 2 6 0" />
        </svg>
      );
    case "garden":
      return (
        <svg {...props}>
          <path d="M12 22V12" />
          <path d="M12 12c0-3 2-6 6-6 0 4-2 7-6 7" />
          <path d="M12 12c0-3-2-6-6-6 0 4 2 7 6 7" />
        </svg>
      );
    case "pet":
      return (
        <svg {...props}>
          <circle cx="11" cy="4" r="2" />
          <circle cx="18" cy="8" r="2" />
          <circle cx="20" cy="16" r="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="M11 14c-2 0-4 1-4 4 0 1 1 2 2 2 1 0 2-1 3-1s2 1 3 1c1 0 2-1 2-2 0-3-2-4-6-4z" />
        </svg>
      );
    case "furnished":
      return (
        <svg {...props}>
          <path d="M3 18v-5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5" />
          <path d="M3 18h18" />
          <path d="M5 21v-3" />
          <path d="M19 21v-3" />
        </svg>
      );
    case "default":
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      );
  }
}

/**
 * Inline characteristics row shown directly below the price — idealista
 * style. Each fact is its own <span>; missing data is skipped silently so
 * cards never show empty separators or "—" placeholders.
 */
function ResultCharRow({ item }: { item: SearchResultItem }) {
  const facts: { key: string; text: string }[] = [];

  if (item.bedrooms > 0) {
    facts.push({ key: "bedrooms", text: `T${item.bedrooms}` });
  }
  if (item.areaSqm > 0) {
    facts.push({ key: "area", text: `${item.areaSqm} m² área bruta` });
  }
  if (item.floor !== undefined) {
    const floorLabel =
      item.floor === 0 ? "Rés-do-chão" : `${item.floor}º andar`;
    const elevatorHint =
      item.hasElevator === false
        ? " sem elevador"
        : item.hasElevator
          ? " com elevador"
          : "";
    facts.push({ key: "floor", text: `${floorLabel}${elevatorHint}` });
  }

  if (facts.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-secondary">
      {facts.map((f) => (
        <span
          key={f.key}
          className={cn(f.key === "bedrooms" && "font-medium text-ink")}
        >
          {f.text}
        </span>
      ))}
    </div>
  );
}
