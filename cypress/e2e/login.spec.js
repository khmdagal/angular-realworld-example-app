describe("template spec", () => {
  beforeEach("First log in the app", () => {
    cy.visit("/login");
    cy.get("[placeholder='Email']").type("adam@hotmail.com");
    cy.get("[placeholder='Password']").type("Kdagaal123");
    cy.get("form").submit();
  });


  it("Create article", () => {


    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type('Ciwaanka')
    cy.get('[formcontrolname="description"]').type("maduuca");
    cy.get('[formcontrolname="body"]').type("sheekooy sheeko xariira");
    cy.contains('Publish').click()
  });
  it.only("test", () => {
    
  })
});
