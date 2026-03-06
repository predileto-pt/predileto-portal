#!/usr/bin/env node
/**
 * One-time script to generate the complete Portugal administrative hierarchy JSON.
 *
 * Source: tomahock gist — flat array of {level, code, name} entries
 *   level 1 = district/island, level 2 = municipality, level 3 = parish
 *
 * Code structure:
 *   District codes: 1–18 (mainland), 31–32 (Madeira), 41–49 (Açores)
 *   Municipality codes: district code + 2 digits (e.g. district 3 → 301, 302, …)
 *   Parish codes: municipality code + 2 digits (e.g. muni 301 → 30101, 30102, …)
 */

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const GIST_URL =
  "https://gist.githubusercontent.com/tomahock/a6c07dd255d04499d8336237e35a4827/raw/distritos-concelhos-freguesias-Portugal.json";

// District/island → region mapping
// Island names in the gist use "Ilha de/da/do …" prefixes — we strip them for the output
const DISTRICT_TO_REGION = {
  // Mainland
  "Viana do Castelo": "Norte",
  Braga: "Norte",
  Porto: "Norte",
  "Vila Real": "Norte",
  Bragança: "Norte",
  Aveiro: "Centro",
  Viseu: "Centro",
  Guarda: "Centro",
  Coimbra: "Centro",
  "Castelo Branco": "Centro",
  Leiria: "Centro",
  Lisboa: "Área Metropolitana de Lisboa",
  Setúbal: "Área Metropolitana de Lisboa",
  Beja: "Alentejo",
  Évora: "Alentejo",
  Portalegre: "Alentejo",
  Santarém: "Alentejo",
  Faro: "Algarve",
  // Madeira islands
  "Ilha da Madeira": "Madeira",
  "Ilha de Porto Santo": "Madeira",
  // Açores islands
  "Ilha de Santa Maria": "Açores",
  "Ilha de São Miguel": "Açores",
  "Ilha Terceira": "Açores",
  "Ilha Graciosa": "Açores",
  "Ilha de São Jorge": "Açores",
  "Ilha do Pico": "Açores",
  "Ilha do Faial": "Açores",
  "Ilha das Flores": "Açores",
  "Ilha do Corvo": "Açores",
};

// Clean up island "Ilha de/da/do/das …" prefix for display names
function cleanDistrictName(name) {
  return name.replace(/^Ilha d[aeo]s?\s+/i, "").replace(/^Ilha\s+/i, "");
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Strip "União das freguesias de " / "União de freguesias de " prefix from parish names
function cleanParishName(name) {
  return name.replace(/^União d[ae]s? freguesias d[eao]s?\s+/i, "");
}

function makeNode(name, children = []) {
  return { name, slug: slugify(name), children };
}

async function main() {
  console.log("Fetching gist data...");
  const res = await fetch(GIST_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const raw = await res.json();
  console.log(`  Got ${raw.length} entries`);

  // ── Step 1: Collect all district codes (level 1) ────────────────────
  // We need these first so we can correctly determine the prefix length for
  // municipalities and parishes.
  const districtCodeSet = new Map(); // code (string) → name

  for (const entry of raw) {
    if (entry.level !== 1) continue;
    districtCodeSet.set(String(entry.code), entry.name.trim());
  }

  // Sort district codes longest-first so prefix matching is unambiguous
  const districtCodes = [...districtCodeSet.keys()].sort((a, b) => b.length - a.length);

  // ── Step 2: Build districts map ─────────────────────────────────────
  const districts = new Map(); // districtCode → { name, municipalities: Map<muniCode, { name, parishes[] }> }

  for (const [code, name] of districtCodeSet) {
    districts.set(code, { name, municipalities: new Map() });
  }

  // ── Step 3: Assign municipalities (level 2) ─────────────────────────
  for (const entry of raw) {
    if (entry.level !== 2) continue;
    const code = String(entry.code);
    const name = entry.name.trim();

    // Municipality code = districtCode + 2 digits
    const parentCode = findParentCode(code, districtCodes);
    if (!parentCode) {
      console.warn(`  Orphan municipality: code=${code} name="${name}"`);
      continue;
    }
    districts.get(parentCode).municipalities.set(code, { name, parishes: [] });
  }

  // Build sorted list of municipality codes for parish matching (longest-first)
  const allMuniCodes = [];
  for (const [, district] of districts) {
    for (const [muniCode] of district.municipalities) {
      allMuniCodes.push(muniCode);
    }
  }
  allMuniCodes.sort((a, b) => b.length - a.length);

  // Build muniCode → districtCode lookup
  const muniToDistrict = new Map();
  for (const [distCode, district] of districts) {
    for (const [muniCode] of district.municipalities) {
      muniToDistrict.set(muniCode, distCode);
    }
  }

  // ── Step 4: Assign parishes (level 3) ───────────────────────────────
  for (const entry of raw) {
    if (entry.level !== 3) continue;
    const code = String(entry.code);
    const name = entry.name.trim();

    const parentMuniCode = findParentCode(code, allMuniCodes);
    if (!parentMuniCode) {
      console.warn(`  Orphan parish: code=${code} name="${name}"`);
      continue;
    }
    const parentDistCode = muniToDistrict.get(parentMuniCode);
    districts.get(parentDistCode).municipalities.get(parentMuniCode).parishes.push(name);
  }

  // ── Step 5: Build region-level hierarchy ────────────────────────────
  const regionMap = new Map(); // region name → Map<display name, LocationNode>

  for (const [, district] of districts) {
    const regionName = DISTRICT_TO_REGION[district.name];
    if (!regionName) {
      console.warn(`  Unknown district: "${district.name}" — skipping`);
      continue;
    }

    if (!regionMap.has(regionName)) regionMap.set(regionName, new Map());

    const displayName = cleanDistrictName(district.name);
    const districtChildren = [];

    // Sort municipalities alphabetically
    const munisSorted = [...district.municipalities.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "pt"),
    );

    for (const muni of munisSorted) {
      const parishNodes = muni.parishes
        .map(cleanParishName)
        .sort((a, b) => a.localeCompare(b, "pt"))
        .map((p) => makeNode(p));
      districtChildren.push(makeNode(muni.name, parishNodes));
    }

    regionMap.get(regionName).set(displayName, makeNode(displayName, districtChildren));
  }

  // ── Step 6: Assemble final sorted array ─────────────────────────────
  const REGION_ORDER = [
    "Açores",
    "Alentejo",
    "Algarve",
    "Área Metropolitana de Lisboa",
    "Centro",
    "Madeira",
    "Norte",
  ];

  const result = [];

  for (const regionName of REGION_ORDER) {
    const districtsInRegion = regionMap.get(regionName);
    if (!districtsInRegion) {
      console.warn(`  No districts found for region: ${regionName}`);
      result.push(makeNode(regionName));
      continue;
    }

    // Sort districts/islands alphabetically within the region
    const sortedDistricts = [...districtsInRegion.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "pt"),
    );

    result.push(makeNode(regionName, sortedDistricts));
  }

  // ── Write output ────────────────────────────────────────────────────
  const outPath = join(__dirname, "..", "src", "data", "portugal-locations.json");
  writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n", "utf-8");

  // ── Stats ───────────────────────────────────────────────────────────
  let totalDistricts = 0;
  let totalMunicipalities = 0;
  let totalParishes = 0;
  for (const region of result) {
    totalDistricts += region.children.length;
    for (const district of region.children) {
      totalMunicipalities += district.children.length;
      for (const muni of district.children) {
        totalParishes += muni.children.length;
      }
    }
  }

  console.log(`\nWritten to ${outPath}`);
  console.log(`  Regions:        ${result.length}`);
  console.log(`  Districts:      ${totalDistricts}`);
  console.log(`  Municipalities: ${totalMunicipalities}`);
  console.log(`  Parishes:       ${totalParishes}`);
}

/**
 * Given a child code and a list of possible parent codes (sorted longest-first),
 * find the parent whose code is a proper prefix of the child code with exactly
 * 2 extra characters.
 *
 * Some post-reform parish codes use a leading zero + alphanumeric suffix
 * (e.g. "0302FA" for municipality "302"), so we also try stripping the leading "0".
 */
function findParentCode(childCode, parentCodes) {
  for (const parentCode of parentCodes) {
    if (
      childCode.startsWith(parentCode) &&
      childCode.length === parentCode.length + 2
    ) {
      return parentCode;
    }
  }
  // Fallback: strip leading "0" from child and retry
  if (childCode.startsWith("0")) {
    return findParentCode(childCode.slice(1), parentCodes);
  }
  return null;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
