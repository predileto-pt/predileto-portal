import { NextRequest, NextResponse } from "next/server";
import { getPropertyById } from "@/lib/api";
import { geocodeAddress, getNearbyPlaces, type NearbyPlacesResult } from "@/lib/geoapify";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const property = await getPropertyById(id);
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const addressParts = [
    property.address.street,
    property.address.city,
    property.address.region,
    property.address.country,
  ].filter(Boolean);

  const fullAddress = addressParts.join(", ");
  const coords = await geocodeAddress(fullAddress);

  let nearby: NearbyPlacesResult = { counts: {}, nearest: {} };
  let nearbyError = false;
  if (coords) {
    try {
      nearby = await getNearbyPlaces(coords.lat, coords.lon);
    } catch {
      nearbyError = true;
    }
  }

  return NextResponse.json({
    property: {
      id: property.id,
      title: property.title,
      price: property.price,
      propertyType: property.propertyType,
      address: property.address,
      features: property.features,
      fullDescription: property.fullDescription,
      sources: property.sources,
    },
    nearby,
    nearbyError,
  });
}
