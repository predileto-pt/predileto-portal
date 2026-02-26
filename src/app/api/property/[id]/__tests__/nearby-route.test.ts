import { NextRequest } from "next/server";

const mockProperty = {
  id: "test-1",
  title: "Test Property",
  slug: "test-property",
  shortDescription: "Short desc",
  fullDescription: "Full description of the property.",
  propertyType: "apartment",
  listingType: "buy",
  price: 200000,
  featured: false,
  address: {
    fullAddress: "Rua Principal 10",
    municipality: "Lisboa",
    district: "Lisboa",
    postalCode: "1000-001",
    country: "Portugal",
  },
  features: { bedrooms: 2, bathrooms: 1, areaSqm: 80 },
  amenities: [],
  images: [],
  agent: { name: "", email: "", phone: "", photo: null },
  available: true,
  availableFrom: null,
  sources: [{ name: "Source", url: "https://source.com" }],
  keywords: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
};

jest.mock("@/lib/api", () => ({
  getPropertyById: jest.fn(),
}));

jest.mock("@/lib/geoapify", () => ({
  geocodeAddress: jest.fn(),
  getNearbyPlaces: jest.fn(),
}));

import { getPropertyById } from "@/lib/api";
import { geocodeAddress, getNearbyPlaces } from "@/lib/geoapify";
import { GET } from "../nearby/route";

const mockedGetPropertyById = getPropertyById as jest.MockedFunction<
  typeof getPropertyById
>;
const mockedGeocodeAddress = geocodeAddress as jest.MockedFunction<
  typeof geocodeAddress
>;
const mockedGetNearbyPlaces = getNearbyPlaces as jest.MockedFunction<
  typeof getNearbyPlaces
>;

describe("GET /api/property/[id]/nearby", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns property + nearby data", async () => {
    mockedGetPropertyById.mockResolvedValue(mockProperty);
    mockedGeocodeAddress.mockResolvedValue({ lat: 38.71, lon: -9.14 });
    mockedGetNearbyPlaces.mockResolvedValue({
      counts: { restaurants: 10 },
      nearest: {
        restaurants: {
          name: "Restaurant A",
          distance: 100,
          mapUrl: "https://maps.google.com",
        },
      },
    });

    const request = new NextRequest(
      "http://localhost:3000/api/property/test-1/nearby",
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "test-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.property.id).toBe("test-1");
    expect(body.nearby.counts.restaurants).toBe(10);
    expect(body.nearbyError).toBe(false);
  });

  it("returns 404 for not-found property", async () => {
    mockedGetPropertyById.mockResolvedValue(undefined);

    const request = new NextRequest(
      "http://localhost:3000/api/property/nonexistent/nearby",
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Property not found");
  });

  it("handles geocoding returning null", async () => {
    mockedGetPropertyById.mockResolvedValue(mockProperty);
    mockedGeocodeAddress.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/property/test-1/nearby",
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "test-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.nearby.counts).toEqual({});
    expect(body.nearby.nearest).toEqual({});
    expect(body.nearbyError).toBe(false);
    expect(mockedGetNearbyPlaces).not.toHaveBeenCalled();
  });
});
