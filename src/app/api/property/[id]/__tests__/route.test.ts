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

import { getPropertyById } from "@/lib/api";
import { GET } from "../route";

const mockedGetPropertyById = getPropertyById as jest.MockedFunction<
  typeof getPropertyById
>;

describe("GET /api/property/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns property data for valid id", async () => {
    mockedGetPropertyById.mockResolvedValue(mockProperty);

    const request = new NextRequest("http://localhost:3000/api/property/test-1");
    const response = await GET(request, {
      params: Promise.resolve({ id: "test-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe("test-1");
    expect(body.title).toBe("Test Property");
    expect(body.price).toBe(200000);
    expect(body.features.bedrooms).toBe(2);
  });

  it("returns 404 for not-found property", async () => {
    mockedGetPropertyById.mockResolvedValue(undefined);

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
});
