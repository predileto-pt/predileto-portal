import {
  renderWithProviders,
  screen,
  waitFor,
  setMockSearchParams,
} from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { PropertyDetailPanel } from "../property-detail-panel";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PropertyDetailPanel", () => {
  it("renders nothing when no selected param", () => {
    setMockSearchParams("");
    const { container } = renderWithProviders(
      <PropertyDetailPanel locale="en" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows loading skeleton during fetch", () => {
    setMockSearchParams("selected=test-property-1");
    renderWithProviders(<PropertyDetailPanel locale="en" />);

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders property details after fetch", async () => {
    setMockSearchParams("selected=test-property-1");
    renderWithProviders(<PropertyDetailPanel locale="en" />);

    await waitFor(() => {
      expect(
        screen.getByText("Beautiful Apartment in Lisbon"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/250/)).toBeInTheDocument();
    expect(screen.getByText(/Lisboa/)).toBeInTheDocument();
    expect(screen.getByText("T2")).toBeInTheDocument();
    expect(screen.getByText("85 m²")).toBeInTheDocument();
  });

  it("renders expandable description toggle", async () => {
    setMockSearchParams("selected=test-property-1");
    renderWithProviders(<PropertyDetailPanel locale="en" />);

    await waitFor(() => {
      expect(
        screen.getByText("Beautiful Apartment in Lisbon"),
      ).toBeInTheDocument();
    });

    const showMoreBtn = screen.getByText("Show more");
    expect(showMoreBtn).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(showMoreBtn);
    expect(screen.getByText("Show less")).toBeInTheDocument();
  });

  it("renders source link", async () => {
    setMockSearchParams("selected=test-property-1");
    renderWithProviders(<PropertyDetailPanel locale="en" />);

    await waitFor(() => {
      expect(screen.getByText("Idealista")).toBeInTheDocument();
    });

    const link = screen.getByText("Idealista");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://www.idealista.pt/example",
    );
  });

  it("shows error on failed fetch", async () => {
    server.use(
      http.get("/api/property/:id", () => {
        return HttpResponse.json(
          { error: "Server error" },
          { status: 500 },
        );
      }),
    );

    setMockSearchParams("selected=error-property");
    renderWithProviders(<PropertyDetailPanel locale="en" />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Could not load details for this property. Please try again later.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("renders nearby amenities after nearby fetch", async () => {
    setMockSearchParams("selected=test-property-1");
    renderWithProviders(<PropertyDetailPanel locale="en" />);

    await waitFor(() => {
      expect(screen.getByText("Nearby Amenities")).toBeInTheDocument();
    });

    expect(screen.getByText("15")).toBeInTheDocument(); // restaurants count
    expect(screen.getByText("Restaurants")).toBeInTheDocument();
  });

  it("renders nearest places after nearby fetch", async () => {
    setMockSearchParams("selected=test-property-1");
    renderWithProviders(<PropertyDetailPanel locale="en" />);

    await waitFor(() => {
      expect(screen.getByText("Escola Básica da Baixa")).toBeInTheDocument();
    });

    expect(screen.getByText(/350 m/)).toBeInTheDocument();
    expect(screen.getByText(/1\.2 km/)).toBeInTheDocument();
  });
});
