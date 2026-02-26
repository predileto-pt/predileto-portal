describe("Search Page", () => {
  it("loads buy listing page at /pt/comprar", () => {
    cy.visit("/pt/comprar");
    cy.contains("Comprar").should("be.visible");
  });

  it("shows LocationBrowser when no filters active", () => {
    cy.visit("/pt/comprar");
    // LocationBrowser shows region links
    cy.contains("Algarve").should("be.visible");
    cy.contains("Alentejo").should("be.visible");
  });

  it("shows property results when location is in URL", () => {
    cy.visit("/pt/comprar/algarve");
    // Should show results section with property count
    cy.contains("encontrad").should("be.visible");
  });

  it("shows breadcrumbs for hierarchical location", () => {
    cy.visit("/pt/comprar/algarve/faro");
    // Breadcrumbs should show region and district
    cy.contains("Algarve").should("be.visible");
    cy.contains("Faro").should("be.visible");
  });
});
