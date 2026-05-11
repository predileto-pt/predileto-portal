import { z } from "zod";
import type { SessionView } from "./types";

const KIND = z.enum(["ANONYMOUS", "AUTHENTICATED"]);

const CAPABILITY = z.enum([
  "SAVE_FAVORITE",
  "VIEW_HISTORY",
  "SET_PREFERENCES",
  "COMMENT",
  "CONTACT_AGENT",
  "SAVE_PROPERTY",
]);

const LIMITS = z.object({
  favorites_max: z.number().int().positive(),
  prefs_max_bytes: z.number().int().positive(),
});

export const sessionViewSchema = z.object({
  kind: KIND,
  user_id: z.string().nullable(),
  capabilities: z.array(CAPABILITY),
  prefs: z.record(z.string(), z.unknown()),
  favorites: z.array(z.string()),
  limits: LIMITS.optional(),
}) satisfies z.ZodType<SessionView>;

/** Parse a server response into a `SessionView`. Throws on schema mismatch. */
export function parseSessionView(raw: unknown): SessionView {
  return sessionViewSchema.parse(raw);
}

/** Soft-parse: returns `null` on failure rather than throwing. */
export function safeParseSessionView(raw: unknown): SessionView | null {
  const r = sessionViewSchema.safeParse(raw);
  return r.success ? r.data : null;
}
