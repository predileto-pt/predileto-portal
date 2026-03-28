import { render, screen } from "@testing-library/react";
import { NearbyAmenities } from "../nearby-amenities";
import type { PropertyAmenityResponse } from "@/lib/types/amenities";
import enDict from "@/dictionaries/en.json";

const dict = enDict;

function makeAmenity(
  category: PropertyAmenityResponse["category"],
  totalCount: number,
): PropertyAmenityResponse {
  return {
    id: `id-${category}`,
    property_id: "prop-1",
    category,
    nearest_name: `Nearest ${category}`,
    nearest_distance_meters: 100,
    nearest_latitude: 38.7,
    nearest_longitude: -9.1,
    total_count: totalCount,
    nearest_place_id: null,
    nearest_google_maps_url: null,
    top_places: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

describe("NearbyAmenities", () => {
  it("renders amenity counts grid", () => {
    const amenities = [
      makeAmenity("restaurant", 10),
      makeAmenity("hospital", 3),
      makeAmenity("school", 5),
      makeAmenity("pharmacy", 2),
    ];
    render(<NearbyAmenities amenities={amenities} dict={dict} />);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("hides amenities with count 0", () => {
    const amenities = [
      makeAmenity("restaurant", 10),
      makeAmenity("hospital", 0),
    ];
    render(<NearbyAmenities amenities={amenities} dict={dict} />);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Restaurants")).toBeInTheDocument();
    expect(screen.queryByText("Hospitals")).not.toBeInTheDocument();
  });

  it("renders nothing when all counts are 0", () => {
    const amenities = [
      makeAmenity("restaurant", 0),
      makeAmenity("hospital", 0),
    ];
    const { container } = render(<NearbyAmenities amenities={amenities} dict={dict} />);

    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when amenities array is empty", () => {
    const { container } = render(<NearbyAmenities amenities={[]} dict={dict} />);

    expect(container.innerHTML).toBe("");
  });
});
