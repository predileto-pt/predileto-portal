"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useSessionStore } from "@/components/session/user-session-provider";
import type { SessionSnapshot } from "@/lib/session/types";

export interface UsePreferences {
  value: Record<string, unknown>;
  /**
   * Deep-merge optimistic write. Rejects locally (no network call) if the
   * resulting serialized payload would exceed `limits.prefsMaxBytes`.
   */
  merge: (patch: Record<string, unknown>) => Promise<void>;
}

export function usePreferences(): UsePreferences {
  const store = useSessionStore();
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const merge = useCallback(
    async (patch: Record<string, unknown>) => {
      const merged = deepMerge(snapshot.prefs, patch);
      const bytes = byteLength(JSON.stringify(merged));
      if (bytes > snapshot.limits.prefsMaxBytes) return;
      await store.optimisticPatch(
        { prefs: { merge: patch } },
        (prev) => withPrefsMerged(prev, patch),
      );
    },
    [store, snapshot.prefs, snapshot.limits.prefsMaxBytes],
  );

  return {
    value: snapshot.prefs,
    merge,
  };
}

function byteLength(s: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(s).length;
  }
  // Conservative fallback: 1 char = 1 byte (UTF-8 underestimate for non-ASCII).
  return s.length;
}

function deepMerge(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const existing = out[key];
    if (isPlainObject(existing) && isPlainObject(value)) {
      out[key] = deepMerge(existing, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function withPrefsMerged(
  prev: SessionSnapshot,
  patch: Record<string, unknown>,
): SessionSnapshot {
  return { ...prev, prefs: deepMerge(prev.prefs, patch) };
}
