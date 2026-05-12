"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MediaTypeBadges } from "@/components/media-type-badges";

export type ResultMediaItem =
  | { type: "image"; url: string; alt?: string }
  | {
      type: "video";
      url: string;
      thumbnail?: string;
      alt?: string;
      aiGenerated?: boolean;
    };

const FALLBACK_MEDIA: ResultMediaItem[] = [
  { type: "image", url: "/mock-listings/placeholder-1.svg", alt: "" },
  { type: "image", url: "/mock-listings/placeholder-2.svg", alt: "" },
  { type: "image", url: "/mock-listings/placeholder-3.svg", alt: "" },
];

interface ResultMediaCarouselProps {
  media: ResultMediaItem[];
  altFallback: string;
  prevLabel: string;
  nextLabel: string;
}

export function ResultMediaCarousel({
  media,
  altFallback,
  prevLabel,
  nextLabel,
}: ResultMediaCarouselProps) {
  const slides: ResultMediaItem[] = media.length === 0 ? FALLBACK_MEDIA : media;
  const showControls = slides.length >= 2;

  const counts = useMemo(() => {
    const c = { image: 0, video: 0, panorama: 0, ai: 0 };
    for (const m of slides) {
      c[m.type] += 1;
      if (m.type === "video" && m.aiGenerated) c.ai += 1;
    }
    return c;
  }, [slides]);

  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (next: number) => {
      const wrapped = (next + slides.length) % slides.length;
      setIndex(wrapped);
    },
    [slides.length],
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.clientWidth;
    track.scrollTo({ left: slideWidth * index, behavior: "smooth" });
  }, [index]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  }

  return (
    <div
      className="relative bg-paper-muted overflow-hidden select-none"
      role={showControls ? "region" : undefined}
      aria-roledescription={showControls ? "carousel" : undefined}
    >
      <div
        ref={trackRef}
        className="flex aspect-[4/3] sm:aspect-video overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((m, i) => (
          <Slide
            key={`${m.url}-${i}`}
            media={m}
            altFallback={altFallback}
            eager={i === 0}
          />
        ))}
      </div>

      <MediaTypeBadges
        counts={counts}
        ariaLabel="Tipos de média"
        className="absolute top-2 left-2"
      />


      {showControls && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label={prevLabel}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2",
              "w-8 h-8 rounded-full bg-paper/90 text-ink shadow-sm",
              "flex items-center justify-center cursor-pointer",
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity",
            )}
          >
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={nextLabel}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "w-8 h-8 rounded-full bg-paper/90 text-ink shadow-sm",
              "flex items-center justify-center cursor-pointer",
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity",
            )}
          >
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
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}/${slides.length}`}
                className={cn(
                  "h-1.5 rounded-full transition-all cursor-pointer",
                  i === index
                    ? "w-5 bg-paper"
                    : "w-1.5 bg-paper/60 hover:bg-paper/80",
                )}
              />
            ))}
          </div>

          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-black/55 text-white rounded">
            {index + 1} / {slides.length}
          </span>
        </>
      )}
    </div>
  );
}

function Slide({
  media,
  altFallback,
  eager,
}: {
  media: ResultMediaItem;
  altFallback: string;
  eager: boolean;
}) {
  if (media.type === "video") {
    const thumb = media.thumbnail ?? "/mock-listings/placeholder-1.svg";
    return (
      <div className="relative shrink-0 w-full h-full snap-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt={media.alt || altFallback}
          className="w-full h-full object-cover"
          loading={eager ? "eager" : "lazy"}
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-14 h-14 rounded-full bg-white/95 text-ink shadow-md flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 ml-0.5"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      alt={media.alt || altFallback}
      className="shrink-0 w-full h-full object-cover snap-center"
      loading={eager ? "eager" : "lazy"}
      draggable={false}
    />
  );
}

