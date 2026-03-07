import { mapRowToProperty } from "../property-mapper";
import type { PropertyRow } from "../db-types";

function makeRow(overrides: Partial<PropertyRow> = {}): PropertyRow {
  return {
    id: "prop-1",
    title: "Test Property",
    listing_type: "venda",
    property_type: "apartamento",
    price: 200000,
    bedrooms: "T2",
    bathrooms: 1,
    area_m2: 80,
    description: "A nice property in a great location.",
    address_full_address: "Rua Principal 10",
    address_city: "Lisboa",
    address_district: "Lisboa",
    address_postal_code: "1000-001",
    address_region: null,
    address_municipality: null,
    address_parish: null,
    images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    features: ["elevator", "parking"],
    sources: [{ name: "Idealista", url: "https://idealista.pt/1" }],
    source: null,
    url: null,
    scraped_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
    ...overrides,
  };
}

describe("mapRowToProperty", () => {
  describe("listing_type mapping", () => {
    it('maps "venda" to "buy"', () => {
      expect(mapRowToProperty(makeRow({ listing_type: "venda" })).listingType).toBe("buy");
    });

    it('maps "arrendar" to "rent"', () => {
      expect(mapRowToProperty(makeRow({ listing_type: "arrendar" })).listingType).toBe("rent");
    });

    it('maps "arrendamento" to "rent"', () => {
      expect(mapRowToProperty(makeRow({ listing_type: "arrendamento" })).listingType).toBe("rent");
    });

    it('maps null to "buy" (default)', () => {
      expect(mapRowToProperty(makeRow({ listing_type: null })).listingType).toBe("buy");
    });
  });

  describe("property_type mapping", () => {
    it('maps "apartamento" to "apartment"', () => {
      expect(mapRowToProperty(makeRow({ property_type: "apartamento" })).propertyType).toBe("apartment");
    });

    it('maps "casa" to "house"', () => {
      expect(mapRowToProperty(makeRow({ property_type: "casa" })).propertyType).toBe("house");
    });

    it('maps "moradia" to "house"', () => {
      expect(mapRowToProperty(makeRow({ property_type: "moradia" })).propertyType).toBe("house");
    });

    it('maps null to "apartment" (default)', () => {
      expect(mapRowToProperty(makeRow({ property_type: null })).propertyType).toBe("apartment");
    });
  });

  describe("bedrooms parsing", () => {
    it('parses "T2" to 2', () => {
      expect(mapRowToProperty(makeRow({ bedrooms: "T2" })).features.bedrooms).toBe(2);
    });

    it('parses "T0" to 0', () => {
      expect(mapRowToProperty(makeRow({ bedrooms: "T0" })).features.bedrooms).toBe(0);
    });

    it("parses null to 0", () => {
      expect(mapRowToProperty(makeRow({ bedrooms: null })).features.bedrooms).toBe(0);
    });

    it("parses numeric string", () => {
      expect(mapRowToProperty(makeRow({ bedrooms: "3" })).features.bedrooms).toBe(3);
    });
  });

  describe("images", () => {
    it("parses array of strings into image objects", () => {
      const result = mapRowToProperty(makeRow({ images: ["https://img.com/1.jpg"] }));
      expect(result.images).toEqual([{ url: "https://img.com/1.jpg", alt: "Test Property" }]);
    });

    it("parses JSON string into image objects", () => {
      const result = mapRowToProperty(
        makeRow({ images: '["https://img.com/1.jpg"]' as unknown as string[] }),
      );
      expect(result.images).toEqual([{ url: "https://img.com/1.jpg", alt: "Test Property" }]);
    });

    it("handles null images", () => {
      expect(mapRowToProperty(makeRow({ images: null })).images).toEqual([]);
    });
  });

  describe("sources", () => {
    it("uses sources array when present", () => {
      const result = mapRowToProperty(
        makeRow({ sources: [{ name: "Source1", url: "https://s1.com" }] }),
      );
      expect(result.sources).toEqual([{ name: "Source1", url: "https://s1.com" }]);
    });

    it("falls back to source + url fields", () => {
      const result = mapRowToProperty(
        makeRow({ sources: null, source: "FallbackSource", url: "https://fallback.com" }),
      );
      expect(result.sources).toEqual([{ name: "FallbackSource", url: "https://fallback.com" }]);
    });

    it("returns empty array when no sources available", () => {
      const result = mapRowToProperty(makeRow({ sources: null, source: null, url: null }));
      expect(result.sources).toEqual([]);
    });
  });

  describe("description truncation", () => {
    it("truncates long descriptions to 200 chars for shortDescription", () => {
      const longDesc = "A".repeat(300);
      const result = mapRowToProperty(makeRow({ description: longDesc }));
      expect(result.shortDescription.length).toBeLessThanOrEqual(203); // 200 + "..."
      expect(result.shortDescription.endsWith("...")).toBe(true);
    });

    it("keeps short descriptions as-is", () => {
      const result = mapRowToProperty(makeRow({ description: "Short desc" }));
      expect(result.shortDescription).toBe("Short desc");
    });
  });

  describe("slug generation", () => {
    it("generates slug from title", () => {
      const result = mapRowToProperty(makeRow({ title: "Beautiful Apartment in São Paulo" }));
      expect(result.slug).toBe("beautiful-apartment-in-sao-paulo");
    });
  });

  describe("null defaults", () => {
    it("defaults price to 0 when null", () => {
      expect(mapRowToProperty(makeRow({ price: null })).price).toBe(0);
    });

    it("defaults area to 0 when null", () => {
      expect(mapRowToProperty(makeRow({ area_m2: null })).features.areaSqm).toBe(0);
    });

    it("defaults bathrooms to 0 when null", () => {
      expect(mapRowToProperty(makeRow({ bathrooms: null })).features.bathrooms).toBe(0);
    });
  });
});
