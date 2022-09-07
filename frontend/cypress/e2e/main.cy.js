describe("App", () => {
  beforeEach(() => {
    cy.visit("localhost:3000");
  });

  it("Auto-select the first clinic", () => {
    cy.get("[data-cy=clinic-selector] .ant-select-selection-item").should("contain", "Salve Fertility");
  });

  it("For the first clinic, the first patient is correct", () => {
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(1)").should("contain", "Harriott");
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(2)").should("contain", "Wansbury");
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(3)").should("contain", "1961-10-16");
  });

  it("If we sort by name in descending order, the first patient is correct", () => {
    cy.get("[data-cy=patients-table] thead").contains("First Name").click();
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(1)").should("contain", "Winfred");
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(2)").should("contain", "Burtwell");
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(3)").should("contain", "1995-02-25");
  });

  it("If we sort by name in ascending order, the first patient is correct", () => {
    cy.get("[data-cy=patients-table] thead").contains("First Name").click();
    cy.wait(300); // we want to wait a bit to simulate the speed at which a real user would double-click
    cy.get("[data-cy=patients-table] thead").contains("First Name").click();
    cy.get("[data-cy=patients-table] tr:nth-child(2) td:nth-child(1)").should("contain", "Abbott");
    cy.get("[data-cy=patients-table] tr:nth-child(2) td:nth-child(2)").should("contain", "Vedntyev");
    cy.get("[data-cy=patients-table] tr:nth-child(2) td:nth-child(3)").should("contain", "1995-12-12");
  });

  it("After clicking on the second page of results, the first patient is correct", () => {
    cy.get(".ant-pagination-item[title=2]").click();
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(1)").should("contain", "Hillie");
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(2)").should("contain", "Bohike");
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(3)").should("contain", "1965-01-12");
  });

  it('After changing the clinic to "London IVF", the first patient is correct', () => {
    // cy.wait(3000);
    cy.get("[data-cy=clinic-selector]").click();
    // cy.wait(3000);
    cy.get(".ant-select-item-option-content").contains("London IVF").click();
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(1)").should("contain", "Emlynn");
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(2)").should("contain", "Tompkin");
    cy.get("[data-cy=patients-table] tr:nth-child(1) td:nth-child(3)").should("contain", "1964-10-02");
  });
});
