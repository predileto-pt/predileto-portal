# ADR-001 — User session and client state

**Status:** accepted
**Date:** 2026-05-11
**Owner:** Peter
**Revised:** 2026-05-11 — initial draft picked client-minted UUIDs; flipped to BE-issued sessions after weighing un-forgeability + auth migration cost.

## Context

The portal has features that need to remember things about the visitor:

- **Search history** — currently a feature-scoped localStorage key (`predileto:search-history:v1`).
- **Property interests** ("Interesse" toggle on the result card) — currently component-local state, lost on every navigation.
- **Comments** on property posts — gated; anonymous users must not be allowed.
- **Preferences** (household composition, age, language) — surfaced soon, will personalise results and agent prompts.
- **Future BE-side concerns** — abuse prevention, rate limiting, lead attribution, eventually authenticated sessions.

There is no authentication today. There will be — likely Supabase or a custom auth — but the timeline is open. Whatever we build now must:

1. Survive page refresh, tab close, cross-tab edits, private mode, quota exhaustion.
2. Carry an **anonymous identity** the BE can trust and that a future authenticated identity can claim/merge against without losing data.
3. Compose feature slices (interests, history, prefs, etc.) under a single shape so we stop sprinkling ad-hoc `localStorage` keys.
4. Gate UI (e.g. `commentEnabled = session.can("comment")`) so anonymous-vs-authenticated isn't a series of `if` ladders in components.
5. Be swappable to a backend persistence layer per-slice later **without touching consumers** — only the adapter changes.

The portal is Next.js App Router with React 19, mostly client components for the search flow. PostHog is already loaded for analytics. The portal already proxies to estate-os-service for property data; adding session-related routes follows the same pattern.

## Decision

The **backend issues and owns the session.** A single `predileto_session` cookie carries a BE-minted, signed session id; the BE keeps a session record (anonymous or authenticated) in a server-side store. The portal exposes a session abstraction to React components that hides the wire format.

Concretely:

### 1. Identity — BE-issued, server-side session

- The BE mints a session id (random, ≥128 bits) and stores `{ session_id → session_record }` in a server-side store.
- The BE sets a single cookie: **`predileto_session`**, `HttpOnly`, `Secure` (TLS-only), `SameSite=Lax`, ~1y max-age, signed with a server key (HMAC) so tampering is detectable.
- Session payload (server-side record):
  ```
  {
    kind: "anonymous" | "authenticated",
    session_id: <uuid>,
    user_id: <uuid | null>,     // null while anonymous; populated on claim
    created_at, last_seen_at,
    capabilities: [...],         // BE-authoritative
    prefs: {...},                // BE-canonical for cross-device slices
    revoked: false
  }
  ```
- **One cookie throughout the lifecycle.** When the user logs in, the *same* cookie keeps working — the session record's `kind` flips from `"anonymous"` to `"authenticated"` and `user_id` is populated. No cookie rotation. (See §6 for the claim flow.)
- **Stateful** (DB-backed, not JWT). Reasons in §"Alternatives".

### 2. Session minting (the "first visit" problem)

The first request from a brand-new visitor has no cookie. The BE must mint one before the FE can do anything that depends on identity. Two acceptable patterns; pick one in the implementation spec:

- **Middleware mint** *(preferred)*: a Next.js root `middleware.ts` checks for `predileto_session` on every request. If absent, calls a BE endpoint (`POST /api/v1/session/init`), receives the cookie, attaches it to the response. The page renders with the session in place — no flash, no extra round-trip on the client side.
- **Lazy mint**: a single client-side bootstrap call on app mount (`POST /api/v1/session/init`). Slight delay until the session is established. Simpler, less BE-dependent for static pages.

Middleware mint is the production answer. Lazy is acceptable for v1 if middleware is too much scaffolding.

### 3. BE session service responsibilities

A new bounded module (location decided in the implementation spec — likely starts in `estate-os-service` and earns its own service when load justifies):

- `POST /api/v1/session/init` — mint a new anonymous session, set the cookie, return the public session view.
- `GET  /api/v1/session/me` — return the public session view for the current cookie (rotates `last_seen_at`, validates signature, refreshes capabilities/prefs).
- `PATCH /api/v1/session/me` — apply slice writes the BE owns (e.g. interest toggle, prefs update). Validates ownership via the cookie.
- `POST /api/v1/session/claim` — exchange an anonymous session + auth token for an authenticated session. Flips the existing session record's `kind`, populates `user_id`, merges anon state into the user record. **The cookie does not change.** See §6.
- `POST /api/v1/session/logout` — flips back to anonymous (`kind="anonymous"`, `user_id=null`), or revokes entirely depending on policy.

Public session view returned to the FE:
```
{
  kind: "anonymous" | "authenticated",
  user_id: <uuid | null>,
  capabilities: [...],
  prefs: {...}
}
```

The `session_id` itself **never leaves the BE** (it stays in the cookie, opaque to JS — `HttpOnly` ensures the client never reads it).

### 4. Client state shape

The portal exposes a `UserSession` abstraction to components:

```ts
type UserSession = {
  kind: "anonymous" | "authenticated";
  userId: string | null;
  can: (cap: Capability) => boolean;
  hydrated: boolean;
};
```

State slices the FE consumes (each backed by an adapter; see §5):

- `interests` — `propertyIds: string[]`. BE-canonical (cross-device). FE writes via `PATCH /session/me`.
- `preferences` — placeholder shape, locked in a follow-up spec. BE-canonical.
- `searchHistory` — *intentionally client-only* (noisy, low value to sync; keep in localStorage so it's available offline and doesn't burden the BE). The slice surface looks identical to consumers; only the adapter differs.

Local cache: the FE may mirror BE-owned slices in `localStorage` (`predileto:user-cache:v1`) to give optimistic reads on app mount before `GET /session/me` returns. Cache is invalidated on every `/session/me` response.

### 5. Adapter port (per-slice flexibility)

Slices are stored via a `StateAdapter<T>` port:

```ts
interface StateAdapter<T> {
  read(): Promise<T> | T;
  write(value: T): Promise<void> | void;
  subscribe(cb: () => void): () => void;
}
```

v1 implementations:
- `BackendAdapter<T>` — wraps the relevant `/session/me` field. Optimistic write via the local cache, persisted via `PATCH /session/me`.
- `LocalStorageAdapter<T>` — for slices that stay client-only (search history, possibly future cache slices).

Adapter selection lives in the store config, not in consumer hooks. Migrating a slice from local to BE is a one-line config change later.

### 6. Capabilities (UI gating)

Capability list lives in the **BE** session record, not the FE. The FE renders what the BE says it can:

```ts
session.can("comment");          // BE returns the list; FE only checks
```

Anonymous capabilities (BE-issued today): `save-interest`, `view-history`, `set-preferences`.
Authenticated capabilities (BE-issued on claim): all of the above plus `comment`, `contact-agent`, `save-property`.

Components prefer `session.can(...)` over `kind === "..."`. A `<RequireCapability cap="comment" fallback={...}>` helper for declarative gates.

### 7. Authenticated flow (`/session/claim`)

When auth lands:

1. FE completes login with the auth provider, obtains an `auth_token`.
2. FE calls `POST /api/v1/session/claim` with the `auth_token` (the existing `predileto_session` cookie is sent automatically).
3. BE validates the auth token, resolves to a `user_id`, mutates the existing session record:
   - `kind: "authenticated"`, `user_id` populated.
   - Merges anon `interests` / `prefs` into the user's profile (union for interests; prefs prefer authenticated values, fall back to anon).
   - Returns the new public session view.
4. FE re-reads `GET /session/me` (or trusts the claim response) and updates its in-memory session.
5. PostHog: `posthog.identify(user_id, { previous_anon_id: session_id })`.

**The cookie is not rotated** — same `predileto_session` cookie, new payload on the BE side. Logout flips the record back to anonymous (`kind="anonymous"`, `user_id=null`) without invalidating the cookie, so search history etc. remains attached to the same anonymous session.

If logout-with-revoke is needed later, the BE can revoke the session and the next request re-mints. Out of scope for v1.

### 8. Reactivity in the FE

- `UserSessionProvider` at the app root:
  - On mount, fetches `GET /api/session/me` (or trusts the middleware-mint response).
  - Subscribes to a `predileto:session-change` window event for same-tab cross-component sync after mutations.
  - For cross-tab sync, the local cache write triggers `storage` events that re-fetch the public session view (cheap, single round-trip).
- `useUserSession()` returns the session object via `useSyncExternalStore`. SSR snapshot is anonymous-empty with `hydrated: false` until the first server response lands.
- Slice hooks (`useInterests`, `useSearchHistory`, `usePreferences`) subscribe to their adapter and expose a read + write API.

## Consequences

**Positive**

- BE-authoritative identity. Cookie tampering doesn't grant anything. Authorization decisions on the BE (rate limiting, abuse prevention, comment gating, lead attribution) all work from day one without retrofit.
- Cross-device continuity is free for BE-owned slices (interests, preferences). Same user on phone + laptop sees the same wishlist.
- Auth migration is a payload flip on an existing record, not a fresh cookie + state migration. Anonymous data is automatically inherited by the logged-in user.
- Capability list is centralized server-side. FE doesn't go stale when a permission shifts.
- The adapter port keeps per-slice flexibility — search history stays client-only without infecting the BE.

**Negative / costs**

- A BE service is required before the portal can run. First-visit middleware-mint (or lazy bootstrap) adds one round-trip the client-minted approach didn't need.
- Server-side session store to operate (Redis or Postgres table). Backup, key rotation, TTL eviction, signing key management — all become standing concerns.
- The portal now hard-depends on the session service being up. We need a tolerant fallback for transient session-service failures: cached client state + degraded mode (no writes) rather than a hard error.
- Every write that mutates BE-owned slices is a network call. Optimistic UI is essential (the local cache layer handles this).

**Risks**

- **Signing key compromise**: rotates invalidate all sessions. Need a key-versioning scheme so rotations are non-disruptive (multiple valid keys during a rollover window). Implementation-spec concern, not ADR.
- **Session record sprawl**: every anonymous visitor creates a row. Expire anonymous sessions after N days of inactivity (suggested 90d). Authenticated sessions can live longer.
- **First-paint delay**: middleware mint adds latency to the first uncached request from a new visitor. Acceptable; alternatives are worse.

## Alternatives considered

- **Client-minted UUID cookie** *(original v1 of this ADR)*. Rejected — anonymous-but-trusted is something the BE will want as features land (rate limiting, lead attribution, BE-side personalisation). Building those later means migrating the cookie *and* every consumer; building the right cookie now costs little extra. The "FE is the only consumer" assumption was a guess that we'd regret.
- **Stateless JWT sessions**. Rejected for the *primary* session. JWT revocation requires a denylist that defeats the stateless benefit; capability updates require a new token to be issued, which means the BE has to re-issue mid-flight anyway. Stateful sessions are simpler and revocable. (JWT remains the right answer for *outbound* tokens to third parties — not relevant here.)
- **Separate user-session-service from day 1**. Rejected — premature service split. Start in `estate-os-service` (or a thin sibling module), graduate to its own service when sessions outgrow that home. The cookie + endpoint contracts in this ADR are service-location agnostic.
- **Status quo: keep adding feature-scoped localStorage keys.** Rejected — no schema versioning, no cross-feature consistency, no migration path, no capability model.
- **IndexedDB as primary client store.** Overkill for the data volume. Reserved for a future adapter if needed (image caches, etc.).

## Open questions

- **Auth provider**: Supabase / Auth.js / custom. Doesn't affect this ADR — the `/session/claim` shape is provider-agnostic.
- **Service location for the session module**: starts inside `estate-os-service` or as a separate `user-sessions-service`. Implementation-spec call.
- **Session store substrate**: Redis (fast, ephemeral, fits naturally) or Postgres (one-system simplicity, slower but adequate). Lean toward Postgres until lookup latency becomes a problem.
- **Signing key rotation cadence + tooling**. Operations concern, locked when the first key is generated.
- **TTLs**: anonymous (90d?) vs authenticated (1y?). Locked in the implementation spec.
- **Cookie domain**: `.predileto.pt` (subdomain-wide) or single-host. Likely subdomain-wide so future apps share the session. Confirm at implementation time.

## Related

- Existing pattern that needs to be subsumed: `src/lib/search-history.ts` (stays client-only but moves under the session abstraction).
- estate-os-service ADRs for cross-service patterns (event bus, projection model) — informative but unrelated.
- The follow-up spec `.claude/specs/active/user-session-anonymous.md` covers FE implementation; will be re-aligned to this ADR's BE-issued model.
