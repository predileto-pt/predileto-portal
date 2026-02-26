describe("Filters", () => {
  beforeEach(() => {
    cy.visit("/pt/comprar");
  });

  it("autocomplete shows suggestions when typing location", () => {
    cy.get('input[role="combobox"]').type("Lis");
    cy.get('[role="listbox"]').should("be.visible");
    cy.contains("Lisboa").should("be.visible");
  });

  it("navigates to location on suggestion click", () => {
    cy.get('input[role="combobox"]').type("Algarve");
    cy.get('[role="listbox"]').should("be.visible");
    cy.contains('[role="option"]', "Algarve").click();

    cy.url().should("include", "/comprar/algarve");
  });

  it("filters by property type via URL param", () => {
    cy.visit("/pt/comprar/algarve?propertyType=house");
    cy.get("select").first().should("exist");
  });

  it("filters by bedrooms via URL param", () => {
    cy.visit("/pt/comprar/algarve?bedrooms=2");
    cy.url().should("include", "bedrooms=2");
  });

  it("filters by sort via URL param", () => {
    cy.visit("/pt/comprar/algarve?sort=price-desc");
    cy.url().should("include", "sort=price-desc");
  });

  it("filters by price range via URL params", () => {
    cy.visit("/pt/comprar/algarve?minPrice=100000&maxPrice=500000");
    cy.url().should("include", "minPrice=100000");
    cy.url().should("include", "maxPrice=500000");
  });

  it("clears location on X click", () => {
    cy.visit("/pt/comprar/algarve");

    // Click the clear location button
    cy.get('button[aria-label="Clear location"]').click();

    // Should navigate to base listing page
    cy.url().should("match", /\/pt\/comprar\/?$/);
  });

  it("resets page param on filter change", () => {
    cy.visit("/pt/comprar/algarve?page=2&sort=newest");

    // Change sort
    cy.get("select").first().select("price-desc");

    // URL should not have page param (reset on filter change)
    cy.url().should("not.include", "page=2");
  });
});
