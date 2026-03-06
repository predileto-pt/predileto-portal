import {
  renderWithProviders,
  screen,
  waitFor,
  setMockSearchParams,
  setMockPathname,
} from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { BookingClientPage } from "../booking-client-page";

// Mock metrics to avoid PostHog in tests
jest.mock("@/lib/metrics", () => ({
  metrics: {
    trackBookingStarted: jest.fn(),
    trackBookingStep: jest.fn(),
    trackBookingCompleted: jest.fn(),
    trackBookingAbandoned: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  setMockPathname("/en/agendar/test-property-1");
  setMockSearchParams("");
  // Clear cookies
  document.cookie = "booking-step-test-property-1=; max-age=0";
});

describe("BookingClientPage", () => {
  it("renders step 1 by default", () => {
    renderWithProviders(
      <BookingClientPage locale="en" propertyId="test-property-1" />,
    );

    expect(
      screen.getByText("Visit Terms and Conditions"),
    ).toBeInTheDocument();
  });

  it("continue button is disabled until checkbox is checked", () => {
    renderWithProviders(
      <BookingClientPage locale="en" propertyId="test-property-1" />,
    );

    const continueBtn = screen.getByRole("button", { name: "Continue" });
    expect(continueBtn).toBeDisabled();
  });

  it("advances to step 2 after agreement", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <BookingClientPage locale="en" propertyId="test-property-1" />,
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    const continueBtn = screen.getByRole("button", { name: "Continue" });
    await user.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByText("Personal Info")).toBeInTheDocument();
    });
  });

  it("tracks booking started via metrics", async () => {
    const { metrics } = await import("@/lib/metrics");

    renderWithProviders(
      <BookingClientPage locale="en" propertyId="test-property-1" />,
    );

    expect(metrics.trackBookingStarted).toHaveBeenCalledWith(
      "test-property-1",
    );
  });

  it("shows back button linking to locale root", () => {
    renderWithProviders(
      <BookingClientPage locale="en" propertyId="test-property-1" />,
    );

    const backLink = screen.getByRole("link", { name: /back/i });
    expect(backLink).toHaveAttribute("href", "/en");
  });

  it("shows progress bar", () => {
    const { container } = renderWithProviders(
      <BookingClientPage locale="en" propertyId="test-property-1" />,
    );

    expect(container.querySelector(".fixed.top-0")).toBeInTheDocument();
  });
});
