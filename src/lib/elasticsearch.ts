import { Client } from "@elastic/elasticsearch";
import type { SortCombinations } from "@elastic/elasticsearch/lib/api/types";
import type { PropertyRow } from "./db-types";
import type { PropertySearchParams } from "./types";
import { DEFAULT_PAGE_SIZE } from "./constants";
import { getDistrictSlugsForRegion } from "./locations";

// --- Lazy singleton client ---

let client: Client | null | undefined;

function getClient(): Client | null {
  if (client !== undefined) return client;

  const url = process.env.ELASTICSEARCH_URL;
  const apiKey = process.env.ELASTICSEARCH_API_KEY;

  if (!url || !apiKey) {
    client = null;
    return null;
  }

  client = new Client({ node: url, auth: { apiKey } });
  return client;
}

// --- Listing / property type mapping (English → DB Portuguese values) ---

const listingTypeDbValues: Record<string, string[]> = {
  buy: ["venda"],
  rent: ["arrendar", "arrendamento"],
};

const propertyTypeToDb: Record<string, string> = {
  apartment: "apartamento",
  house: "casa",
  villa: "villa",
  studio: "estúdio",
  penthouse: "penthouse",
  townhouse: "townhouse",
};

// --- Query builder ---

interface EsQuery {
  bool: {
    must: Record<string, unknown>[];
    filter: Record<string, unknown>[];
  };
}

function buildEsQuery(params: PropertySearchParams): EsQuery {
  const must: Record<string, unknown>[] = [];
  const filter: Record<string, unknown>[] = [];

  if (params.q) {
    must.push({
      multi_match: {
        query: params.q,
        type: "bool_prefix",
        fields: [
          "address.full_address",
          "address.full_address._2gram",
          "address.full_address._3gram",
          "address.municipality",
          "address.municipality._2gram",
          "address.municipality._3gram",
          "address.district",
          "address.district._2gram",
          "address.district._3gram",
          "address.parish",
          "address.parish._2gram",
          "address.parish._3gram",
          "title",
          "description",
        ],
      },
    });
  }

  if (params.listingType) {
    const dbValues = listingTypeDbValues[params.listingType];
    if (dbValues) filter.push({ terms: { listing_type: dbValues } });
  }

  if (params.propertyType) {
    const dbVal = propertyTypeToDb[params.propertyType];
    if (dbVal) filter.push({ term: { property_type: dbVal } });
  }

  if (params.bedrooms) {
    const beds = Number(params.bedrooms);
    if (beds > 0) {
      const values: string[] = [];
      for (let i = beds; i <= 9; i++) values.push(`T${i}`);
      values.push("T5+");
      filter.push({ terms: { bedrooms: values } });
    }
  }

  // Hierarchical location filter — only the deepest level (it implies ancestors)
  // Use match_phrase instead of term because address fields are search_as_you_type,
  // which tokenizes slugs like "viana-do-castelo" into ["viana","do","castelo"].
  if (params.parish) {
    filter.push({ match_phrase: { "address.parish": params.parish } });
  } else if (params.municipality) {
    filter.push({ match_phrase: { "address.municipality": params.municipality } });
  } else if (params.district) {
    filter.push({ match_phrase: { "address.district": params.district } });
  } else if (params.region) {
    const districtSlugs = getDistrictSlugsForRegion(params.region);
    if (districtSlugs.length > 0) {
      filter.push({
        bool: {
          should: districtSlugs.map(s => ({ match_phrase: { "address.district": s } })),
          minimum_should_match: 1,
        },
      });
    }
  }

  if (params.minPrice || params.maxPrice) {
    const range: Record<string, number> = {};
    if (params.minPrice) range.gte = Number(params.minPrice);
    if (params.maxPrice) range.lte = Number(params.maxPrice);
    filter.push({ range: { price: range } });
  }

  if (must.length === 0) {
    must.push({ match_all: {} });
  }

  return { bool: { must, filter } };
}

// --- Sort builder ---

function buildEsSort(params: PropertySearchParams): SortCombinations[] {
  const sorts: SortCombinations[] = [];

  if (params.q) {
    sorts.push("_score");
  }

  const sortKey = params.sort || "newest";
  switch (sortKey) {
    case "oldest":
      sorts.push({ scraped_at: { order: "asc" } });
      break;
    case "price-desc":
      sorts.push({ price: { order: "desc" } });
      break;
    case "price-asc":
      sorts.push({ price: { order: "asc" } });
      break;
    case "bedrooms-desc":
      sorts.push({ bedrooms: { order: "desc" } });
      break;
    case "area-desc":
      sorts.push({ area_m2: { order: "desc" } });
      break;
    default:
      sorts.push({ scraped_at: { order: "desc" } });
      break;
  }

  return sorts;
}

// --- Hit mapper: ES _source → PropertyRow ---

interface EsPropertySource {
  id?: string;
  title?: string;
  listing_type?: string;
  property_type?: string;
  price?: number;
  bedrooms?: string;
  bathrooms?: number;
  area_m2?: number;
  description?: string;
  address?: {
    full_address?: string;
    municipality?: string;
    district?: string;
    parish?: string;
    postal_code?: string;
    region?: string;
  };
  images?: string[];
  features?: string[];
  sources?: { name: string; url: string }[];
  source?: string;
  url?: string;
  scraped_at?: string;
  updated_at?: string;
}

function mapEsHitToPropertyRow(
  id: string,
  source: EsPropertySource,
): PropertyRow {
  return {
    id: source.id ?? id,
    title: source.title ?? "",
    listing_type: source.listing_type ?? null,
    property_type: source.property_type ?? null,
    price: source.price ?? null,
    bedrooms: source.bedrooms ?? null,
    bathrooms: source.bathrooms ?? null,
    area_m2: source.area_m2 ?? null,
    description: source.description ?? null,
    address_full_address: source.address?.full_address ?? null,
    address_city: source.address?.municipality ?? null,
    address_district: source.address?.district ?? null,
    address_postal_code: source.address?.postal_code ?? null,
    address_region: source.address?.region ?? null,
    address_municipality: source.address?.municipality ?? null,
    address_parish: source.address?.parish ?? null,
    images: source.images ?? null,
    features: source.features ?? null,
    sources: source.sources ?? null,
    source: source.source ?? null,
    url: source.url ?? null,
    scraped_at: source.scraped_at ?? null,
    updated_at: source.updated_at ?? null,
  };
}

// --- Public search function ---

export async function searchProperties(
  params: PropertySearchParams,
): Promise<{ rows: PropertyRow[]; total: number } | null> {
  const es = getClient();
  if (!es) return null;

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;

  try {
    const result = await es.search<EsPropertySource>({
      index: "properties",
      from,
      size: pageSize,
      track_total_hits: true,
      query: buildEsQuery(params),
      sort: buildEsSort(params),
    });

    const total =
      typeof result.hits.total === "number"
        ? result.hits.total
        : result.hits.total?.value ?? 0;

    const rows = result.hits.hits.map((hit) =>
      mapEsHitToPropertyRow(hit._id!, hit._source!),
    );

    return { rows, total };
  } catch (err) {
    console.error("Elasticsearch query error:", err);
    return null;
  }
}
