declare global {
  namespace Cypress {
    interface Chainable {
      interceptPropertyApi(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("interceptPropertyApi", () => {
  cy.intercept("GET", "/api/property/*/nearby", {
    fixture: "nearby.json",
  }).as("nearbyApi");

  cy.intercept("GET", "/api/property/*", {
    fixture: "property.json",
  }).as("propertyApi");
});

export {};
