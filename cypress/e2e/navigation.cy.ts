describe("Location Navigation", () => {
  it("navigates through LocationBrowser hierarchy", () => {
    cy.visit("/pt/comprar");

    // Should see regions in the LocationBrowser
    cy.contains("Algarve").should("be.visible");
    cy.contains("Alentejo").should("be.visible");

    // Click on a region link
    cy.contains("a", "Algarve").first().click();
    cy.url().should("include", "/comprar/algarve");

    // Should show the region's districts
    cy.contains("Faro").should("be.visible");
  });

  it("navigates from region to district", () => {
    cy.visit("/pt/comprar/algarve");

    // Click district link (Faro)
    cy.contains("a", "Faro").first().click();
    cy.url().should("include", "/comprar/algarve/faro");
  });

  it("breadcrumb links navigate back to parent levels", () => {
    cy.visit("/pt/comprar/algarve/faro");

    // Should see breadcrumbs with Algarve
    cy.contains("Algarve").should("be.visible");

    // Click the Algarve breadcrumb to go back to region level
    cy.contains("a", "Algarve").first().click();
    cy.url().should("include", "/comprar/algarve");
    cy.url().should("not.include", "/faro");
  });

  it("home breadcrumb navigates to base page", () => {
    cy.visit("/pt/comprar/algarve");

    // Click home/comprar breadcrumb
    cy.contains("a", "Comprar").click();
    cy.url().should("match", /\/pt\/comprar\/?$/);
  });
});
