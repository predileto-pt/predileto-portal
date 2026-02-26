import {
  renderWithProviders,
  screen,
  mockRouter,
  setMockPathname,
  setMockSearchParams,
} from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { PropertyCard } from "../property-card";
import type { Property } from "@/lib/types";

const mockProperty: Property = {
  id: "prop-1",
  title: "Modern Apartment",
  slug: "modern-apartment",
  shortDescription: "A modern apartment.",
  fullDescription: "A modern apartment with great views.",
  propertyType: "apartment",
  listingType: "buy",
  price: 250000,
  featured: false,
  address: {
    fullAddress: "Rua Principal 10, Lisboa",
    municipality: "Lisboa",
    district: "Lisboa",
    postalCode: "1000-001",
    country: "Portugal",
  },
  features: { bedrooms: 2, bathrooms: 1, areaSqm: 85 },
  amenities: [],
  images: [{ url: "https://example.com/img.jpg", alt: "Photo" }],
  agent: { name: "", email: "", phone: "", photo: null },
  available: true,
  availableFrom: null,
  sources: [{ name: "Idealista", url: "https://idealista.pt/1" }],
  keywords: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T12:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
  setMockPathname("/en/buy/area-metropolitana-de-lisboa");
  setMockSearchParams("");
});

describe("PropertyCard", () => {
  it("renders title, price, address", () => {
    renderWithProviders(
      <PropertyCard property={mockProperty} selected={false} locale="en" />,
    );

    expect(screen.getByText("Modern Apartment")).toBeInTheDocument();
    expect(screen.getByText(/250/)).toBeInTheDocument(); // price contains 250
    expect(screen.getByText(/Lisboa/)).toBeInTheDocument();
  });

  it("renders property type, bedrooms, area", () => {
    renderWithProviders(
      <PropertyCard property={mockProperty} selected={false} locale="en" />,
    );

    expect(screen.getByText("Apartment")).toBeInTheDocument();
    expect(screen.getByText("T2")).toBeInTheDocument();
    expect(screen.getByText("85 m²")).toBeInTheDocument();
  });

  it("renders source name", () => {
    renderWithProviders(
      <PropertyCard property={mockProperty} selected={false} locale="en" />,
    );

    expect(screen.getByText("Idealista")).toBeInTheDocument();
  });

  it("applies selected styles", () => {
    const { container } = renderWithProviders(
      <PropertyCard property={mockProperty} selected={true} locale="en" />,
    );

    const button = container.querySelector("button");
    expect(button?.className).toContain("border-gray-900");
  });

  it("applies default styles when not selected", () => {
    const { container } = renderWithProviders(
      <PropertyCard property={mockProperty} selected={false} locale="en" />,
    );

    const button = container.querySelector("button");
    expect(button?.className).toContain("border-gray-200");
  });

  it("calls router.push with ?selected={id} on click", async () => {
    renderWithProviders(
      <PropertyCard property={mockProperty} selected={false} locale="en" />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));

    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining("selected=prop-1"),
      expect.anything(),
    );
  });

  it("preserves existing search params when clicking", async () => {
    setMockSearchParams("sort=price-desc&bedrooms=2");

    renderWithProviders(
      <PropertyCard property={mockProperty} selected={false} locale="en" />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));

    const pushCall = mockRouter.push.mock.calls[0][0];
    expect(pushCall).toContain("sort=price-desc");
    expect(pushCall).toContain("bedrooms=2");
    expect(pushCall).toContain("selected=prop-1");
  });
});
