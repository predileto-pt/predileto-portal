import type {
  Property,
  PropertyType as PortalPropertyType,
} from "@/lib/types";
import type { PropertyAmenityResponse } from "@/lib/types/amenities";
import type { SearchResultItem } from "@/components/search-results";
import type { ResultMediaItem } from "@/components/result-media-carousel";

const ESTATE_OS_BASE_URL =
  process.env.ESTATE_OS_BASE_URL || "http://localhost:8000";

export async function fetchPropertyAmenities(
  propertyId: string,
): Promise<PropertyAmenityResponse[]> {
  const params = new URLSearchParams({ property_id: propertyId });

  const res = await fetch(
    `${ESTATE_OS_BASE_URL}/api/v1/property-amenities/?${params}`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) {
    throw new Error(`estate-os error: ${res.status}`);
  }

  return res.json();
}

export type ListedListingType = "sale" | "purchase";
export type ListedTypology = "house" | "apartment" | "land" | "ruin";

export interface ListedPropertyImage {
  id: string;
  display_order: number;
  download_url: string;
  /** Trimmed by backend (ADR-016 / projection collapse) — kept optional so legacy mocks still typecheck. */
  filename?: string;
  content_type?: string;
  size_bytes?: number;
}

export interface ListedPropertyPrice {
  amount: string;
  listing_type: ListedListingType;
  /** Trimmed by backend projection collapse — kept optional for legacy mocks. */
  id?: string;
}

export interface ListedPropertyCharacteristics {
  area_in_m2: number | null;
  num_of_bedrooms: number | null;
  num_of_bathrooms: number | null;
  built_at: number | null;
  energy_rating: string | null;
  floor: number | null;
  parking_spaces: number | null;
  has_elevator: boolean | null;
  has_garden: boolean | null;
  has_pool: boolean | null;
}

export interface ListedAgency {
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface ListedPoi {
  category: string;
  name: string;
  distance_meters: number;
  address?: string | null;
  image_urls?: string[];
  reviews?: Record<string, unknown>[] | null;
}

export interface ListedProperty {
  id: string;
  organization_id: string;
  title: string;
  listing_type: ListedListingType;
  typology: ListedTypology;
  description: string | null;
  characteristics: ListedPropertyCharacteristics | null;
  parish?: string | null;
  municipality?: string | null;
  district?: string | null;
  country?: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  prices: ListedPropertyPrice[];
  images: ListedPropertyImage[];
  /**
   * Full POI snapshot for the property — populated on the detail endpoint
   * regardless of search query state.
   */
  pois?: ListedPoi[];
  /**
   * POIs matched against the user's extracted `nearby_pois` (ADR-014 §15).
   * Only populated on the q-set search path; q-empty calls leave this as `[]`.
   */
  matched_pois?: ListedPoi[];
  /** POI names extracted from the search query that did not match. */
  unmatched_pois?: string[];
  /**
   * Display contact for the listing's agency. Resolved from
   * `Organization.name` + the creating user's email/phone at projection
   * time. Spec `2026-05-listings-agency-contact`.
   */
  agency?: ListedAgency | null;
  /** Removed from backend response (privacy fix). Legacy mocks still set it. */
  address?: string;
}

/**
 * Cursor-paginated envelope returned by `GET /api/v1/listings/properties`
 * (ADR-016). `next_cursor` is opaque; pass it back as `?cursor=` for the
 * next page. `null` means there are no more pages.
 */
export interface PaginatedListings {
  items: ListedProperty[];
  next_cursor: string | null;
  limit: number;
}

export interface FetchPublicPropertiesOptions {
  limit?: number;
  cursor?: string;
  listingType?: ListedListingType;
  typology?: ListedTypology;
  minPrice?: number;
  maxPrice?: number;
  district?: string;
}

// ── Semantic search ──────────────────────────────────────────────────

export type LocationLevel = "district" | "municipality" | "parish";

export interface LocationSelection {
  level: LocationLevel;
  name: string;
}

export interface MunicipalityNode {
  name: string;
  parishes: string[];
}

export interface DistrictNode {
  name: string;
  municipalities: MunicipalityNode[];
}

export interface CountryNode {
  /** ISO 3166-1 alpha-2 (e.g. "PT"). */
  code: string;
  name: string;
  districts: DistrictNode[];
}

/**
 * Hierarchical location tree from `GET /api/v1/listings/locations`.
 * Multi-country: v1 ships only Portugal populated; future countries are
 * appended as additional entries.
 */
export interface LocationTree {
  countries: CountryNode[];
}

export interface FetchSearchPropertiesOptions
  extends FetchPublicPropertiesOptions {
  q?: string;
  parish?: string;
  municipality?: string;
}

/** Thrown when estate-os returns 422 with a typed validation code. */
export class EstateOsValidationError extends Error {
  public readonly code: string;
  public readonly status: number;
  constructor(code: string, message: string, status = 422) {
    super(message);
    this.name = "EstateOsValidationError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Thrown when estate-os returns 400 with a cursor-related `detail`
 * (ADR-016 §9). All cursor errors share one recovery action on the FE:
 * drop the cursor and refetch from the head page.
 */
export type CursorErrorCode =
  | "cursor_unsupported_version"
  | "cursor_invalid"
  | "cursor_kind_mismatch"
  | "cursor_filter_mismatch";

export class EstateOsCursorError extends Error {
  public readonly code: CursorErrorCode;
  constructor(code: CursorErrorCode) {
    super(code);
    this.name = "EstateOsCursorError";
    this.code = code;
  }
}

const CURSOR_ERROR_CODES = new Set<string>([
  "cursor_unsupported_version",
  "cursor_invalid",
  "cursor_kind_mismatch",
  "cursor_filter_mismatch",
]);

export async function fetchListedPropertyById(
  id: string,
): Promise<ListedProperty | null> {
  const res = await fetch(
    `${ESTATE_OS_BASE_URL}/api/v1/listings/properties/${encodeURIComponent(id)}`,
    { next: { revalidate: 60 } },
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`estate-os error: ${res.status}`);
  }

  return res.json();
}

async function parseCursorError(res: Response): Promise<EstateOsCursorError | null> {
  if (res.status !== 400) return null;
  try {
    const body = (await res.json()) as { detail?: unknown };
    if (typeof body.detail === "string" && CURSOR_ERROR_CODES.has(body.detail)) {
      return new EstateOsCursorError(body.detail as CursorErrorCode);
    }
  } catch {
    // not JSON; fall through
  }
  return null;
}

export async function fetchPublicProperties(
  options: FetchPublicPropertiesOptions = {},
): Promise<PaginatedListings> {
  const params = new URLSearchParams();
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.cursor) params.set("cursor", options.cursor);
  if (options.listingType) params.set("listing_type", options.listingType);
  if (options.typology) params.set("typology", options.typology);
  if (options.minPrice !== undefined)
    params.set("min_price", String(options.minPrice));
  if (options.maxPrice !== undefined)
    params.set("max_price", String(options.maxPrice));
  if (options.district) params.set("district", options.district);

  const qs = params.toString();
  const url = `${ESTATE_OS_BASE_URL}/api/v1/listings/properties${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  const cursorErr = await parseCursorError(res.clone());
  if (cursorErr) throw cursorErr;

  if (!res.ok) {
    throw new Error(`estate-os error: ${res.status}`);
  }

  return res.json();
}

/**
 * Server-side helper. Calls `GET /api/v1/listings/properties` with optional
 * semantic query + location filters. When `q` is set the API requires at least
 * one of parish/municipality/district and returns 422 otherwise; that 422 is
 * surfaced as an `EstateOsValidationError`.
 */
export async function fetchSearchProperties(
  options: FetchSearchPropertiesOptions = {},
): Promise<PaginatedListings> {
  const params = new URLSearchParams();
  if (options.q) params.set("q", options.q);
  if (options.parish) params.set("parish", options.parish);
  if (options.municipality) params.set("municipality", options.municipality);
  if (options.district) params.set("district", options.district);
  if (options.listingType) params.set("listing_type", options.listingType);
  if (options.typology) params.set("typology", options.typology);
  if (options.minPrice !== undefined)
    params.set("min_price", String(options.minPrice));
  if (options.maxPrice !== undefined)
    params.set("max_price", String(options.maxPrice));
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.cursor) params.set("cursor", options.cursor);

  const qs = params.toString();
  const url = `${ESTATE_OS_BASE_URL}/api/v1/listings/properties${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { next: { revalidate: 0 } });

  const cursorErr = await parseCursorError(res.clone());
  if (cursorErr) throw cursorErr;

  if (res.status === 422) {
    let code = "validation_error";
    let message = "Validation failed";
    try {
      const body = await res.json();
      const detail = body?.detail;
      if (detail && typeof detail === "object" && "code" in detail) {
        code = String(detail.code);
        if ("message" in detail) message = String(detail.message);
      }
    } catch {
      // ignore parse errors; fall through with defaults
    }
    throw new EstateOsValidationError(code, message, 422);
  }

  if (!res.ok) {
    throw new Error(`estate-os error: ${res.status}`);
  }

  return res.json();
}

/** Server-side helper. Calls `GET /api/v1/listings/locations`. */
export async function fetchLocationTree(): Promise<LocationTree> {
  const res = await fetch(`${ESTATE_OS_BASE_URL}/api/v1/listings/locations`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`estate-os error: ${res.status}`);
  }

  return res.json();
}

/**
 * Map an estate-os `ListedProperty` to the feed card's `SearchResultItem`.
 * Source fields are mostly nullable; defaults preserve the strict shape the
 * card consumer expects.
 */
function deriveTitle(listed: ListedProperty): string {
  if (listed.title) return listed.title;
  if (listed.address) return listed.address;
  const parts = [listed.parish, listed.municipality, listed.district].filter(
    (v): v is string => Boolean(v),
  );
  return parts.length > 0 ? parts.join(", ") : "Imóvel";
}

export function mapListedToSearchResult(
  listed: ListedProperty,
): SearchResultItem {
  const priceAmount = listed.prices[0]?.amount
    ? Number(listed.prices[0].amount)
    : 0;

  const title = deriveTitle(listed);

  const media: ResultMediaItem[] = listed.images.map((img) => ({
    type: "image",
    url: img.download_url,
    alt: img.filename ?? title,
  }));

  return {
    id: listed.id,
    title,
    description: listed.description ?? "",
    price: priceAmount,
    country: listed.country,
    areaSqm: listed.characteristics?.area_in_m2 ?? 0,
    bedrooms: listed.characteristics?.num_of_bedrooms ?? 0,
    media,
    listingType: listed.listing_type === "sale" ? "buy" : "rent",
    propertyType: listed.typology,
  };
}

export function portalListingTypeToEstateOs(
  portal: "buy" | "rent",
): ListedListingType {
  return portal === "buy" ? "sale" : "purchase";
}

export function portalPropertyTypeToEstateOs(
  portal: string | undefined,
): ListedTypology | undefined {
  if (portal === "house" || portal === "apartment") return portal;
  return undefined;
}

export function mapListedToProperty(listed: ListedProperty): Property {
  const priceAmount = listed.prices[0]?.amount
    ? Number(listed.prices[0].amount)
    : 0;

  const portalPropertyType: PortalPropertyType =
    listed.typology === "apartment" || listed.typology === "house"
      ? listed.typology
      : "house";

  const title = deriveTitle(listed);

  return {
    id: listed.id,
    title,
    slug: listed.id,
    shortDescription: "",
    fullDescription: listed.description ?? "",
    propertyType: portalPropertyType,
    listingType: listed.listing_type === "sale" ? "buy" : "rent",
    price: priceAmount,
    featured: false,
    address: {
      fullAddress: title,
      municipality: listed.municipality ?? "",
      district: listed.district ?? "",
      postalCode: "",
      country: listed.country ?? "PT",
      coordinates:
        listed.latitude !== null && listed.longitude !== null
          ? { lat: listed.latitude, lng: listed.longitude }
          : undefined,
    },
    features: {
      bedrooms: listed.characteristics?.num_of_bedrooms ?? 0,
      bathrooms: listed.characteristics?.num_of_bathrooms ?? 0,
      areaSqm: listed.characteristics?.area_in_m2 ?? 0,
      floor: listed.characteristics?.floor ?? undefined,
      parkingSpaces: listed.characteristics?.parking_spaces ?? undefined,
      yearBuilt: listed.characteristics?.built_at ?? undefined,
      energyRating: listed.characteristics?.energy_rating ?? undefined,
    },
    amenities: [],
    images: listed.images.map((img) => ({
      url: img.download_url,
      alt: img.filename ?? title,
    })),
    agent: { name: "", email: "", phone: "", photo: null },
    available: true,
    availableFrom: null,
    sources: [],
    keywords: [],
    createdAt: listed.created_at,
    updatedAt: listed.updated_at,
  };
}
