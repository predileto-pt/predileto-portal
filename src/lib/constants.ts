export const PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "studio",
  "penthouse",
  "townhouse",
] as const;

export const LISTING_TYPES = ["rent", "buy"] as const;

export const REGIONS = [
  "Lisboa",
  "Porto",
  "Algarve",
  "Braga",
  "Coimbra",
  "Aveiro",
  "Setúbal",
  "Madeira",
] as const;

export const SORT_OPTIONS = [
  { key: "newest", value: "newest" },
  { key: "oldest", value: "oldest" },
  { key: "priceDesc", value: "price-desc" },
  { key: "priceAsc", value: "price-asc" },
  { key: "bedroomsDesc", value: "bedrooms-desc" },
  { key: "areaDesc", value: "area-desc" },
] as const;

export const DEFAULT_PAGE_SIZE = 9;
