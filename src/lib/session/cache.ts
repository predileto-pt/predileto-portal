import { CACHE_KEY, type SessionView } from "./types";
import { safeParseSessionView } from "./schema";

/**
 * localStorage-backed cache for the wire-format SessionView. Provides
 * optimistic reads on app mount before /session/me resolves, and a sync
 * surface for cross-tab subscribers via the native `storage` event.
 *
 * All operations are SSR-safe: `window` is feature-detected.
 * Corrupted payloads (invalid JSON or shape-mismatch) are cleared on read
 * and a single warning is emitted via the supplied logger.
 */

export interface CacheLogger {
  warn(event: string, detail?: unknown): void;
}

const defaultLogger: CacheLogger = {
  warn(event, detail) {
    if (typeof console !== "undefined") {
      console.warn(`[session] ${event}`, detail ?? "");
    }
  },
};

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Read the cached SessionView. Returns `null` if absent or corrupted. */
export function readCache(logger: CacheLogger = defaultLogger): SessionView | null {
  const storage = getStorage();
  if (!storage) return null;
  let raw: string | null;
  try {
    raw = storage.getItem(CACHE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    logger.warn("session_cache_invalid", { reason: "json_parse" });
    clearCache();
    return null;
  }
  const view = safeParseSessionView(parsed);
  if (!view) {
    logger.warn("session_cache_invalid", { reason: "schema_mismatch" });
    clearCache();
    return null;
  }
  return view;
}

/** Write the SessionView. Fails silently on quota / private-mode errors. */
export function writeCache(view: SessionView): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(CACHE_KEY, JSON.stringify(view));
  } catch {
    // quota / private mode / disabled — fail silent
  }
}

/** Clear the cache (e.g. on schema mismatch or logout). */
export function clearCache(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Subscribe to cross-tab changes on the cache key. Returns an unsubscribe fn.
 * No-op on the server.
 */
export function subscribeCrossTab(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === CACHE_KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
