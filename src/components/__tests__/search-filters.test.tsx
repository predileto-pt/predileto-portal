import {
  renderWithProviders,
  screen,
  mockRouter,
  setMockPathname,
  setMockSearchParams,
} from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SearchFilters } from "../search-filters";

beforeEach(() => {
  jest.clearAllMocks();
  setMockPathname("/en/buy");
  setMockSearchParams("");
});

function getSearchInput() {
  return screen.getByPlaceholderText("Search...");
}

describe("SearchFilters", () => {
  it("renders all filter inputs", () => {
    renderWithProviders(<SearchFilters />);

    expect(getSearchInput()).toBeInTheDocument();
    expect(screen.getByText("Sort By")).toBeInTheDocument();
    expect(screen.getByText("Property Type")).toBeInTheDocument();
    expect(screen.getByText("Bedrooms")).toBeInTheDocument();
    expect(screen.getByText("Min price")).toBeInTheDocument();
    expect(screen.getByText("Max price")).toBeInTheDocument();
  });

  describe("autocomplete", () => {
    it("shows suggestions for 2+ chars", async () => {
      renderWithProviders(<SearchFilters />);
      const user = userEvent.setup();

      await user.type(getSearchInput(), "Lis");

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getAllByText("Lisboa").length).toBeGreaterThanOrEqual(1);
    });

    it("does not show suggestions for 1 char", async () => {
      renderWithProviders(<SearchFilters />);
      const user = userEvent.setup();

      await user.type(getSearchInput(), "L");

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("navigates on suggestion selection", async () => {
      renderWithProviders(<SearchFilters locale="en" listingSlug="buy" />);
      const user = userEvent.setup();

      await user.type(getSearchInput(), "Algarve");

      const suggestion = screen.getByText("Algarve");
      await user.click(suggestion);

      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining("/en/buy/algarve"),
      );
    });
  });

  describe("filter changes update URL params", () => {
    it("updates sort param", async () => {
      renderWithProviders(<SearchFilters />);
      const user = userEvent.setup();

      const sortSelect = screen.getByDisplayValue("Newest");
      await user.selectOptions(sortSelect, "price-desc");

      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining("sort=price-desc"),
      );
    });

    it("updates propertyType param", async () => {
      renderWithProviders(<SearchFilters />);
      const user = userEvent.setup();

      const propertyTypeSelect = screen.getByDisplayValue("All Types");
      await user.selectOptions(propertyTypeSelect, "house");

      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining("propertyType=house"),
      );
    });

    it("updates bedrooms param", async () => {
      renderWithProviders(<SearchFilters />);
      const user = userEvent.setup();

      const bedroomsSelect = screen.getByDisplayValue("Any");
      await user.selectOptions(bedroomsSelect, "2");

      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining("bedrooms=2"),
      );
    });
  });

  it("clears location on X click", async () => {
    const resolved = {
      region: { name: "Algarve", slug: "algarve", children: [] },
      valid: true,
    };

    renderWithProviders(
      <SearchFilters
        locationSlugs={["algarve"]}
        resolved={resolved}
        locale="en"
        listingSlug="buy"
      />,
    );

    const user = userEvent.setup();
    const clearBtn = screen.getByLabelText("Clear location");
    await user.click(clearBtn);

    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining("/en/buy"),
    );
  });

  it("resets page param when filter changes", async () => {
    setMockSearchParams("page=3&sort=newest");

    renderWithProviders(<SearchFilters />);
    const user = userEvent.setup();

    const sortSelect = screen.getByDisplayValue("Newest");
    await user.selectOptions(sortSelect, "price-desc");

    const pushCall = mockRouter.push.mock.calls[0][0];
    expect(pushCall).not.toContain("page=");
    expect(pushCall).toContain("sort=price-desc");
  });
});
