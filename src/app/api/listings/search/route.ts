import { NextRequest, NextResponse } from "next/server";
import {
  fetchSearchProperties,
  EstateOsCursorError,
  EstateOsValidationError,
  type FetchSearchPropertiesOptions,
  type ListedListingType,
  type ListedTypology,
} from "@/lib/estate-os";

const ALLOWED_LISTING_TYPES: ListedListingType[] = ["sale", "purchase"];
const ALLOWED_TYPOLOGIES: ListedTypology[] = [
  "house",
  "apartment",
  "land",
  "ruin",
];

function numericParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const options: FetchSearchPropertiesOptions = {};

  const q = searchParams.get("q");
  if (q && q.trim().length > 0) options.q = q.trim();

  const parish = searchParams.get("parish");
  if (parish) options.parish = parish;
  const municipality = searchParams.get("municipality");
  if (municipality) options.municipality = municipality;
  const district = searchParams.get("district");
  if (district) options.district = district;

  const listingType = searchParams.get("listing_type");
  if (
    listingType &&
    ALLOWED_LISTING_TYPES.includes(listingType as ListedListingType)
  ) {
    options.listingType = listingType as ListedListingType;
  }

  const typology = searchParams.get("typology");
  if (typology && ALLOWED_TYPOLOGIES.includes(typology as ListedTypology)) {
    options.typology = typology as ListedTypology;
  }

  const minPrice = numericParam(searchParams.get("min_price"));
  if (minPrice !== undefined) options.minPrice = minPrice;
  const maxPrice = numericParam(searchParams.get("max_price"));
  if (maxPrice !== undefined) options.maxPrice = maxPrice;
  const limit = numericParam(searchParams.get("limit"));
  if (limit !== undefined) options.limit = limit;
  const cursor = searchParams.get("cursor");
  if (cursor) options.cursor = cursor;

  try {
    const payload = await fetchSearchProperties(options);
    return NextResponse.json(payload);
  } catch (err) {
    if (err instanceof EstateOsCursorError) {
      return NextResponse.json(
        { error: { code: err.code } },
        { status: 400 },
      );
    }
    if (err instanceof EstateOsValidationError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 422 },
      );
    }
    console.error("estate-os search error:", {
      options,
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
