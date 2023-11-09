/// <reference types="cypress" />

describe("template spec", () => {

  // since we want to intercept tags and tags are the first thing to load when the page is logged in 
  // we wan to do the interception before the login happen, so we can able to provide our mock response
  beforeEach("First log in the app", () => {
cy.intercept('GET','https://api.realworld.io/api/tags', {fixture: 'tags.json'})

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

  it.only("intercepting with mock response", () => {
    // know we are doing assertions
    cy.get(".tag-list")
      .should("contain", "Computer")
      .should("contain", "JavaScript")
      .should("contain", "Code Your Future");
    
  });
});
