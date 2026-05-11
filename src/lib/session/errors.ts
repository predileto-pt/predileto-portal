import type { ErrorCode } from "./types";

/** Normalised error returned by the api layer. */
export type SessionApiError =
  | { kind: "missing"; code: "SESSION_MISSING"; status: 401 }
  | { kind: "invalid"; code: "SESSION_INVALID"; status: 401 }
  | {
      kind: "validation";
      code: "INVALID_FAVORITE_ID" | "FAVORITE_LIMIT_EXCEEDED" | "PREFS_TOO_LARGE";
      status: 400;
      message: string;
    }
  | { kind: "conflict"; code: "SESSION_BOUND_TO_OTHER_USER"; status: 409 }
  | { kind: "auth"; code: "PORTAL_AUTH_TOKEN_INVALID"; status: 401 }
  | { kind: "transport"; status: number; message: string };

interface ErrorBody {
  error?: { code?: string; message?: string };
  detail?: { code?: string; message?: string };
}

const VALIDATION_CODES = new Set<ErrorCode>([
  "INVALID_FAVORITE_ID",
  "FAVORITE_LIMIT_EXCEEDED",
  "PREFS_TOO_LARGE",
]);

function readErrorCode(body: unknown): {
  code: string | null;
  message: string | null;
} {
  if (!body || typeof body !== "object") return { code: null, message: null };
  const b = body as ErrorBody;
  const node = b.error ?? b.detail ?? null;
  if (!node) return { code: null, message: null };
  return {
    code: typeof node.code === "string" ? node.code : null,
    message: typeof node.message === "string" ? node.message : null,
  };
}

/**
 * Map an HTTP response (status + parsed body) onto our normalised error shape.
 * Unknown codes fall through to `transport` so the caller still has something
 * sensible to log/show.
 */
export function classifyError(status: number, body: unknown): SessionApiError {
  const { code, message } = readErrorCode(body);

  if (status === 401) {
    if (code === "SESSION_MISSING") {
      return { kind: "missing", code: "SESSION_MISSING", status: 401 };
    }
    if (code === "SESSION_INVALID") {
      return { kind: "invalid", code: "SESSION_INVALID", status: 401 };
    }
    if (code === "PORTAL_AUTH_TOKEN_INVALID") {
      return { kind: "auth", code: "PORTAL_AUTH_TOKEN_INVALID", status: 401 };
    }
    return {
      kind: "transport",
      status,
      message: message ?? `Unauthorized (${code ?? "no-code"})`,
    };
  }

  if (status === 400 && code && VALIDATION_CODES.has(code as ErrorCode)) {
    return {
      kind: "validation",
      code: code as Extract<SessionApiError, { kind: "validation" }>["code"],
      status: 400,
      message: message ?? code,
    };
  }

  if (status === 409 && code === "SESSION_BOUND_TO_OTHER_USER") {
    return {
      kind: "conflict",
      code: "SESSION_BOUND_TO_OTHER_USER",
      status: 409,
    };
  }

  return {
    kind: "transport",
    status,
    message: message ?? `HTTP ${status}`,
  };
}

/** True when the FE should transparently re-mint via `/session/init`. */
export function shouldReMintOnRead(err: SessionApiError): boolean {
  return err.kind === "missing" || err.kind === "invalid";
}

/**
 * Localised toast copy for the error code, in PT-PT. Anything not in this
 * map falls back to a generic message; callers can override per-site if
 * they want richer copy.
 */
export const TOAST_COPY: Record<ErrorCode | "TRANSPORT" | "RENEWED", string> = {
  SESSION_MISSING: "Sessão indisponível — algumas funcionalidades estão limitadas.",
  SESSION_INVALID: "Sessão indisponível — algumas funcionalidades estão limitadas.",
  INVALID_FAVORITE_ID: "Identificador de propriedade inválido.",
  FAVORITE_LIMIT_EXCEEDED: "Atingiu o limite de favoritos.",
  PREFS_TOO_LARGE: "As tuas preferências excedem o tamanho permitido.",
  SESSION_BOUND_TO_OTHER_USER:
    "Esta sessão pertence a outra conta. Termina sessão antes de iniciar nova.",
  PORTAL_AUTH_TOKEN_INVALID: "Sessão de início de sessão inválida.",
  TRANSPORT: "Sessão indisponível — tenta novamente.",
  RENEWED: "Sessão renovada, tenta novamente.",
};
