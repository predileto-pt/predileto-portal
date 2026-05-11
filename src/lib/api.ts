import type { Property, PaginatedResult, PropertySearchParams } from "./types";
import { DEFAULT_PAGE_SIZE } from "./constants";
import {
  fetchPublicProperties,
  mapListedToProperty,
  portalListingTypeToEstateOs,
  portalPropertyTypeToEstateOs,
} from "./estate-os";

/**
 * Legacy `/comprar` / `/arrendar` route helper. The upstream endpoint
 * moved to cursor pagination (ADR-016) which doesn't map to page-number
 * URLs — `page>1` is degraded to "no more results" until this route is
 * migrated to infinite scroll. `total` is reported as `data.length`
 * because the endpoint no longer returns a count.
 */
export async function getProperties(
  params: PropertySearchParams = {},
): Promise<PaginatedResult<Property>> {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = DEFAULT_PAGE_SIZE;

  if (page > 1) {
    return { data: [], total: 0, page, pageSize, totalPages: 1 };
  }

  const listingType =
    params.listingType === "buy" || params.listingType === "rent"
      ? portalListingTypeToEstateOs(params.listingType)
      : undefined;

  try {
    const result = await fetchPublicProperties({
      limit: pageSize,
      listingType,
      typology: portalPropertyTypeToEstateOs(params.propertyType),
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    });

    const properties = result.items.map(mapListedToProperty);
    const totalPages = result.next_cursor ? page + 1 : page;

    return { data: properties, total: properties.length, page, pageSize, totalPages };
  } catch (err) {
    console.error("estate-os query error:", {
      message: err instanceof Error ? err.message : String(err),
      params,
    });
    return { data: [], total: 0, page, pageSize, totalPages: 1 };
  }
}

export async function getLatestProperties(
  listingType: "buy" | "rent",
  limit = 6,
): Promise<Property[]> {
  try {
    const result = await fetchPublicProperties({
      limit,
      listingType: portalListingTypeToEstateOs(listingType),
    });
    return result.items.map(mapListedToProperty);
  } catch (err) {
    console.error("estate-os query error:", {
      message: err instanceof Error ? err.message : String(err),
      listingType,
    });
    return [];
  }
}
