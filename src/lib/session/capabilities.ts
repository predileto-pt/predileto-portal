import type { Capability } from "./types";

/**
 * Capabilities are BE-authoritative. This module just provides a typed
 * membership-check helper so consumers don't write the array search manually.
 */

export function hasCapability(
  list: ReadonlyArray<Capability>,
  cap: Capability,
): boolean {
  return list.includes(cap);
}
