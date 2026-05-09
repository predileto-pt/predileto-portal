"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@/lib/types";

const FALLBACK_IMAGES: PropertyImage[] = [
  { url: "/mock-listings/placeholder-1.svg", alt: "" },
  { url: "/mock-listings/placeholder-2.svg", alt: "" },
  { url: "/mock-listings/placeholder-3.svg", alt: "" },
];

interface PropertyFeedCardCarouselProps {
  images: PropertyImage[];
  altFallback: string;
  prevLabel: string;
  nextLabel: string;
}

export function PropertyFeedCardCarousel({
  images,
  altFallback,
  prevLabel,
  nextLabel,
}: PropertyFeedCardCarouselProps) {
  const slides: PropertyImage[] =
    images.length === 0 ? FALLBACK_IMAGES : images;
  const showControls = slides.length >= 2;

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

  // Sync the scroll position to the active index
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
        {slides.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${img.url}-${i}`}
            src={img.url}
            alt={img.alt || altFallback}
            className="shrink-0 w-full h-full object-cover snap-center"
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
          />
        ))}
      </div>

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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
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
