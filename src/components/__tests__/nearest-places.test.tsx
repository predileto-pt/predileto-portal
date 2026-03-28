import { render, screen } from "@testing-library/react";
import { NearestPlaces } from "../nearest-places";
import type { PropertyAmenityResponse } from "@/lib/types/amenities";
import enDict from "@/dictionaries/en.json";

const dict = enDict;

function makeAmenity(
  category: PropertyAmenityResponse["category"],
  opts: { name: string; distance: number; mapsUrl?: string },
): PropertyAmenityResponse {
  return {
    id: `id-${category}`,
    property_id: "prop-1",
    category,
    nearest_name: opts.name,
    nearest_distance_meters: opts.distance,
    nearest_latitude: 38.7,
    nearest_longitude: -9.1,
    total_count: 1,
    nearest_place_id: null,
    nearest_google_maps_url: opts.mapsUrl ?? null,
    top_places: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

describe("NearestPlaces", () => {
  it("renders place names, distances, and Google Maps links", () => {
    const amenities = [
      makeAmenity("school", { name: "Escola da Baixa", distance: 350, mapsUrl: "https://www.google.com/maps/place/?q=place_id:abc" }),
      makeAmenity("hospital", { name: "Hospital São José", distance: 1200, mapsUrl: "https://www.google.com/maps/place/?q=place_id:def" }),
      makeAmenity("grocery", { name: "Pingo Doce", distance: 200, mapsUrl: "https://www.google.com/maps/place/?q=place_id:ghi" }),
    ];

    render(<NearestPlaces amenities={amenities} dict={dict} />);

    expect(screen.getByText("Escola da Baixa")).toBeInTheDocument();
    expect(screen.getByText("Hospital São José")).toBeInTheDocument();
    expect(screen.getByText("Pingo Doce")).toBeInTheDocument();

    // Distance formatting: <1000 = m, >=1000 = km
    expect(screen.getByText(/350 m/)).toBeInTheDocument();
    expect(screen.getByText(/1\.2 km/)).toBeInTheDocument();
    expect(screen.getByText(/200 m/)).toBeInTheDocument();

    // Google Maps links
    const links = screen.getAllByText("View on Google Maps");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", expect.stringContaining("google.com/maps"));
    expect(links[0]).toHaveAttribute("target", "_blank");
  });

  it("renders nothing when amenities array is empty", () => {
    const { container } = render(<NearestPlaces amenities={[]} dict={dict} />);
    expect(container.innerHTML).toBe("");
  });

  it("only renders amenities that exist", () => {
    const amenities = [
      makeAmenity("school", { name: "Escola Test", distance: 500 }),
    ];

    render(<NearestPlaces amenities={amenities} dict={dict} />);
    expect(screen.getByText("Escola Test")).toBeInTheDocument();
    expect(screen.getAllByText("View on Google Maps")).toHaveLength(1);
  });

  it("falls back to coordinate-based URL when no google_maps_url", () => {
    const amenities = [
      makeAmenity("school", { name: "Escola Test", distance: 500 }),
    ];

    render(<NearestPlaces amenities={amenities} dict={dict} />);
    const link = screen.getByText("View on Google Maps");
    expect(link).toHaveAttribute("href", expect.stringContaining("38.7"));
  });
});
