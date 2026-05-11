"use client";

import type { ReactNode } from "react";
import type { Capability } from "@/lib/session/types";
import { useUserSession } from "@/components/session/user-session-provider";

interface RequireCapabilityProps {
  cap: Capability;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Declarative capability gate. Renders `children` when the current
 * session has the capability; otherwise renders `fallback` (defaults
 * to `null` so the component disappears entirely).
 *
 * Capabilities are BE-authoritative — see ADR-001 §"Capabilities".
 */
export function RequireCapability({
  cap,
  children,
  fallback = null,
}: RequireCapabilityProps) {
  const session = useUserSession();
  return session.can(cap) ? <>{children}</> : <>{fallback}</>;
}
