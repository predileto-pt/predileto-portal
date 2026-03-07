import type { Property, PropertyType, ListingType } from "./types";
import type { PropertyRow } from "./db-types";
import { slugify, truncate } from "./utils";
import { lookupRegionForDistrictName, lookupDistrictName, lookupMunicipalityName } from "./locations";

function mapListingType(dbValue: string | null): ListingType {
  if (dbValue === "venda") return "buy";
  if (dbValue === "arrendar" || dbValue === "arrendamento") return "rent";
  return "buy";
}

function mapPropertyType(dbValue: string | null): PropertyType {
  if (dbValue === "apartamento") return "apartment";
  if (dbValue === "casa" || dbValue === "moradia") return "house";
  if (dbValue === "villa") return "villa";
  if (dbValue === "estúdio" || dbValue === "estudio") return "studio";
  return "apartment";
}

function parseJsonArray<T>(value: T[] | string | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseBedrooms(value: string | null): number {
  if (!value) return 0;
  const match = value.match(/T(\d+)/i);
  if (match) return parseInt(match[1], 10);
  const num = parseInt(value, 10);
  return isNaN(num) ? 0 : num;
}

export function mapRowToProperty(row: PropertyRow): Property {
  const description = row.description || "";
  const images = parseJsonArray<string>(row.images).map((url) => ({
    url,
    alt: row.title,
  }));

  let sources = parseJsonArray<{ name: string; url: string }>(row.sources);
  if (!sources || sources.length === 0) {
    if (row.source && row.url) {
      sources = [{ name: row.source, url: row.url }];
    } else {
      sources = [];
    }
  }

  return {
    id: row.id,
    title: row.title,
    slug: slugify(row.title),
    shortDescription: truncate(description, 200),
    fullDescription: description,
    propertyType: mapPropertyType(row.property_type),
    listingType: mapListingType(row.listing_type),
    price: row.price ?? 0,
    featured: false,
    address: {
      fullAddress: row.address_full_address || "",
      region: row.address_region ?? lookupRegionForDistrictName(row.address_district || "")?.slug,
      district: lookupDistrictName(row.address_district || "") ?? row.address_district ?? undefined,
      municipality: lookupMunicipalityName(row.address_municipality || "") ?? row.address_municipality ?? (row.address_city || undefined),
      parish: row.address_parish ?? undefined,
      postalCode: row.address_postal_code || "",
      country: "Portugal",
    },
    features: {
      bedrooms: parseBedrooms(row.bedrooms),
      bathrooms: row.bathrooms ?? 0,
      areaSqm: row.area_m2 ?? 0,
    },
    amenities: parseJsonArray<string>(row.features),
    images,
    agent: { name: "", email: "", phone: "", photo: null },
    available: true,
    availableFrom: null,
    sources,
    keywords: [],
    createdAt: row.scraped_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}
