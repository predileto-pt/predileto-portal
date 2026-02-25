import locationData from "@/data/portugal-locations.json";

// --- Types ---

export interface LocationNode {
  name: string;
  slug: string;
  children: LocationNode[];
}

export interface ResolvedLocation {
  region?: LocationNode;
  district?: LocationNode;
  municipality?: LocationNode;
  parish?: LocationNode;
  valid: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface LocationSearchResult {
  name: string;
  context: string;
  level: "region" | "district" | "municipality" | "parish";
  slugs: string[];
}

// --- Data (loaded once at module init) ---

const regions: LocationNode[] = locationData as LocationNode[];

// Lookup maps built once
const regionBySlug = new Map<string, LocationNode>();
const districtBySlug = new Map<string, { district: LocationNode; region: LocationNode }>();
const municipalityBySlug = new Map<
  string,
  { municipality: LocationNode; district: LocationNode; region: LocationNode }
>();

for (const region of regions) {
  regionBySlug.set(region.slug, region);
  for (const district of region.children) {
    districtBySlug.set(district.slug, { district, region });
    for (const municipality of district.children) {
      municipalityBySlug.set(municipality.slug, { municipality, district, region });
    }
  }
}

// --- Slug resolution ---

export function resolveLocationFromSlugs(slugs: string[]): ResolvedLocation {
  if (slugs.length === 0) return { valid: true };
  if (slugs.length > 4) return { valid: false };

  const region = regionBySlug.get(slugs[0]);
  if (!region) return { valid: false };

  if (slugs.length === 1) return { region, valid: true };

  const district = region.children.find((d) => d.slug === slugs[1]);
  if (!district) return { valid: false };

  if (slugs.length === 2) return { region, district, valid: true };

  const municipality = district.children.find((c) => c.slug === slugs[2]);
  if (!municipality) return { valid: false };

  if (slugs.length === 3) return { region, district, municipality, valid: true };

  const parish = municipality.children.find((f) => f.slug === slugs[3]);
  if (!parish) return { valid: false };

  return { region, district, municipality, parish, valid: true };
}

// --- Expansion helpers ---

export function getDistrictSlugsForRegion(regionSlug: string): string[] {
  const region = regionBySlug.get(regionSlug);
  if (!region) return [];
  return region.children.map((d) => d.slug);
}

export function getDistrictNamesForRegion(regionSlug: string): string[] {
  const region = regionBySlug.get(regionSlug);
  if (!region) return [];
  return region.children.map((d) => d.name);
}

// --- Reverse lookups ---

export function lookupRegionForDistrict(
  districtSlug: string,
): LocationNode | undefined {
  return districtBySlug.get(districtSlug)?.region;
}

export function lookupRegionForDistrictName(
  districtName: string,
): LocationNode | undefined {
  for (const region of regions) {
    for (const district of region.children) {
      if (district.name === districtName) return region;
    }
  }
  return undefined;
}

// --- Breadcrumbs ---

export function buildBreadcrumbs(
  resolved: ResolvedLocation,
  locale: string,
  listingSlug: string,
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [];
  let path = `/${locale}/${listingSlug}`;

  if (resolved.region) {
    path += `/${resolved.region.slug}`;
    crumbs.push({ label: resolved.region.name, href: path });
  }
  if (resolved.district) {
    path += `/${resolved.district.slug}`;
    crumbs.push({ label: resolved.district.name, href: path });
  }
  if (resolved.municipality) {
    path += `/${resolved.municipality.slug}`;
    crumbs.push({ label: resolved.municipality.name, href: path });
  }
  if (resolved.parish) {
    path += `/${resolved.parish.slug}`;
    crumbs.push({ label: resolved.parish.name, href: path });
  }

  return crumbs;
}

// --- Dropdown data ---

export function getRegions(): LocationNode[] {
  return regions;
}

export function getDistricts(regionSlug: string): LocationNode[] {
  const region = regionBySlug.get(regionSlug);
  return region?.children ?? [];
}

export function getMunicipalities(
  regionSlug: string,
  districtSlug: string,
): LocationNode[] {
  const region = regionBySlug.get(regionSlug);
  if (!region) return [];
  const district = region.children.find((d) => d.slug === districtSlug);
  return district?.children ?? [];
}

export function getParishes(
  regionSlug: string,
  districtSlug: string,
  municipalitySlug: string,
): LocationNode[] {
  const region = regionBySlug.get(regionSlug);
  if (!region) return [];
  const district = region.children.find((d) => d.slug === districtSlug);
  if (!district) return [];
  const municipality = district.children.find((c) => c.slug === municipalitySlug);
  return municipality?.children ?? [];
}

// --- Search ---

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function searchLocations(
  query: string,
  limit: number = 10,
): LocationSearchResult[] {
  const q = normalize(query.trim());
  if (!q) return [];

  const startsWithMatches: LocationSearchResult[] = [];
  const substringMatches: LocationSearchResult[] = [];

  for (const region of regions) {
    const rNorm = normalize(region.name);
    const rMatch = rNorm.startsWith(q) ? "starts" : rNorm.includes(q) ? "sub" : null;
    if (rMatch) {
      const result: LocationSearchResult = {
        name: region.name,
        context: "Region",
        level: "region",
        slugs: [region.slug],
      };
      (rMatch === "starts" ? startsWithMatches : substringMatches).push(result);
    }

    for (const district of region.children) {
      const dNorm = normalize(district.name);
      const dMatch = dNorm.startsWith(q) ? "starts" : dNorm.includes(q) ? "sub" : null;
      if (dMatch) {
        const result: LocationSearchResult = {
          name: district.name,
          context: `District, ${region.name}`,
          level: "district",
          slugs: [region.slug, district.slug],
        };
        (dMatch === "starts" ? startsWithMatches : substringMatches).push(result);
      }

      for (const municipality of district.children) {
        const mNorm = normalize(municipality.name);
        const mMatch = mNorm.startsWith(q) ? "starts" : mNorm.includes(q) ? "sub" : null;
        if (mMatch) {
          const result: LocationSearchResult = {
            name: municipality.name,
            context: `Municipality, ${district.name}, ${region.name}`,
            level: "municipality",
            slugs: [region.slug, district.slug, municipality.slug],
          };
          (mMatch === "starts" ? startsWithMatches : substringMatches).push(result);
        }

        for (const parish of municipality.children) {
          const pNorm = normalize(parish.name);
          const pMatch = pNorm.startsWith(q) ? "starts" : pNorm.includes(q) ? "sub" : null;
          if (pMatch) {
            const result: LocationSearchResult = {
              name: parish.name,
              context: `Parish, ${municipality.name}, ${district.name}`,
              level: "parish",
              slugs: [region.slug, district.slug, municipality.slug, parish.slug],
            };
            (pMatch === "starts" ? startsWithMatches : substringMatches).push(result);
          }
        }
      }
    }
  }

  return [...startsWithMatches, ...substringMatches].slice(0, limit);
}
