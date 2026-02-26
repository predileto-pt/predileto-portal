import { NextRequest, NextResponse } from "next/server";
import { getPropertyById } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const property = await getPropertyById(id);
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: property.id,
    title: property.title,
    price: property.price,
    propertyType: property.propertyType,
    address: property.address,
    features: property.features,
    fullDescription: property.fullDescription,
    sources: property.sources,
  });
}
