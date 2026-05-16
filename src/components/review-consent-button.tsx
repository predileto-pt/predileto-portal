"use client";

import { CONSENT_COOKIE } from "@/lib/cookie-consent";

export function ReviewConsentButton({ label }: { label: string }) {
  function handleClick() {
    // Clear the consent cookie so the banner re-appears, then reload so
    // PostHogProvider drops the (potentially already-initialized) tracker
    // state and re-evaluates from scratch.
    document.cookie = `${CONSENT_COOKIE}=; path=/; max-age=0`;
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-xs font-heading font-semibold px-4 py-2 border border-rule hover:bg-paper-muted transition-colors"
    >
      {label}
    </button>
  );
}
