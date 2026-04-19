import type {
  Property,
  PropertyType as PortalPropertyType,
} from "@/lib/types";
import type { PropertyAmenityResponse } from "@/lib/types/amenities";

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
  filename: string;
  content_type: string;
  size_bytes: number;
  display_order: number;
  download_url: string;
}

export interface ListedPropertyPrice {
  id: string;
  amount: string;
  listing_type: ListedListingType;
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

export interface ListedProperty {
  id: string;
  organization_id: string;
  address: string;
  listing_type: ListedListingType;
  typology: ListedTypology;
  description: string | null;
  characteristics: ListedPropertyCharacteristics | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  prices: ListedPropertyPrice[];
  images: ListedPropertyImage[];
}

export interface PaginatedListings {
  items: ListedProperty[];
  total: number;
  limit: number;
  offset: number;
}

export interface FetchPublicPropertiesOptions {
  limit?: number;
  offset?: number;
  listingType?: ListedListingType;
  typology?: ListedTypology;
  minPrice?: number;
  maxPrice?: number;
  district?: string;
}

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

export async function fetchPublicProperties(
  options: FetchPublicPropertiesOptions = {},
): Promise<PaginatedListings> {
  const params = new URLSearchParams();
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.offset !== undefined) params.set("offset", String(options.offset));
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

  if (!res.ok) {
    throw new Error(`estate-os error: ${res.status}`);
  }

  return res.json();
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

  return {
    id: listed.id,
    title: listed.address,
    slug: listed.id,
    shortDescription: "",
    fullDescription: listed.description ?? "",
    propertyType: portalPropertyType,
    listingType: listed.listing_type === "sale" ? "buy" : "rent",
    price: priceAmount,
    featured: false,
    address: {
      fullAddress: listed.address,
      municipality: "",
      district: "",
      postalCode: "",
      country: "PT",
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
      alt: img.filename,
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
