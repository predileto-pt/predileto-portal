import locationData from "@/data/portugal-locations.json";

// --- Types ---

export interface LocationNode {
  name: string;
  slug: string;
  children: LocationNode[];
}

export interface ResolvedLocation {
  regiao?: LocationNode;
  distrito?: LocationNode;
  concelho?: LocationNode;
  freguesia?: LocationNode;
  valid: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

// --- Data (loaded once at module init) ---

const regioes: LocationNode[] = locationData as LocationNode[];

// Lookup maps built once
const regiaoBySlug = new Map<string, LocationNode>();
const distritoBySlug = new Map<string, { distrito: LocationNode; regiao: LocationNode }>();
const concelhoBySlug = new Map<
  string,
  { concelho: LocationNode; distrito: LocationNode; regiao: LocationNode }
>();

for (const regiao of regioes) {
  regiaoBySlug.set(regiao.slug, regiao);
  for (const distrito of regiao.children) {
    distritoBySlug.set(distrito.slug, { distrito, regiao });
    for (const concelho of distrito.children) {
      concelhoBySlug.set(concelho.slug, { concelho, distrito, regiao });
    }
  }
}

// --- Slug resolution ---

export function resolveLocationFromSlugs(slugs: string[]): ResolvedLocation {
  if (slugs.length === 0) return { valid: true };
  if (slugs.length > 4) return { valid: false };

  const regiao = regiaoBySlug.get(slugs[0]);
  if (!regiao) return { valid: false };

  if (slugs.length === 1) return { regiao, valid: true };

  const distrito = regiao.children.find((d) => d.slug === slugs[1]);
  if (!distrito) return { valid: false };

  if (slugs.length === 2) return { regiao, distrito, valid: true };

  const concelho = distrito.children.find((c) => c.slug === slugs[2]);
  if (!concelho) return { valid: false };

  if (slugs.length === 3) return { regiao, distrito, concelho, valid: true };

  const freguesia = concelho.children.find((f) => f.slug === slugs[3]);
  if (!freguesia) return { valid: false };

  return { regiao, distrito, concelho, freguesia, valid: true };
}

// --- Expansion helpers ---

export function getDistritoSlugsForRegiao(regiaoSlug: string): string[] {
  const regiao = regiaoBySlug.get(regiaoSlug);
  if (!regiao) return [];
  return regiao.children.map((d) => d.slug);
}

export function getDistritoNamesForRegiao(regiaoSlug: string): string[] {
  const regiao = regiaoBySlug.get(regiaoSlug);
  if (!regiao) return [];
  return regiao.children.map((d) => d.name);
}

// --- Reverse lookups ---

export function lookupRegiaoForDistrito(
  distritoSlug: string,
): LocationNode | undefined {
  return distritoBySlug.get(distritoSlug)?.regiao;
}

export function lookupRegiaoForDistritoName(
  distritoName: string,
): LocationNode | undefined {
  for (const regiao of regioes) {
    for (const distrito of regiao.children) {
      if (distrito.name === distritoName) return regiao;
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

  if (resolved.regiao) {
    path += `/${resolved.regiao.slug}`;
    crumbs.push({ label: resolved.regiao.name, href: path });
  }
  if (resolved.distrito) {
    path += `/${resolved.distrito.slug}`;
    crumbs.push({ label: resolved.distrito.name, href: path });
  }
  if (resolved.concelho) {
    path += `/${resolved.concelho.slug}`;
    crumbs.push({ label: resolved.concelho.name, href: path });
  }
  if (resolved.freguesia) {
    path += `/${resolved.freguesia.slug}`;
    crumbs.push({ label: resolved.freguesia.name, href: path });
  }

  return crumbs;
}

// --- Dropdown data ---

export function getRegioes(): LocationNode[] {
  return regioes;
}

export function getDistritos(regiaoSlug: string): LocationNode[] {
  const regiao = regiaoBySlug.get(regiaoSlug);
  return regiao?.children ?? [];
}

export function getConcelhos(
  regiaoSlug: string,
  distritoSlug: string,
): LocationNode[] {
  const regiao = regiaoBySlug.get(regiaoSlug);
  if (!regiao) return [];
  const distrito = regiao.children.find((d) => d.slug === distritoSlug);
  return distrito?.children ?? [];
}

export function getFreguesias(
  regiaoSlug: string,
  distritoSlug: string,
  concelhoSlug: string,
): LocationNode[] {
  const regiao = regiaoBySlug.get(regiaoSlug);
  if (!regiao) return [];
  const distrito = regiao.children.find((d) => d.slug === distritoSlug);
  if (!distrito) return [];
  const concelho = distrito.children.find((c) => c.slug === concelhoSlug);
  return concelho?.children ?? [];
}
