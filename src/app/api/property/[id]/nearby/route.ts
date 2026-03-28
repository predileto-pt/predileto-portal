import { NextRequest, NextResponse } from "next/server";
import { fetchPropertyAmenities } from "@/lib/estate-os";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const amenities = await fetchPropertyAmenities(id);
    return NextResponse.json({ amenities });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ amenities: [], error: message }, { status: 502 });
  }
}
