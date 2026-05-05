/**
 * Rules for narrowing which typology / property options are valid in a given
 * search context. Each rule is a pure predicate so that adding a new rule is
 * just appending to the relevant array — no conditional branches elsewhere.
 */

export type Typology = "house" | "apartment" | "land" | "ruin";

export const ALL_TYPOLOGIES: Typology[] = [
  "house",
  "apartment",
  "land",
  "ruin",
];

export const typologyLabels: Record<Typology, string> = {
  house: "Casa",
  apartment: "Apartamento",
  land: "Terreno",
  ruin: "Ruína",
};

export interface TypologyRuleContext {
  listingType: "buy" | "rent";
}

/**
 * A TypologyRule returns true if the typology is ALLOWED in the given
 * context. To forbid a combination, return false.
 */
export type TypologyRule = (
  typology: Typology,
  ctx: TypologyRuleContext,
) => boolean;

export const typologyRules: TypologyRule[] = [
  // Land cannot be rented — it's not a meaningful rental market here.
  (typology, { listingType }) =>
    !(typology === "land" && listingType === "rent"),
];

export function availableTypologies(ctx: TypologyRuleContext): Typology[] {
  return ALL_TYPOLOGIES.filter((t) =>
    typologyRules.every((rule) => rule(t, ctx)),
  );
}
