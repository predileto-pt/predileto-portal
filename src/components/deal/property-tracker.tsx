"use client";

import { useEffect, useRef } from "react";
import { tracking } from "@/lib/tracking";

interface PropertyTrackerProps {
  propertyId: string;
}

export function PropertyTracker({ propertyId }: PropertyTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    tracking.trackPropertyView(propertyId);

    return () => {
      tracking.trackPropertyLeave();
      trackedRef.current = false;
    };
  }, [propertyId]);

  return null;
}
