"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  getConsent,
  subscribeConsent,
  type ConsentValue,
} from "@/lib/cookie-consent";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Consent gates initialization: PostHog only boots when the user has
  // explicitly accepted analytics cookies. Declined or undecided users
  // get no analytics traffic. We track init separately because a user
  // who accepts later still needs to trigger a one-time init.
  const [consent, setConsentState] = useState<ConsentValue>("undecided");
  const initedRef = useRef(false);

  useEffect(() => {
    setConsentState(getConsent());
    return subscribeConsent((next) => setConsentState(next));
  }, []);

  useEffect(() => {
    if (consent === "accepted") {
      if (initedRef.current) return;
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      if (!key) return;
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
        capture_pageleave: false,
      });
      initedRef.current = true;
      return;
    }
    // User declined (or revoked) within this session — opt out of any
    // further capture and drop the identity. posthog-js no-ops the call
    // if init never ran, so this is safe in the undecided case too.
    if (initedRef.current) {
      posthog.opt_out_capturing();
      posthog.reset();
    }
  }, [consent]);

  return (
    <PHProvider client={posthog}>
      <Suspense>
        <PostHogPageView enabled={consent === "accepted"} />
      </Suspense>
      {children}
    </PHProvider>
  );
}

function PostHogPageView({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastCaptured = useRef("");

  useEffect(() => {
    if (!enabled) return;
    if (!pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (url === lastCaptured.current) return;
    lastCaptured.current = url;
    posthog.capture("$pageview", { $current_url: window.origin + url });
  }, [enabled, pathname, searchParams]);

  return null;
}
