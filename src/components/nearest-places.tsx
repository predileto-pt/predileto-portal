import type { Dictionary } from "@/lib/i18n";
import type { NearbyPlace } from "@/lib/geoapify";

interface NearestPlacesProps {
  nearest: Record<string, NearbyPlace | null>;
  dict: Dictionary;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

const PLACE_ITEMS = [
  {
    key: "schools",
    labelKey: "school",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
  },
  {
    key: "hospitals",
    labelKey: "hospital",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2z" /><path d="M12 8v8" /><path d="M8 12h8" />
      </svg>
    ),
  },
  {
    key: "supermarkets",
    labelKey: "supermarket",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
  },
] as const;

export function NearestPlaces({ nearest, dict }: NearestPlacesProps) {
  const d = dict.propertyDetail as Record<string, string>;
  const visible = PLACE_ITEMS.filter(
    (item) => nearest[item.key] !== null && nearest[item.key] !== undefined,
  );

  if (visible.length === 0) return null;

  return (
    <div>
      <h3 className="text-[10px] text-gray-400 uppercase mb-2">{d.nearestPlaces}</h3>
      <div className="space-y-2">
        {visible.map((item) => {
          const place = nearest[item.key]!;
          return (
            <div key={item.key} className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center border border-gray-200 text-gray-400">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium">
                  {place.name}
                </p>
                <p className="text-[10px] text-gray-400">
                  {d[item.labelKey]} · {formatDistance(place.distance)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
