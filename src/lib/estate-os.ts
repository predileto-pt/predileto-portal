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
