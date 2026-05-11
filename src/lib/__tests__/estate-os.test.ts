import type { ListedProperty } from "@/lib/estate-os";
import {
  EstateOsValidationError,
  fetchSearchProperties,
  mapListedToSearchResult,
} from "@/lib/estate-os";

const originalFetch = global.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetchSearchProperties URL building", () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("omits q and unset filters", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      jsonResponse({ items: [], total: 0, limit: 50, offset: 0 }),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    await fetchSearchProperties({});

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/listings\/properties$/);
  });

  it("encodes q + parish + price + listing_type", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      jsonResponse({ items: [], total: 0, limit: 50, offset: 0 }),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    await fetchSearchProperties({
      q: "casa com piscina",
      parish: "Cascais",
      listingType: "sale",
      typology: "house",
      minPrice: 300000,
      maxPrice: 600000,
      limit: 20,
      offset: 0,
    });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("q=casa+com+piscina");
    expect(url).toContain("parish=Cascais");
    expect(url).toContain("listing_type=sale");
    expect(url).toContain("typology=house");
    expect(url).toContain("min_price=300000");
    expect(url).toContain("max_price=600000");
    expect(url).toContain("limit=20");
    expect(url).toContain("offset=0");
  });

  it("throws EstateOsValidationError on 422 with code", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      jsonResponse(
        {
          detail: {
            code: "location_required_for_search",
            message: "Location required",
          },
        },
        422,
      ),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    await expect(
      fetchSearchProperties({ q: "anything" }),
    ).rejects.toBeInstanceOf(EstateOsValidationError);
  });

  it("throws generic Error on upstream 5xx", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response("upstream blew up", { status: 503 }),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    await expect(
      fetchSearchProperties({ q: "anything", district: "Lisboa" }),
    ).rejects.toThrow(/estate-os error: 503/);
  });
});

describe("mapListedToSearchResult", () => {
  const base: ListedProperty = {
    id: "p-1",
    organization_id: "org-1",
    address: "Rua A, Lisboa",
    listing_type: "sale",
    typology: "apartment",
    description: "Lovely.",
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
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    prices: [{ id: "x", amount: "300000", listing_type: "sale" }],
    images: [
      {
        id: "img-1",
        filename: "front.jpg",
        content_type: "image/jpeg",
        size_bytes: 1,
        display_order: 0,
        download_url: "https://example.com/front.jpg",
      },
    ],
  };

  it("maps the happy-path fields", () => {
    const result = mapListedToSearchResult(base);
    expect(result.id).toBe("p-1");
    expect(result.title).toBe("Rua A, Lisboa");
    expect(result.description).toBe("Lovely.");
    expect(result.price).toBe(300000);
    expect(result.areaSqm).toBe(80);
    expect(result.bedrooms).toBe(2);
    expect(result.listingType).toBe("buy");
    expect(result.media).toHaveLength(1);
    expect(result.media?.[0]).toEqual({
      type: "image",
      url: "https://example.com/front.jpg",
      alt: "front.jpg",
    });
  });

  it("substitutes empty string for null description", () => {
    const result = mapListedToSearchResult({ ...base, description: null });
    expect(result.description).toBe("");
  });

  it("defaults price to 0 when prices array is empty", () => {
    const result = mapListedToSearchResult({ ...base, prices: [] });
    expect(result.price).toBe(0);
  });

  it("defaults numeric characteristics to 0 when null", () => {
    const result = mapListedToSearchResult({
      ...base,
      characteristics: null,
    });
    expect(result.areaSqm).toBe(0);
    expect(result.bedrooms).toBe(0);
  });

  it("yields an empty media array when images are empty", () => {
    const result = mapListedToSearchResult({ ...base, images: [] });
    expect(result.media).toEqual([]);
  });

  it("maps purchase listing_type to rent", () => {
    const result = mapListedToSearchResult({
      ...base,
      listing_type: "purchase",
    });
    expect(result.listingType).toBe("rent");
  });
});
