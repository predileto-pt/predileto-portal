import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const bookingId = `mock-${Date.now()}`;

  return NextResponse.json({
    success: true,
    bookingId,
    propertyId: body.propertyId,
    message: "Booking created successfully",
  });
}
