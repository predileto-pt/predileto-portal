"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { formatPrice } from "@/lib/utils";
import type { Property } from "@/lib/types";
import { Small } from "@/components/ui/small";

interface FeaturedCarouselProps {
  properties: Property[];
  locale: string;
  heading: string;
}

export function FeaturedCarousel({
  properties,
  locale,
  heading,
}: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = properties.length;

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(advance, 5000);
    return () => clearInterval(id);
  }, [paused, count, advance]);

  if (count === 0) return null;

  const property = properties[index];
  const image = property.images[0];
  const location = [property.address.municipality, property.address.district]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="mb-6 border border-gray-200 bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h2 className="text-xs text-gray-400 uppercase px-4 pt-3 pb-2">
        {heading}
      </h2>
      <div className="relative h-48 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={image.url}
                alt={image.alt || property.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="text-sm font-bold leading-tight truncate">
                {property.title}
              </p>
              <Small className="opacity-80 text-white">{location}</Small>
              <p className="text-sm font-bold mt-1">
                {property.price > 0
                  ? formatPrice(property.price, locale)
                  : "-"}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {count > 1 && (
        <div className="flex justify-center gap-1.5 py-2">
          {properties.map((_, i) => (
            <button
              key={properties[i].id}
              type="button"
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === index ? "bg-gray-600" : "bg-gray-300"
              }`}
              aria-label={`Go to property ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
