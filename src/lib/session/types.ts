/**
 * Wire-format types (what the BE returns and the FE Zod-parses).
 * Snake_case is faithful to the BE contract. The store transforms
 * these to camelCase before exposing the snapshot to hooks/components.
 *
 * See `.claude/specs/active/user-session-anonymous.md` and
 * `../estate-os-service/.claude/specs/active/2026-05-portal-session-backend.md`.
 */

export type Kind = "ANONYMOUS" | "AUTHENTICATED";

export type Capability =
  | "SAVE_FAVORITE"
  | "VIEW_HISTORY"
  | "SET_PREFERENCES"
  | "COMMENT"
  | "CONTACT_AGENT"
  | "SAVE_PROPERTY";

/** Wire-format SessionView (snake_case, matches BE response). */
export interface SessionView {
  kind: Kind;
  user_id: string | null;
  capabilities: Capability[];
  prefs: Record<string, unknown>;
  favorites: string[];
  limits?: {
    favorites_max: number;
    prefs_max_bytes: number;
  };
}

/** Camel-cased projection exposed to React. */
export interface SessionSnapshot {
  kind: Kind;
  userId: string | null;
  capabilities: ReadonlyArray<Capability>;
  prefs: Record<string, unknown>;
  favorites: ReadonlySet<string>;
  limits: {
    favoritesMax: number;
    prefsMaxBytes: number;
  };
  hydrated: boolean;
}

/** Patch shape for `PATCH /api/v1/session/me`. */
export interface SessionPatch {
  favorites?: { add?: string[]; remove?: string[] };
  prefs?: { merge?: Record<string, unknown> };
}

/** Fallback limits when BE doesn't surface `SessionView.limits`. */
export const DEFAULT_LIMITS = {
  favoritesMax: 500,
  prefsMaxBytes: 8192,
} as const;

/** Storage keys (versioned). */
export const CACHE_KEY = "predileto:user-cache:v1";

/** Same-tab change event name. */
export const CHANGE_EVENT = "predileto:session-change";

/** Error codes the FE recognises from the BE 4xx body. */
export type ErrorCode =
  | "SESSION_MISSING"
  | "SESSION_INVALID"
  | "INVALID_FAVORITE_ID"
  | "FAVORITE_LIMIT_EXCEEDED"
  | "PREFS_TOO_LARGE"
  | "SESSION_BOUND_TO_OTHER_USER"
  | "PORTAL_AUTH_TOKEN_INVALID";

/** Empty anonymous snapshot used for SSR + first paint. */
export function emptySnapshot(): SessionSnapshot {
  return {
    kind: "ANONYMOUS",
    userId: null,
    capabilities: [],
    prefs: {},
    favorites: new Set<string>(),
    limits: {
      favoritesMax: DEFAULT_LIMITS.favoritesMax,
      prefsMaxBytes: DEFAULT_LIMITS.prefsMaxBytes,
    },
    hydrated: false,
  };
}

/** Wire → snapshot projection. The store calls this on every BE response. */
export function viewToSnapshot(
  view: SessionView,
  hydrated: boolean,
): SessionSnapshot {
  return {
    kind: view.kind,
    userId: view.user_id,
    capabilities: view.capabilities,
    prefs: view.prefs,
    favorites: new Set(view.favorites),
    limits: {
      favoritesMax:
        view.limits?.favorites_max ?? DEFAULT_LIMITS.favoritesMax,
      prefsMaxBytes:
        view.limits?.prefs_max_bytes ?? DEFAULT_LIMITS.prefsMaxBytes,
    },
    hydrated,
  };
}
