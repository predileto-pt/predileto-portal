import { http, HttpResponse } from "msw";

export const mockProperty = {
  id: "test-property-1",
  title: "Beautiful Apartment in Lisbon",
  price: 250000,
  propertyType: "apartment",
  address: {
    fullAddress: "Rua Augusta 100, Lisboa",
    municipality: "Lisboa",
    district: "Lisboa",
    region: "area-metropolitana-de-lisboa",
    postalCode: "1100-001",
    country: "Portugal",
  },
  features: {
    bedrooms: 2,
    bathrooms: 1,
    areaSqm: 85,
  },
  fullDescription:
    "A stunning apartment located in the heart of Lisbon, featuring modern finishes, natural light, and a fantastic view of the river. This property is perfect for families or professionals looking for a central location with easy access to public transport, restaurants, and cultural attractions.",
  sources: [{ name: "Idealista", url: "https://www.idealista.pt/example" }],
};

export const mockNearbyData = {
  property: mockProperty,
  nearby: {
    counts: {
      restaurants: 15,
      hospitals: 2,
      schools: 5,
      banks: 8,
      pharmacies: 4,
      supermarkets: 3,
    },
    nearest: {
      schools: {
        name: "Escola Básica da Baixa",
        distance: 350,
        mapUrl: "https://www.google.com/maps/search/?api=1&query=38.71,-9.14",
      },
      hospitals: {
        name: "Hospital de São José",
        distance: 1200,
        mapUrl: "https://www.google.com/maps/search/?api=1&query=38.72,-9.13",
      },
      supermarkets: {
        name: "Pingo Doce Baixa",
        distance: 200,
        mapUrl: "https://www.google.com/maps/search/?api=1&query=38.71,-9.14",
      },
    },
  },
  nearbyError: false,
};

export const handlers = [
  http.get("/api/property/not-found", () => {
    return HttpResponse.json({ error: "Property not found" }, { status: 404 });
  }),

  http.get("/api/property/nearby-error/nearby", () => {
    return HttpResponse.json({
      property: mockProperty,
      nearby: { counts: {}, nearest: {} },
      nearbyError: "Geocoding failed",
    });
  }),

  http.get("/api/property/:id/nearby", () => {
    return HttpResponse.json(mockNearbyData);
  }),

  http.get("/api/property/:id", () => {
    return HttpResponse.json(mockProperty);
  }),
];
