describe("Booking Flow", () => {
  beforeEach(() => {
    cy.interceptBookingApi();
  });

  describe("Agendar Visita link", () => {
    it("is visible for easyBook properties", () => {
      cy.intercept("GET", "/api/property/*/nearby", {
        fixture: "nearby.json",
      }).as("nearbyApi");
      cy.intercept("GET", "/api/property/*", {
        fixture: "property-easybook.json",
      }).as("propertyApi");

      cy.visit("/pt/comprar/algarve?selected=test-property-easybook");
      cy.wait("@propertyApi");

      cy.contains("Agendar Visita").should("be.visible");
    });

    it("is not visible for non-easyBook properties", () => {
      cy.intercept("GET", "/api/property/*/nearby", {
        fixture: "nearby.json",
      }).as("nearbyApi");
      cy.intercept("GET", "/api/property/*", {
        fixture: "property.json",
      }).as("propertyApi");

      cy.visit("/pt/comprar/algarve?selected=test-property-1");
      cy.wait("@propertyApi");

      cy.contains("Agendar Visita").should("not.exist");
    });

    it("navigates to booking page", () => {
      cy.intercept("GET", "/api/property/*/nearby", {
        fixture: "nearby.json",
      }).as("nearbyApi");
      cy.intercept("GET", "/api/property/*", {
        fixture: "property-easybook.json",
      }).as("propertyApi");

      cy.visit("/pt/comprar/algarve?selected=test-property-easybook");
      cy.wait("@propertyApi");

      cy.contains("Agendar Visita").click();
      cy.url().should("include", "/pt/agendar/test-property-easybook");
    });
  });

  describe("Booking page", () => {
    beforeEach(() => {
      cy.visit("/pt/agendar/test-property-easybook");
    });

    it("shows progress bar", () => {
      cy.get(".fixed.top-0").should("exist");
    });

    it("shows back button that navigates to listing", () => {
      cy.get("a").contains("Voltar").should("have.attr", "href", "/pt");
    });

    it("renders step 1 by default", () => {
      cy.contains("Termos e Condições da Visita").should("be.visible");
    });

    it("has step=1 in URL", () => {
      cy.url().should("include", "step=1");
    });

    it("continue button is disabled until checkbox is checked", () => {
      cy.get("button").contains("Continuar").should("be.disabled");
      cy.get("input[type='checkbox']").check({ force: true });
      cy.get("button").contains("Continuar").should("not.be.disabled");
    });

    it("completes full flow: step 1 → 2 → 3 → 4 → 5", () => {
      // Step 1: Agreement
      cy.get("input[type='checkbox']").check({ force: true });
      cy.get("button").contains("Continuar").click();

      // Step 2: Personal Info
      cy.url().should("include", "step=2");
      cy.get("input#name").type("João Silva");
      cy.get("input#nif").type("123456789");
      cy.get("button").contains("Continuar").click();

      // Step 3: Documents
      cy.url().should("include", "step=3");
      cy.get("button").contains("Continuar").click();

      // Step 4: Review
      cy.url().should("include", "step=4");
      cy.contains("João Silva").should("be.visible");
      cy.contains("123456789").should("be.visible");
      cy.get("button").contains("Submeter").click();
      cy.wait("@bookingApi");

      // Step 5: Success
      cy.url().should("include", "step=5");
      cy.contains("Visita agendada com sucesso").should("be.visible");
    });

    it("shows validation errors on step 2 when fields are empty", () => {
      // Go to step 2
      cy.get("input[type='checkbox']").check({ force: true });
      cy.get("button").contains("Continuar").click();
      cy.url().should("include", "step=2");

      // Try to continue without filling fields
      cy.get("button").contains("Continuar").click();

      // Should show validation errors
      cy.get(".text-red-500").should("exist");
    });

    it("navigates back between steps", () => {
      // Go to step 2
      cy.get("input[type='checkbox']").check({ force: true });
      cy.get("button").contains("Continuar").click();
      cy.url().should("include", "step=2");

      // Go back to step 1
      cy.get("button").contains("Voltar").click();
      cy.url().should("include", "step=1");
    });
  });
});
