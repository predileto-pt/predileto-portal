import type { LocationSelection } from "@/lib/estate-os";

type SearchParams = Record<string, string | string[] | undefined>;

function readString(sp: SearchParams, key: string): string | undefined {
  const v = sp[key];
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Pull the location from URL search params. Precedence: parish > municipality
 * > district. Returns null when none is set, matching the unset state of
 * `LocationSelection | null`.
 */
export function parseInitialLocation(
  sp: SearchParams,
): LocationSelection | null {
  const parish = readString(sp, "parish");
  if (parish) return { level: "parish", name: parish };
  const municipality = readString(sp, "municipality");
  if (municipality) return { level: "municipality", name: municipality };
  const district = readString(sp, "district");
  if (district) return { level: "district", name: district };
  return null;
}
