describe("Search history sidebar", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("records a buy search and shows it in the Comprar bucket", () => {
    cy.visit("/pt/comprar/algarve");
    cy.contains("encontrad").should("be.visible");

    // Sidebar entry appears in the Comprar list (lg+ viewport, 1280×720)
    cy.contains("Pesquisas recentes").should("be.visible");
    cy.contains("h3", "Comprar").should("be.visible");
    cy.contains("h3", "Comprar")
      .parent()
      .parent()
      .within(() => {
        cy.get("a").first().should("contain.text", "Algarve");
      });

    // Rent bucket should be empty
    cy.contains("h3", "Arrendar")
      .parent()
      .parent()
      .within(() => {
        cy.contains("Sem pesquisas").should("be.visible");
      });
  });

  it("isolates buy and rent buckets — no cross-contamination", () => {
    cy.visit("/pt/comprar/algarve");
    cy.contains("encontrad").should("be.visible");
    cy.visit("/pt/arrendar/lisboa");
    cy.contains("encontrad").should("be.visible");

    cy.contains("h3", "Comprar")
      .parent()
      .parent()
      .within(() => {
        cy.contains("Algarve").should("exist");
        cy.contains("Lisboa").should("not.exist");
      });
    cy.contains("h3", "Arrendar")
      .parent()
      .parent()
      .within(() => {
        cy.contains("Lisboa").should("exist");
        cy.contains("Algarve").should("not.exist");
      });
  });

  it("dedupes by URL — re-running the same search bumps it to the top", () => {
    cy.visit("/pt/comprar/algarve");
    cy.contains("encontrad").should("be.visible");
    cy.visit("/pt/comprar/lisboa");
    cy.contains("encontrad").should("be.visible");
    cy.visit("/pt/comprar/algarve");
    cy.contains("encontrad").should("be.visible");

    cy.contains("h3", "Comprar")
      .parent()
      .parent()
      .within(() => {
        cy.get("a").should("have.length", 2);
        cy.get("a").first().should("contain.text", "Algarve");
      });
  });

  it("clicking a history entry re-runs the search", () => {
    cy.visit("/pt/comprar/lisboa");
    cy.contains("encontrad").should("be.visible");
    cy.visit("/pt/comprar/algarve");
    cy.contains("encontrad").should("be.visible");

    cy.contains("h3", "Comprar")
      .parent()
      .parent()
      .within(() => {
        cy.contains("a", "Lisboa").click();
      });

    cy.url().should("include", "/pt/comprar/lisboa");
  });

  it("clearing the buy bucket leaves rent untouched", () => {
    cy.visit("/pt/comprar/algarve");
    cy.contains("encontrad").should("be.visible");
    cy.visit("/pt/arrendar/lisboa");
    cy.contains("encontrad").should("be.visible");

    cy.contains("h3", "Comprar")
      .parent()
      .within(() => {
        cy.contains("button", "Limpar").click();
      });

    cy.contains("h3", "Comprar")
      .parent()
      .parent()
      .within(() => {
        cy.contains("Sem pesquisas").should("be.visible");
      });
    cy.contains("h3", "Arrendar")
      .parent()
      .parent()
      .within(() => {
        cy.contains("Lisboa").should("be.visible");
      });
  });
});
