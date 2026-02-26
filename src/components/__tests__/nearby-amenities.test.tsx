import { render, screen } from "@testing-library/react";
import { NearbyAmenities } from "../nearby-amenities";
import enDict from "@/dictionaries/en.json";

const dict = enDict;

describe("NearbyAmenities", () => {
  it("renders amenity counts grid", () => {
    const counts = { restaurants: 10, hospitals: 3, schools: 5, banks: 0, pharmacies: 2, supermarkets: 0 };
    render(<NearbyAmenities counts={counts} dict={dict} />);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("hides amenities with count 0", () => {
    const counts = { restaurants: 10, hospitals: 0, schools: 0, banks: 0, pharmacies: 0, supermarkets: 0 };
    render(<NearbyAmenities counts={counts} dict={dict} />);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Restaurants")).toBeInTheDocument();
    expect(screen.queryByText("Hospitals")).not.toBeInTheDocument();
  });

  it("renders nothing when all counts are 0", () => {
    const counts = { restaurants: 0, hospitals: 0, schools: 0, banks: 0, pharmacies: 0, supermarkets: 0 };
    const { container } = render(<NearbyAmenities counts={counts} dict={dict} />);

    expect(container.innerHTML).toBe("");
  });
});
