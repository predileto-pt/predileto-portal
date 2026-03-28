import { NextRequest } from "next/server";

const mockAmenities = [
  {
    id: "amenity-1",
    property_id: "test-1",
    category: "restaurant",
    nearest_name: "Restaurant A",
    nearest_distance_meters: 100,
    nearest_latitude: 38.71,
    nearest_longitude: -9.14,
    total_count: 10,
    nearest_place_id: null,
    nearest_google_maps_url: null,
    top_places: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

jest.mock("@/lib/estate-os", () => ({
  fetchPropertyAmenities: jest.fn(),
}));

import { fetchPropertyAmenities } from "@/lib/estate-os";
import { GET } from "../nearby/route";

const mockedFetch = fetchPropertyAmenities as jest.MockedFunction<
  typeof fetchPropertyAmenities
>;

describe("GET /api/property/[id]/nearby", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns amenities data", async () => {
    mockedFetch.mockResolvedValue(mockAmenities);

    const request = new NextRequest(
      "http://localhost:3000/api/property/test-1/nearby",
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "test-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.amenities).toHaveLength(1);
    expect(body.amenities[0].category).toBe("restaurant");
    expect(body.amenities[0].total_count).toBe(10);
  });

  it("returns 502 when estate-os fails", async () => {
    mockedFetch.mockRejectedValue(new Error("estate-os error: 500"));

    const request = new NextRequest(
      "http://localhost:3000/api/property/test-1/nearby",
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "test-1" }),
    });

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.amenities).toEqual([]);
    expect(body.error).toBe("estate-os error: 500");
  });

  it("returns empty amenities when estate-os returns empty list", async () => {
    mockedFetch.mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost:3000/api/property/test-1/nearby",
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "test-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.amenities).toEqual([]);
  });
});
