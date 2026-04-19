import type { Property, PaginatedResult, PropertySearchParams } from "./types";
import { DEFAULT_PAGE_SIZE } from "./constants";
import {
  fetchPublicProperties,
  mapListedToProperty,
  portalListingTypeToEstateOs,
  portalPropertyTypeToEstateOs,
} from "./estate-os";

export async function getProperties(
  params: PropertySearchParams = {},
): Promise<PaginatedResult<Property>> {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  const listingType =
    params.listingType === "buy" || params.listingType === "rent"
      ? portalListingTypeToEstateOs(params.listingType)
      : undefined;

  try {
    const result = await fetchPublicProperties({
      limit: pageSize,
      offset,
      listingType,
      typology: portalPropertyTypeToEstateOs(params.propertyType),
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    });

    const totalPages = Math.max(1, Math.ceil(result.total / pageSize));
    const properties = result.items.map(mapListedToProperty);

    return { data: properties, total: result.total, page, pageSize, totalPages };
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
      offset: 0,
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
