describe("Property Detail Panel", () => {
  beforeEach(() => {
    cy.interceptPropertyApi();
  });

  it("shows nothing when no property selected", () => {
    cy.visit("/pt/comprar/algarve");
    // Detail panel should not have content (no selected param)
    cy.get("[data-testid=detail-panel]").should("not.exist");
  });

  it("loads and displays property details when selected via URL", () => {
    cy.visit("/pt/comprar/algarve?selected=test-property-1");
    cy.wait("@propertyApi");

    cy.contains("Beautiful Apartment in Lisbon").should("be.visible");
    cy.contains("250").should("exist"); // price
    cy.contains("Lisboa").should("be.visible");
  });

  it("updates URL with ?selected= param on card click", () => {
    cy.visit("/pt/comprar/algarve");

    // Click the first property card (if results exist)
    cy.get("button").first().click({ force: true });

    // URL should contain selected param
    cy.url().should("include", "selected=");
  });

  it("shows nearby amenities after loading", () => {
    cy.visit("/pt/comprar/algarve?selected=test-property-1");
    cy.wait("@propertyApi");
    cy.wait("@nearbyApi");

    cy.contains("15").should("be.visible"); // restaurants count
  });

  it("expands and collapses description", () => {
    cy.visit("/pt/comprar/algarve?selected=test-property-1");
    cy.wait("@propertyApi");

    // Click "Show more" / "Mostrar mais"
    cy.get("button").contains(/show more|mostrar mais/i).click();
    // After expanding, should show "Show less" / "Mostrar menos"
    cy.get("button").contains(/show less|mostrar menos/i).should("be.visible");
  });
});
