"use client";

import { useState } from "react";
import { useDictionary } from "@/components/dictionary-provider";

export function PrototypeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const dict = useDictionary();

  if (dismissed) return null;

  return (
    <div className="hidden md:block relative h-10 w-full overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #1e3a5f 60%, #0f172a 100%)",
        }}
      />
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <span className="text-xs font-medium font-mono leading-snug tracking-wide uppercase whitespace-nowrap overflow-hidden text-ellipsis">
          {dict.banner.prototype}
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 text-white hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
