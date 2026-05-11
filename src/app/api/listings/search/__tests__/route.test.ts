import { NextRequest } from "next/server";
import type { PaginatedListings } from "@/lib/estate-os";

jest.mock("@/lib/estate-os", () => {
  const actual = jest.requireActual("@/lib/estate-os");
  return {
    ...actual,
    fetchSearchProperties: jest.fn(),
  };
});

import {
  EstateOsCursorError,
  EstateOsValidationError,
  fetchSearchProperties,
} from "@/lib/estate-os";
import { GET } from "../route";

const mockedFetch = fetchSearchProperties as jest.MockedFunction<
  typeof fetchSearchProperties
>;

const emptyPayload: PaginatedListings = {
  items: [],
  next_cursor: null,
  limit: 20,
};

describe("GET /api/listings/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("forwards q, location, filter, and cursor params to the upstream helper", async () => {
    mockedFetch.mockResolvedValue(emptyPayload);

    const url =
      "http://localhost:3000/api/listings/search?q=apartamento%20com%20vista&district=Lisboa&listing_type=sale&typology=apartment&min_price=200000&max_price=400000&limit=20&cursor=eyJ2IjoxfQ";
    const res = await GET(new NextRequest(url));

    expect(res.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith({
      q: "apartamento com vista",
      district: "Lisboa",
      listingType: "sale",
      typology: "apartment",
      minPrice: 200000,
      maxPrice: 400000,
      limit: 20,
      cursor: "eyJ2IjoxfQ",
    });
  });

  it("omits empty q and unknown listing/typology values", async () => {
    mockedFetch.mockResolvedValue(emptyPayload);

    const url =
      "http://localhost:3000/api/listings/search?q=&listing_type=junk&typology=junk";
    await GET(new NextRequest(url));

    expect(mockedFetch).toHaveBeenCalledWith({});
  });

  it("returns 422 with the upstream code on validation errors", async () => {
    mockedFetch.mockRejectedValue(
      new EstateOsValidationError(
        "location_required_for_search",
        "Location required when q is set",
      ),
    );

    const url = "http://localhost:3000/api/listings/search?q=test";
    const res = await GET(new NextRequest(url));

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("location_required_for_search");
  });

  it("maps upstream 400 cursor errors to a 400 with the code", async () => {
    mockedFetch.mockRejectedValue(
      new EstateOsCursorError("cursor_filter_mismatch"),
    );

    const url =
      "http://localhost:3000/api/listings/search?district=Lisboa&cursor=stale";
    const res = await GET(new NextRequest(url));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("cursor_filter_mismatch");
  });

  it("maps upstream 5xx / network errors to 502", async () => {
    mockedFetch.mockRejectedValue(new Error("estate-os error: 500"));

    const url = "http://localhost:3000/api/listings/search?q=test&district=Lisboa";
    const res = await GET(new NextRequest(url));

    expect(res.status).toBe(502);
  });
});
