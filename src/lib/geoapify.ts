export interface GeoCoords {
  lat: number;
  lon: number;
}

export interface NearbyPlace {
  name: string;
  distance: number;
}

export interface NearbyPlacesResult {
  counts: Record<string, number>;
  nearest: Record<string, NearbyPlace | null>;
}

const PLACE_CATEGORIES = [
  "catering.restaurant",
  "healthcare.hospital",
  "education.school",
  "service.financial.bank",
  "healthcare.pharmacy",
  "commercial.supermarket",
] as const;

const CATEGORY_KEYS: Record<string, string> = {
  "catering.restaurant": "restaurants",
  "healthcare.hospital": "hospitals",
  "education.school": "schools",
  "service.financial.bank": "banks",
  "healthcare.pharmacy": "pharmacies",
  "commercial.supermarket": "supermarkets",
};

function getApiKey(): string | null {
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEOAPIFY_API_KEY_HERE") return null;
  return apiKey;
}

export async function geocodeAddress(
  fullAddress: string,
): Promise<GeoCoords | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    text: fullAddress,
    format: "json",
    filter: "countrycode:pt",
    limit: "1",
    apiKey,
  });

  const res = await fetch(
    `https://api.geoapify.com/v1/geocode/search?${params}`,
    { next: { revalidate: 86400 } },
  );

  if (!res.ok) return null;

  const data: GeoapifyApiResponse = await res.json();
  if (!data.results.length) return null;

  return { lat: data.results[0].lat, lon: data.results[0].lon };
}

export async function getNearbyPlaces(
  lat: number,
  lon: number,
): Promise<NearbyPlacesResult> {
  const apiKey = getApiKey();
  const counts: Record<string, number> = {};
  const nearest: Record<string, NearbyPlace | null> = {};

  if (!apiKey) return { counts, nearest };

  const results = await Promise.all(
    PLACE_CATEGORIES.map(async (category) => {
      const params = new URLSearchParams({
        categories: category,
        filter: `circle:${lon},${lat},1500`,
        bias: `proximity:${lon},${lat}`,
        limit: "20",
        apiKey,
      });

      const res = await fetch(
        `https://api.geoapify.com/v2/places?${params}`,
        { next: { revalidate: 86400 } },
      );

      if (!res.ok) return { category, features: [] };

      const data = await res.json();
      return {
        category,
        features: data.features || [],
      };
    }),
  );

  for (const { category, features } of results) {
    const key = CATEGORY_KEYS[category];
    counts[key] = features.length;

    if (features.length > 0) {
      const f = features[0];
      nearest[key] = {
        name: f.properties?.name || f.properties?.address_line1 || key,
        distance: Math.round(f.properties?.distance || 0),
      };
    } else {
      nearest[key] = null;
    }
  }

  return { counts, nearest };
}

interface GeoapifyApiResult {
  formatted: string;
  city?: string;
  county?: string;
  state?: string;
  lat: number;
  lon: number;
}

interface GeoapifyApiResponse {
  results: GeoapifyApiResult[];
}
