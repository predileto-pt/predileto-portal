"use client";

import { useState } from "react";
import Image from "next/image";

interface ScreenshotCarouselProps {
  images: string[];
}

export function ScreenshotCarousel({ images }: ScreenshotCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden border border-gray-200 bg-gray-50">
        <Image
          src={images[current]}
          alt={`Screenshot ${current + 1}`}
          width={1280}
          height={800}
          className="w-full h-auto"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 border border-gray-200 p-2 hover:bg-white transition-colors"
            aria-label="Previous screenshot"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 border border-gray-200 p-2 hover:bg-white transition-colors"
            aria-label="Next screenshot"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === current ? "bg-gray-800" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to screenshot ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
