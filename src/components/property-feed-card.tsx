"use client";

import { useState } from "react";
import Link from "next/link";
import { type Property, isEasyBook } from "@/lib/types";
import { formatPrice, formatArea, formatDate } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";
import { PropertyFeedCardCarousel } from "@/components/property-feed-card-carousel";
import { Badge } from "@/components/ui/badge";

interface PropertyFeedCardProps {
  property: Property;
  locale: string;
}

export function PropertyFeedCard({ property, locale }: PropertyFeedCardProps) {
  const dict = useDictionary();
  const propertyTypesDict = dict.propertyTypes as Record<string, string>;
  const cardDict = (dict as unknown as Record<string, Record<string, string>>)
    .feedCard;
  const detailHref = `/${locale}/imovel/${property.id}`;

  const sourceName = property.sources?.[0]?.name ?? "";
  const initials = sourceName
    ? sourceName
        .split(/\s+/)
        .map((p) => p[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "P";

  const locationParts = [
    property.address.parish,
    property.address.municipality,
    property.address.district,
  ].filter(Boolean);

  return (
    <article className="group bg-paper border border-rule transition-shadow hover:shadow-md">
      {/* Header strip */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-rule">
        <div
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-heading font-bold text-xs"
          style={{
            background:
              "linear-gradient(135deg, hsl(172 66% 50%), hsl(38 92% 50%))",
          }}
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate">
            {sourceName || cardDict?.unknownSource || "Imobiliária"}
          </p>
          <p className="text-xs text-ink-muted truncate">
            {formatDate(property.updatedAt, locale)}
            {locationParts.length > 0 && ` · ${locationParts[0]}`}
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded">
          {property.listingType === "buy"
            ? cardDict?.chipBuy ?? "Comprar"
            : cardDict?.chipRent ?? "Arrendar"}
        </span>
        {isEasyBook(property) && (
          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5">
            <svg className="size-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                clipRule="evenodd"
              />
            </svg>
            Easy Book
          </span>
        )}
      </header>

      {/* Title + price */}
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-heading text-base font-bold leading-snug">
            <Link
              href={detailHref}
              className="hover:underline underline-offset-2 decoration-1"
            >
              {property.title}
            </Link>
          </h3>
          <p className="shrink-0 font-heading text-lg font-extrabold tracking-heading text-primary">
            {property.price > 0
              ? formatPrice(property.price, locale)
              : "—"}
          </p>
        </div>

        {/* Meta row */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-secondary">
          {property.features.bedrooms > 0 && (
            <span className="font-medium">
              T{property.features.bedrooms}
            </span>
          )}
          {property.features.areaSqm > 0 && (
            <span>{formatArea(property.features.areaSqm)}</span>
          )}
          {property.features.bathrooms > 0 && (
            <span>
              {property.features.bathrooms} {cardDict?.bathShort ?? "WC"}
            </span>
          )}
          {locationParts.length > 0 && (
            <span className="text-ink-muted truncate">
              · {locationParts.slice(0, 2).join(", ")}
            </span>
          )}
          <Badge>
            {propertyTypesDict[property.propertyType] ||
              property.propertyType}
          </Badge>
        </div>
      </div>

      {/* Hero carousel */}
      <Link
        href={detailHref}
        className="block mt-4"
        aria-label={cardDict?.openDetail ?? "Ver detalhe"}
      >
        <PropertyFeedCardCarousel
          images={property.images ?? []}
          altFallback={property.title}
          prevLabel={cardDict?.prev ?? "Anterior"}
          nextLabel={cardDict?.next ?? "Seguinte"}
        />
      </Link>

      {/* Description excerpt */}
      <Description
        text={property.shortDescription}
        readMore={cardDict?.readMore ?? "Ler mais"}
        readLess={cardDict?.readLess ?? "Ler menos"}
      />

      {/* Action row */}
      <footer className="flex items-center justify-between px-4 py-3 border-t border-rule">
        <span className="text-xs text-ink-muted truncate">
          {sourceName || ""}
        </span>
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1 text-sm font-bold font-heading text-primary hover:opacity-80 transition-opacity"
        >
          {cardDict?.openDetail ?? "Ver detalhe"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </footer>
    </article>
  );
}

function Description({
  text,
  readMore,
  readLess,
}: {
  text: string;
  readMore: string;
  readLess: string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  return (
    <div className="px-4 pt-3">
      <p
        className={
          expanded
            ? "text-sm text-ink leading-relaxed"
            : "text-sm text-ink leading-relaxed line-clamp-3"
        }
      >
        {text}
      </p>
      {text.length > 120 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline cursor-pointer"
        >
          {expanded ? readLess : readMore}
        </button>
      )}
    </div>
  );
}
