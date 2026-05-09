import {
  renderWithProviders,
  screen,
  setMockPathname,
  setMockSearchParams,
} from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { PropertyFeedCard } from "../property-feed-card";
import type { Property, PropertyImage } from "@/lib/types";

function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
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
    images: [{ url: "https://example.com/a.jpg", alt: "A" }],
    agent: { name: "", email: "", phone: "", photo: null },
    available: true,
    availableFrom: null,
    sources: [{ name: "Idealista", url: "https://idealista.pt/1" }],
    keywords: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T12:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  setMockPathname("/en/buy/lisboa");
  setMockSearchParams("");
  // jsdom doesn't implement scrollTo on elements
  Element.prototype.scrollTo = jest.fn();
});

describe("PropertyFeedCard", () => {
  it("renders title, price, location, type chip, and Ver detalhe link", () => {
    renderWithProviders(
      <PropertyFeedCard property={makeProperty()} locale="en" />,
    );

    expect(screen.getByText("Modern Apartment")).toBeInTheDocument();
    expect(screen.getByText(/250/)).toBeInTheDocument();
    expect(screen.getAllByText(/Lisboa/).length).toBeGreaterThan(0);
    const detailLinks = screen.getAllByRole("link", {
      name: /detail|detalhe/i,
    });
    expect(detailLinks.length).toBeGreaterThan(0);
    expect(detailLinks[0]).toHaveAttribute("href", "/en/imovel/prop-1");
  });

  it("renders carousel arrows and dots when there are 2+ images", () => {
    const images: PropertyImage[] = [
      { url: "https://example.com/a.jpg", alt: "A" },
      { url: "https://example.com/b.jpg", alt: "B" },
      { url: "https://example.com/c.jpg", alt: "C" },
    ];
    renderWithProviders(
      <PropertyFeedCard property={makeProperty({ images })} locale="en" />,
    );

    expect(
      screen.getByRole("button", { name: /previous|anterior/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /next|seguinte/i }),
    ).toBeInTheDocument();
    // 3 dots (one per slide)
    const dots = screen.getAllByRole("button", { name: /\d+\/\d+/ });
    expect(dots).toHaveLength(3);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("hides carousel controls when there is exactly one image", () => {
    renderWithProviders(
      <PropertyFeedCard
        property={makeProperty({
          images: [{ url: "https://example.com/only.jpg", alt: "" }],
        })}
        locale="en"
      />,
    );

    expect(
      screen.queryByRole("button", { name: /previous|anterior/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /next|seguinte/i }),
    ).not.toBeInTheDocument();
  });

  it("falls back to 3 mock placeholders when property has no images", () => {
    renderWithProviders(
      <PropertyFeedCard
        property={makeProperty({ images: [] })}
        locale="en"
      />,
    );

    const dots = screen.getAllByRole("button", { name: /\d+\/\d+/ });
    expect(dots).toHaveLength(3);
    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBeGreaterThanOrEqual(3);
    expect(imgs[0].getAttribute("src")).toMatch(/\/mock-listings\//);
  });

  it("advances the slide indicator when the next button is clicked", async () => {
    const user = userEvent.setup();
    const images: PropertyImage[] = [
      { url: "https://example.com/a.jpg", alt: "A" },
      { url: "https://example.com/b.jpg", alt: "B" },
    ];
    renderWithProviders(
      <PropertyFeedCard property={makeProperty({ images })} locale="en" />,
    );

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /next|seguinte/i }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });
});
