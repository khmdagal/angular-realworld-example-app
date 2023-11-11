/// <reference types="cypress" />

describe("Interceptions", () => {
  // since we want to intercept tags and tags are the first thing to load when the page is logged in
  // we wan to do the interception before the login happen, so we can able to provide our mock response
  beforeEach("First log in the app", () => {
    cy.intercept({method:"GET", path:"tags"}, {
      fixture: "tags.json",
    });

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

  it.only("verify global feed likes counts", () => {
    //here we are intercepting the both feed your feed and the global one
    //first we are doing your feed intercept
    cy.intercept("GET", "https://api.realworld.io/api/articles/feed*", {
      articles: [],
      articlesCount: 0,
    });

    // in here we intercept the global feed and provide our own response from the file we created in the fixture folder
    // the file name is articles.json
    cy.intercept("GET", "https://api.realworld.io/api/articles*", {
      fixture: "articles.json",
    });

    // here we are going to find and click the Global feed button on the home page

    cy.contains("Global Feed").click();

    // Then we are doing to get all the article list or the parent element of all the articles
    // and then child buttons

    cy.get("app-article-list button").then((heartButtonList) => {
      // then we are looking the first and the second buttons
      // then we are doing the assertions if you look the articles.json file we provide 1 and 5 favorite counts.
      expect(heartButtonList[0]).to.contain("1");
      expect(heartButtonList[1]).to.contain("5");

      // we are now testing the if the like button increase and decrease when it clicked
      // and we want to totally isolate the this test from the backend so we can provide our response

      //=== now we are going to read the article.json file so we can modify the object
      // and we are going to use cypress method to read the fixtures folder

      // remember if you don't provide and extension like .json etc cypress will automatically add .json
      cy.fixture("articles").then((file) => {
        // going the file and going the articles array and finding the second element and then getting the slug and then store that value in the articleID variable
        const articleID = file.articles[1].slug;

        // now go the file and do the modification to the favorite count to be from 5 to 6
        file.articles[1].favoritesCount = 6;

        //now we are going to intercept
        cy.intercept(
          "POST",
          `https://api.realworld.io/api/articles/${articleID}/favorite`,
          file
        );

        // now we are going to get the articles parent element and grabbing the first button
        // we used eq to ge the first button
        // and then we chained to the assertion method
        cy.get("app-article-list button").eq(1).click().should("contain", "6");
      });
    });
  });
});
