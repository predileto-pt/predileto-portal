import {
  CHANGE_EVENT,
  emptySnapshot,
  viewToSnapshot,
  type SessionPatch,
  type SessionSnapshot,
  type SessionView,
} from "./types";
import {
  readCache,
  writeCache,
  subscribeCrossTab,
} from "./cache";
import {
  getSession,
  initSession,
  patchSession,
  SessionRequestError,
} from "./api";
import { shouldReMintOnRead, type SessionApiError } from "./errors";

export type ErrorNotifier = (
  err: SessionApiError,
  action: "read" | "write",
) => void;

export interface SessionStore {
  getSnapshot(): SessionSnapshot;
  getServerSnapshot(): SessionSnapshot;
  subscribe(cb: () => void): () => void;
  /** First-mount orchestration: cache → /me → (recovery → /init). */
  bootstrap(): Promise<void>;
  /**
   * Optimistic write. `derive(prev)` projects the next snapshot client-side;
   * the store applies it immediately, then PATCHes the BE. On 200 the BE
   * response replaces the snapshot (canonical). On failure the snapshot is
   * rolled back. On SESSION_INVALID, rollback + re-mint via /init, **no
   * auto-retry of the original PATCH** (spec r5).
   */
  optimisticPatch(
    patch: SessionPatch,
    derive: (prev: SessionSnapshot) => SessionSnapshot,
  ): Promise<void>;
  /** Force a fresh fetch from /me. */
  refresh(): Promise<void>;
  /** Provider injects this so adapters fire toasts without a window event. */
  setErrorNotifier(notifier: ErrorNotifier | null): void;
}

interface CreateOptions {
  /** Skip cross-tab + window subscriptions (used in tests). */
  isolated?: boolean;
}

/** Wire-format projection used for cache writes + rollback. */
function snapshotToView(s: SessionSnapshot): SessionView {
  return {
    kind: s.kind,
    user_id: s.userId,
    capabilities: [...s.capabilities],
    prefs: { ...s.prefs },
    favorites: Array.from(s.favorites),
    limits: {
      favorites_max: s.limits.favoritesMax,
      prefs_max_bytes: s.limits.prefsMaxBytes,
    },
  };
}

export function createSessionStore(opts: CreateOptions = {}): SessionStore {
  let snapshot: SessionSnapshot = emptySnapshot();
  const listeners = new Set<() => void>();
  let notifier: ErrorNotifier | null = null;
  let recoveryInFlight = false;

  function notify(): void {
    for (const cb of listeners) cb();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
  }

  function set(next: SessionSnapshot, options?: { writeThrough?: boolean }): void {
    snapshot = next;
    if (options?.writeThrough !== false) writeCache(snapshotToView(next));
    notify();
  }

  function fail(err: SessionApiError, action: "read" | "write"): void {
    if (notifier) notifier(err, action);
  }

  function reconcileFromCache(): void {
    if (typeof window === "undefined") return;
    const cached = readCache();
    if (cached) {
      snapshot = viewToSnapshot(cached, /*hydrated*/ false);
    }
  }

  function adoptView(view: SessionView): void {
    snapshot = viewToSnapshot(view, /*hydrated*/ true);
    writeCache(view);
    notify();
  }

  async function reMintAndAdopt(): Promise<void> {
    if (recoveryInFlight) return;
    recoveryInFlight = true;
    snapshot = { ...snapshot, hydrated: false };
    notify();
    try {
      const minted = await initSession();
      adoptView(minted);
    } catch (err) {
      const apiErr =
        err instanceof SessionRequestError
          ? err.error
          : ({
              kind: "transport",
              status: 0,
              message: "init failed",
            } as SessionApiError);
      snapshot = { ...emptySnapshot(), hydrated: false };
      notify();
      fail(apiErr, "read");
    } finally {
      recoveryInFlight = false;
    }
  }

  async function bootstrap(): Promise<void> {
    reconcileFromCache();
    notify();
    try {
      const view = await getSession();
      adoptView(view);
    } catch (err) {
      if (err instanceof SessionRequestError && shouldReMintOnRead(err.error)) {
        await reMintAndAdopt();
        return;
      }
      const apiErr =
        err instanceof SessionRequestError
          ? err.error
          : ({
              kind: "transport",
              status: 0,
              message: "bootstrap failed",
            } as SessionApiError);
      snapshot = { ...snapshot, hydrated: false };
      notify();
      fail(apiErr, "read");
    }
  }

  async function refresh(): Promise<void> {
    try {
      const view = await getSession();
      adoptView(view);
    } catch (err) {
      if (err instanceof SessionRequestError && shouldReMintOnRead(err.error)) {
        await reMintAndAdopt();
      }
    }
  }

  async function optimisticPatch(
    patch: SessionPatch,
    derive: (prev: SessionSnapshot) => SessionSnapshot,
  ): Promise<void> {
    const previous = snapshot;
    const projected = derive(previous);
    set(projected);
    try {
      const view = await patchSession(patch);
      adoptView(view);
    } catch (err) {
      // Rollback first.
      set(previous);
      if (err instanceof SessionRequestError) {
        if (err.error.kind === "invalid") {
          // SESSION_INVALID on write: rollback + re-mint + toast, NO retry.
          fail(err.error, "write");
          await reMintAndAdopt();
          return;
        }
        fail(err.error, "write");
        return;
      }
      fail(
        { kind: "transport", status: 0, message: "patch failed" },
        "write",
      );
    }
  }

  // Cross-tab sync.
  if (!opts.isolated && typeof window !== "undefined") {
    subscribeCrossTab(() => {
      const cached = readCache();
      if (cached) {
        snapshot = viewToSnapshot(cached, /*hydrated*/ true);
        for (const cb of listeners) cb();
      }
    });
  }

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => emptySnapshot(),
    subscribe(cb) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    bootstrap,
    optimisticPatch,
    refresh,
    setErrorNotifier(n) {
      notifier = n;
    },
  };
}
