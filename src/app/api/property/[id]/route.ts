import { NextRequest, NextResponse } from "next/server";
import { fetchListedPropertyById, type ListedProperty } from "@/lib/estate-os";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let property: ListedProperty | null;
  try {
    property = await fetchListedPropertyById(id);
  } catch (err) {
    console.error("estate-os property fetch error:", {
      id,
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const price = property.prices[0]?.amount
    ? Number(property.prices[0].amount)
    : 0;

  return NextResponse.json({
    id: property.id,
    title: property.address,
    price,
    propertyType: property.typology,
    address: {
      fullAddress: property.address,
      municipality: "",
      district: "",
    },
    features: {
      bedrooms: property.characteristics?.num_of_bedrooms ?? 0,
      bathrooms: property.characteristics?.num_of_bathrooms ?? 0,
      areaSqm: property.characteristics?.area_in_m2 ?? 0,
    },
    fullDescription: property.description ?? "",
    sources: [],
  });
}
