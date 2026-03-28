import type { Dictionary } from "@/lib/i18n";
import type { PropertyAmenityResponse, AmenityCategory } from "@/lib/types/amenities";
import { Small } from "@/components/ui/small";

interface NearestPlacesProps {
  amenities: PropertyAmenityResponse[];
  dict: Dictionary;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

const PLACE_ITEMS: {
  category: AmenityCategory;
  labelKey: string;
  icon: React.ReactNode;
}[] = [
  {
    category: "school",
    labelKey: "school",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
  },
  {
    category: "hospital",
    labelKey: "hospital",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2z" /><path d="M12 8v8" /><path d="M8 12h8" />
      </svg>
    ),
  },
  {
    category: "grocery",
    labelKey: "grocery",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    category: "restaurant",
    labelKey: "restaurant",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    ),
  },
  {
    category: "pharmacy",
    labelKey: "pharmacy",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2z" /><path d="M12 8v8" /><path d="M8 12h8" />
      </svg>
    ),
  },
  {
    category: "bank",
    labelKey: "bank",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" /><path d="M3 10h18" /><path d="M12 3l9 7H3z" /><path d="M5 10v11" /><path d="M19 10v11" /><path d="M9 10v11" /><path d="M15 10v11" />
      </svg>
    ),
  },
  {
    category: "gym",
    labelKey: "gym",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" /><path d="M12 6.5v11" /><rect x="2" y="4" width="4" height="16" rx="1" /><rect x="18" y="4" width="4" height="16" rx="1" />
      </svg>
    ),
  },
  {
    category: "coffee_shop",
    labelKey: "coffeeShop",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 010 8h-1" /><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" /><path d="M6 2v4" /><path d="M10 2v4" /><path d="M14 2v4" />
      </svg>
    ),
  },
  {
    category: "laundry",
    labelKey: "laundry",
    icon: (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" /><circle cx="12" cy="14" r="5" /><path d="M6 6h.01" /><path d="M10 6h.01" />
      </svg>
    ),
  },
];

export function NearestPlaces({ amenities, dict }: NearestPlacesProps) {
  const d = dict.propertyDetail as Record<string, string>;
  const visible = PLACE_ITEMS.filter((item) =>
    amenities.some((a) => a.category === item.category),
  );

  if (visible.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs text-gray-400 uppercase mb-2">{d.nearestPlaces}</h3>
      <div className="space-y-2">
        {visible.map((item) => {
          const amenity = amenities.find((a) => a.category === item.category)!;
          const mapsUrl =
            amenity.nearest_google_maps_url ||
            `https://www.google.com/maps/search/?api=1&query=${amenity.nearest_latitude},${amenity.nearest_longitude}`;

          return (
            <div key={item.category} className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center border border-gray-200 text-gray-400">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {amenity.nearest_name}
                </p>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                   className="block truncate text-xs text-blue-500 hover:text-blue-600">
                  View on Google Maps
                </a>
                <Small>
                  {d[item.labelKey]} · {formatDistance(amenity.nearest_distance_meters)}
                </Small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
