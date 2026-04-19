import { NextRequest } from "next/server";
import type { ListedProperty } from "@/lib/estate-os";

const mockListedProperty: ListedProperty = {
  id: "test-1",
  organization_id: "org-1",
  address: "Rua Principal 10, 1000-001 Lisboa",
  listing_type: "sale",
  typology: "apartment",
  description: "Full description of the property.",
  characteristics: {
    area_in_m2: 80,
    num_of_bedrooms: 2,
    num_of_bathrooms: 1,
    built_at: null,
    energy_rating: null,
    floor: null,
    parking_spaces: null,
    has_elevator: null,
    has_garden: null,
    has_pool: null,
  },
  latitude: null,
  longitude: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-06-01T00:00:00Z",
  prices: [{ id: "p1", amount: "200000", listing_type: "sale" }],
  images: [],
};

jest.mock("@/lib/estate-os", () => ({
  fetchListedPropertyById: jest.fn(),
}));

import { fetchListedPropertyById } from "@/lib/estate-os";
import { GET } from "../route";

const mockedFetch = fetchListedPropertyById as jest.MockedFunction<
  typeof fetchListedPropertyById
>;

describe("GET /api/property/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns property data for valid id", async () => {
    mockedFetch.mockResolvedValue(mockListedProperty);

    const request = new NextRequest("http://localhost:3000/api/property/test-1");
    const response = await GET(request, {
      params: Promise.resolve({ id: "test-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe("test-1");
    expect(body.title).toBe("Rua Principal 10, 1000-001 Lisboa");
    expect(body.price).toBe(200000);
    expect(body.propertyType).toBe("apartment");
    expect(body.features.bedrooms).toBe(2);
    expect(body.features.bathrooms).toBe(1);
    expect(body.features.areaSqm).toBe(80);
    expect(body.sources).toEqual([]);
  });

  it("returns 404 for not-found property", async () => {
    mockedFetch.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/property/nonexistent",
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Property not found");
  });

  it("returns 502 when upstream throws", async () => {
    mockedFetch.mockRejectedValue(new Error("estate-os error: 500"));

    const request = new NextRequest("http://localhost:3000/api/property/test-1");
    const response = await GET(request, {
      params: Promise.resolve({ id: "test-1" }),
    });

    expect(response.status).toBe(502);
  });
});
