/// <reference types="cypress" />

describe("template spec", () => {
  beforeEach("First log in the app", () => {
    cy.visit("/login");
    cy.get("[placeholder='Email']").type("adam@hotmail.com");
    cy.get("[placeholder='Password']").type("Kdagaal123");
    cy.get("form").submit();
  });

  it("Create article", () => {
    cy.intercept("POST", "https://api.realworld.io/api/articles/").as(
      "postArticles"
    );

    cy.contains("New Article").click();
    cy.get('[formcontrolname="title"]').type("Ciwaanka");
    cy.get('[formcontrolname="description"]').type("maduuca");
    cy.get('[formcontrolname="body"]').type("sheekooy sheeko xariira");
    cy.contains("Publish").click();

    cy.wait("@postArticles").then((xhr) => {
      console.log("=====>>>>>", xhr);
      expect(xhr.response.statusCode).to.equal(201);
      expect(xhr.request.body.article.body).to.equal("sheekooy sheeko xariira");
    });
  });
  // it.only("test", () => {});
});
