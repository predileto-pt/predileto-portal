import { parseSessionView } from "./schema";
import type { SessionPatch, SessionView } from "./types";
import { classifyError, type SessionApiError } from "./errors";

/**
 * Direct cross-origin fetch wrappers for the BE session endpoints.
 * Every request opts into credentials so the `predileto_session` cookie
 * is sent and the BE's `Set-Cookie` on `/init` is honoured.
 *
 * `NEXT_PUBLIC_ESTATE_OS_BASE_URL` must be set at build time. Throws
 * synchronously at module load (via `baseUrl()`) if missing — fail fast
 * is preferred over silent host-relative requests that would 404.
 */

function baseUrl(): string {
  const url = process.env.NEXT_PUBLIC_ESTATE_OS_BASE_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_ESTATE_OS_BASE_URL is not set. Configure it in .env.local or the deploy environment.",
    );
  }
  return url.replace(/\/$/, "");
}

/** Common envelope for thrown errors from this module. */
export class SessionRequestError extends Error {
  public readonly error: SessionApiError;
  constructor(error: SessionApiError) {
    super(`${error.kind}/${"code" in error ? error.code : error.status}`);
    this.name = "SessionRequestError";
    this.error = error;
  }
}

async function readBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function send(
  method: string,
  path: string,
  init?: { body?: unknown; headers?: Record<string, string> },
): Promise<SessionView> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch (err) {
    throw new SessionRequestError({
      kind: "transport",
      status: 0,
      message: err instanceof Error ? err.message : "network error",
    });
  }

  if (!res.ok) {
    const body = await readBody(res);
    throw new SessionRequestError(classifyError(res.status, body));
  }

  const body = await readBody(res);
  return parseSessionView(body);
}

/** `POST /api/v1/portal/session/init` — mints a session, sets the cookie. */
export function initSession(): Promise<SessionView> {
  return send("POST", "/api/v1/portal/session/init");
}

/** `GET /api/v1/portal/session/me` — returns the public session view. */
export function getSession(): Promise<SessionView> {
  return send("GET", "/api/v1/portal/session/me");
}

/** `PATCH /api/v1/portal/session/me` — slice writes. */
export function patchSession(patch: SessionPatch): Promise<SessionView> {
  return send("PATCH", "/api/v1/portal/session/me", { body: patch });
}

/**
 * `POST /api/v1/portal/session/claim` — exchange portal auth token for an
 * authenticated session. Token is sent in the Authorization header.
 * (Wired here so the auth spec doesn't have to redo the plumbing.)
 */
export function claimSession(authToken: string): Promise<SessionView> {
  return send("POST", "/api/v1/portal/session/claim", {
    headers: { Authorization: `Bearer ${authToken}` },
  });
}

/** `POST /api/v1/portal/session/logout`. */
export function logoutSession(): Promise<SessionView> {
  return send("POST", "/api/v1/portal/session/logout");
}
