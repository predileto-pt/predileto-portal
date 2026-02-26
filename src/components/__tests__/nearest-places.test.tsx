import { render, screen } from "@testing-library/react";
import { NearestPlaces } from "../nearest-places";
import enDict from "@/dictionaries/en.json";

const dict = enDict;

describe("NearestPlaces", () => {
  it("renders place names, distances, and Google Maps links", () => {
    const nearest = {
      schools: { name: "Escola da Baixa", distance: 350, mapUrl: "https://www.google.com/maps/search/?api=1&query=38.71,-9.14" },
      hospitals: { name: "Hospital São José", distance: 1200, mapUrl: "https://www.google.com/maps/search/?api=1&query=38.72,-9.13" },
      supermarkets: { name: "Pingo Doce", distance: 200, mapUrl: "https://www.google.com/maps/search/?api=1&query=38.71,-9.14" },
    };

    render(<NearestPlaces nearest={nearest} dict={dict} />);

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

  it("renders nothing when no places available", () => {
    const nearest = {
      schools: null,
      hospitals: null,
      supermarkets: null,
    };

    const { container } = render(<NearestPlaces nearest={nearest} dict={dict} />);
    expect(container.innerHTML).toBe("");
  });

  it("only renders places that are not null", () => {
    const nearest = {
      schools: { name: "Escola Test", distance: 500, mapUrl: "https://maps.google.com" },
      hospitals: null,
      supermarkets: null,
    };

    render(<NearestPlaces nearest={nearest} dict={dict} />);
    expect(screen.getByText("Escola Test")).toBeInTheDocument();
    expect(screen.getAllByText("View on Google Maps")).toHaveLength(1);
  });
});
