"use client";

import { useEffect, useRef } from "react";
import { tracking } from "@/lib/tracking";

interface SectionTrackerProps {
  propertyId: string;
  section: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionTracker({
  propertyId,
  section,
  children,
  className,
}: SectionTrackerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !trackedRef.current) {
          trackedRef.current = true;
          tracking.trackSectionViewed(propertyId, section);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [propertyId, section]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
