import {
  resolveLocationFromSlugs,
  buildBreadcrumbs,
  searchLocations,
  getDistrictSlugsForRegion,
} from "../locations";

describe("resolveLocationFromSlugs", () => {
  it("returns valid for empty slugs", () => {
    const result = resolveLocationFromSlugs([]);
    expect(result.valid).toBe(true);
    expect(result.region).toBeUndefined();
  });

  it("resolves a valid region", () => {
    const result = resolveLocationFromSlugs(["algarve"]);
    expect(result.valid).toBe(true);
    expect(result.region?.name).toBe("Algarve");
  });

  it("resolves region + district", () => {
    const result = resolveLocationFromSlugs(["algarve", "faro"]);
    expect(result.valid).toBe(true);
    expect(result.region?.name).toBe("Algarve");
    expect(result.district?.name).toBe("Faro");
  });

  it("resolves region + district + municipality", () => {
    const result = resolveLocationFromSlugs(["algarve", "faro", "lagos"]);
    expect(result.valid).toBe(true);
    expect(result.municipality?.name).toBe("Lagos");
  });

  it("returns invalid for unknown slug", () => {
    const result = resolveLocationFromSlugs(["nonexistent"]);
    expect(result.valid).toBe(false);
  });

  it("returns invalid for too many slugs", () => {
    const result = resolveLocationFromSlugs(["a", "b", "c", "d", "e"]);
    expect(result.valid).toBe(false);
  });

  it("returns invalid for valid region but invalid district", () => {
    const result = resolveLocationFromSlugs(["algarve", "nonexistent"]);
    expect(result.valid).toBe(false);
  });
});

describe("buildBreadcrumbs", () => {
  it("returns empty array for empty resolution", () => {
    const result = buildBreadcrumbs({ valid: true }, "en", "buy");
    expect(result).toEqual([]);
  });

  it("returns 1 crumb for region", () => {
    const resolved = resolveLocationFromSlugs(["algarve"]);
    const crumbs = buildBreadcrumbs(resolved, "en", "buy");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("Algarve");
    expect(crumbs[0].href).toBe("/en/buy/algarve");
  });

  it("returns full chain of crumbs", () => {
    const resolved = resolveLocationFromSlugs(["algarve", "faro", "lagos"]);
    const crumbs = buildBreadcrumbs(resolved, "pt", "comprar");
    expect(crumbs).toHaveLength(3);
    expect(crumbs[0].label).toBe("Algarve");
    expect(crumbs[0].href).toBe("/pt/comprar/algarve");
    expect(crumbs[1].label).toBe("Faro");
    expect(crumbs[1].href).toBe("/pt/comprar/algarve/faro");
    expect(crumbs[2].label).toBe("Lagos");
    expect(crumbs[2].href).toBe("/pt/comprar/algarve/faro/lagos");
  });
});

describe("searchLocations", () => {
  it("finds prefix matches", () => {
    const results = searchLocations("Lis");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name === "Lisboa")).toBe(true);
  });

  it("is case-insensitive", () => {
    const results = searchLocations("lis");
    expect(results.some((r) => r.name === "Lisboa")).toBe(true);
  });

  it("is diacritic-insensitive", () => {
    const results = searchLocations("evora");
    expect(results.some((r) => r.name === "Évora")).toBe(true);
  });

  it("respects limit", () => {
    const results = searchLocations("a", 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("returns empty for empty query", () => {
    expect(searchLocations("")).toEqual([]);
  });

  it("returns empty for no matches", () => {
    expect(searchLocations("zzzzzznotexist")).toEqual([]);
  });
});

describe("getDistrictSlugsForRegion", () => {
  it("returns district slugs for a valid region", () => {
    const slugs = getDistrictSlugsForRegion("algarve");
    expect(slugs).toContain("faro");
  });

  it("returns empty array for invalid region", () => {
    expect(getDistrictSlugsForRegion("nonexistent")).toEqual([]);
  });
});
