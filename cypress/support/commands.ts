declare global {
  namespace Cypress {
    interface Chainable {
      interceptPropertyApi(): Chainable<void>;
      interceptBookingApi(): Chainable<void>;
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

Cypress.Commands.add("interceptBookingApi", () => {
  cy.intercept("POST", "/api/booking", {
    fixture: "booking.json",
    delay: 200,
  }).as("bookingApi");
});

export {};
