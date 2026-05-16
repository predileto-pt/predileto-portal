"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDictionary } from "@/components/dictionary-provider";
import {
  getConsent,
  setConsent,
  subscribeConsent,
} from "@/lib/cookie-consent";

export function CookieConsentModal() {
  const dict = useDictionary();
  const c = dict.cookieConsent;

  // Mount marker — needed because consent is read from `document.cookie`
  // and we must not render the banner during SSR (would flash for users
  // who've already decided).
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVisible(getConsent() === "undecided");
    return subscribeConsent((next) => setVisible(next === "undecided"));
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={c.title}
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl border border-rule bg-paper shadow-lg p-4 sm:p-5">
        <h2 className="text-sm font-heading font-bold text-ink mb-1.5">
          {c.title}
        </h2>
        <p className="text-xs sm:text-[13px] text-ink-secondary leading-relaxed mb-3">
          {c.body}{" "}
          <Link
            href="/politica-privacidade"
            className="underline underline-offset-2 hover:text-ink"
          >
            {c.learnMore}
          </Link>
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setConsent("declined")}
            className="text-xs font-heading font-semibold px-4 py-2 border border-rule hover:bg-paper-muted transition-colors"
          >
            {c.decline}
          </button>
          <button
            type="button"
            onClick={() => setConsent("accepted")}
            className="text-xs font-heading font-semibold px-4 py-2 bg-ink text-white hover:bg-ink-secondary transition-colors"
          >
            {c.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
