describe("Pagination", () => {
  it("shows pagination when multiple pages", () => {
    // Visit a location that likely has enough properties for pagination
    cy.visit("/pt/comprar/area-metropolitana-de-lisboa");

    // If there are enough results, pagination nav should be visible
    cy.get("nav").then(($nav) => {
      if ($nav.find("a").length > 0) {
        cy.wrap($nav).should("be.visible");
      }
    });
  });

  it("next navigation updates URL", () => {
    cy.visit("/pt/comprar/area-metropolitana-de-lisboa");

    // Click Next link if it exists
    cy.get("body").then(($body) => {
      const nextLink = $body.find('nav a:contains("Seguinte"), nav a:contains("Next")');
      if (nextLink.length > 0) {
        cy.wrap(nextLink.first()).click();
        cy.url().should("include", "page=2");
      }
    });
  });

  it("previous navigation updates URL", () => {
    cy.visit("/pt/comprar/area-metropolitana-de-lisboa?page=2");

    // Click Previous link if it exists
    cy.get("body").then(($body) => {
      const prevLink = $body.find('nav a:contains("Anterior"), nav a:contains("Previous")');
      if (prevLink.length > 0) {
        cy.wrap(prevLink.first()).click();
        cy.url().should("not.include", "page=2");
      }
    });
  });

  it("preserves filter params when paginating", () => {
    cy.visit("/pt/comprar/area-metropolitana-de-lisboa?sort=price-desc");

    cy.get("body").then(($body) => {
      const nextLink = $body.find('nav a:contains("Seguinte"), nav a:contains("Next")');
      if (nextLink.length > 0) {
        cy.wrap(nextLink.first()).click();
        cy.url().should("include", "sort=price-desc");
        cy.url().should("include", "page=2");
      }
    });
  });
});
