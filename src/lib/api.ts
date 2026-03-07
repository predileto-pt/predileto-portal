import type { Property, PaginatedResult, PropertySearchParams } from "./types";
import { DEFAULT_PAGE_SIZE } from "./constants";
import { supabase } from "./supabase";
import type { PropertyRow } from "./db-types";
import { mapRowToProperty } from "./property-mapper";
import { searchProperties } from "./elasticsearch";
import { getDistrictSlugsForRegion } from "./locations";

// --- Property type / listing type mapping for DB queries ---

const listingTypeConditions: Record<string, string> = {
  buy: "listing_type.eq.venda,listing_type.is.null",
  rent: "listing_type.eq.arrendar,listing_type.eq.arrendamento",
};

const propertyTypeToDb: Record<string, string> = {
  apartment: "apartamento",
  house: "casa",
  villa: "villa",
  studio: "estúdio",
  penthouse: "penthouse",
  townhouse: "townhouse",
};

// --- Sorting column mapping ---

function getSortColumn(sort: string): { column: string; ascending: boolean } {
  switch (sort) {
    case "oldest":
      return { column: "scraped_at", ascending: true };
    case "price-desc":
      return { column: "price", ascending: false };
    case "price-asc":
      return { column: "price", ascending: true };
    case "bedrooms-desc":
      return { column: "bedrooms", ascending: false };
    case "area-desc":
      return { column: "area_m2", ascending: false };
    default:
      return { column: "scraped_at", ascending: false };
  }
}

// --- Property functions ---

export async function getProperties(
  params: PropertySearchParams = {},
): Promise<PaginatedResult<Property>> {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Try Elasticsearch first for text queries or hierarchical location filters
  const hasLocationFilter = !!(params.region || params.district || params.municipality || params.parish);
  if (params.q || hasLocationFilter) {
    const esResult = await searchProperties(params);
    if (esResult) {
      const total = esResult.total;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const properties = esResult.rows.map(mapRowToProperty);
      return { data: properties, total, page, pageSize, totalPages };
    }
  }

  let query = supabase.from("properties").select("*", { count: "exact" });

  if (params.listingType) {
    const conditions = listingTypeConditions[params.listingType];
    if (conditions) query = query.or(conditions);
  }

  if (params.propertyType) {
    const dbVal = propertyTypeToDb[params.propertyType];
    if (dbVal) query = query.eq("property_type", dbVal);
  }

  if (params.bedrooms) {
    const beds = Number(params.bedrooms);
    if (beds > 0) {
      const patterns: string[] = [];
      for (let i = beds; i <= 9; i++) {
        patterns.push(`bedrooms.eq.T${i}`);
      }
      patterns.push("bedrooms.eq.T5+");
      query = query.or(patterns.join(","));
    }
  }

  // Hierarchical location filter — only the deepest level (it implies ancestors)
  if (params.parish) {
    query = query.eq("address_parish", params.parish);
  } else if (params.municipality) {
    query = query.eq("address_municipality", params.municipality);
  } else if (params.district) {
    query = query.eq("address_district", params.district);
  } else if (params.region) {
    const districtSlugs = getDistrictSlugsForRegion(params.region);
    if (districtSlugs.length > 0) {
      query = query.in("address_district", districtSlugs);
    }
  }

  if (params.minPrice) {
    query = query.gte("price", Number(params.minPrice));
  }

  if (params.maxPrice) {
    query = query.lte("price", Number(params.maxPrice));
  }

  if (params.q) {
    const q = `"%${params.q}%"`;
    query = query.or(
      `title.ilike.${q},description.ilike.${q},address_municipality.ilike.${q},address_district.ilike.${q}`,
    );
  }

  const { column, ascending } = getSortColumn(params.sort || "newest");
  query = query.order(column, { ascending, nullsFirst: false });
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Supabase query error:", error);
    return { data: [], total: 0, page, pageSize, totalPages: 1 };
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const properties = (data as PropertyRow[]).map(mapRowToProperty);

  return { data: properties, total, page, pageSize, totalPages };
}

export async function getLatestProperties(
  listingType: "buy" | "rent",
  limit = 6,
): Promise<Property[]> {
  const conditions = listingTypeConditions[listingType];
  if (!conditions) return [];

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .or(conditions)
    .not("images", "eq", "[]")
    .order("scraped_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as PropertyRow[]).map(mapRowToProperty);
}

export async function getPropertyById(
  id: string,
): Promise<Property | undefined> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  return mapRowToProperty(data as PropertyRow);
}
