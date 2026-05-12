"use client";

import { useMemo, useState } from "react";
import {
  MediaTypeBadges,
  type MediaCounts,
} from "@/components/media-type-badges";

export type DetailMediaItem =
  | { type: "image"; url: string; alt: string }
  | {
      type: "video";
      url: string;
      thumbnail?: string;
      alt: string;
      aiGenerated?: boolean;
    };

interface ImageCarouselProps {
  media: DetailMediaItem[];
}

export function ImageCarousel({ media }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  const counts = useMemo<MediaCounts>(() => {
    const c: MediaCounts = { image: 0, video: 0, panorama: 0, ai: 0 };
    for (const m of media) {
      c[m.type] += 1;
      if (m.type === "video" && m.aiGenerated) c.ai += 1;
    }
    return c;
  }, [media]);

  if (media.length === 0) return null;

  const active = media[current];

  return (
    <div>
      {/* Main slide */}
      <div className="relative overflow-hidden bg-gray-100 aspect-[16/10]">
        {active.type === "video" ? (
          <VideoSlide media={active} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.url}
            alt={active.alt}
            className="w-full h-full object-cover"
          />
        )}

        {/* Top-left: media-type badges */}
        <MediaTypeBadges
          counts={counts}
          ariaLabel="Tipos de média"
          className="absolute top-3 left-3"
        />

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrent((c) => (c - 1 + media.length) % media.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % media.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Counter */}
        <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
          {current + 1} / {media.length}
        </span>
      </div>
    </div>
  );
}

function VideoSlide({
  media,
}: {
  media: Extract<DetailMediaItem, { type: "video" }>;
}) {
  const thumb = media.thumbnail ?? "/mock-listings/placeholder-1.svg";
  return (
    <div className="relative w-full h-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt={media.alt}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="w-16 h-16 rounded-full bg-white/95 text-ink shadow-md flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-7 h-7 ml-0.5"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    </div>
  );
}
