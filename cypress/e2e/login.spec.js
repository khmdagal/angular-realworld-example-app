/// <reference types="cypress" />

describe("Interceptions", () => {

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

  it("intercepting with mock response", () => {
    // know we are doing assertions
    cy.get(".tag-list")
      .should("contain", "Computer")
      .should("contain", "JavaScript")
      .should("contain", "Code Your Future");
  });

  it.only('verify global feed likes counts', () => {
    //here we are intercepting the both feed your feed and the global one
    //first we are doing your feed intercept
    cy.intercept("GET", "https://api.realworld.io/api/articles/feed*", {
      articles: [],
      articlesCount: 0,
    });


    // in here we intercept the global feed and provide our own response from the file we created in the fixture folder
    // the file name is articles.json
    cy.intercept('GET', "https://api.realworld.io/api/articles*", { fixture: 'articles.json' })
    
    // here we are going to find and click the Global feed button on the home page 
    
    cy.contains('Global Feed').click();

    // Then we are doing to get all the article list or the parent element of all the articles
    // and then child buttons 
    
    cy.get("app-article-list button").then(heartButtonList => {

      // then we are looking the first and the second buttons
      // then we are doing the assertions if you look the articles.json file we provide 1 and 5 favorite counts.
      expect(heartButtonList[0]).to.contain('1');
      expect(heartButtonList[1]).to.contain("5");

    })
  })
});
