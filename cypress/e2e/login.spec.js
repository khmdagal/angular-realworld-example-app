/// <reference types="cypress" />

describe("Interceptions", () => {
  // since we want to intercept tags and tags are the first thing to load when the page is logged in
  // we wan to do the interception before the login happen, so we can able to provide our mock response
  beforeEach("First log in the app", () => {
    cy.intercept(
      { method: "GET", path: "tags" },
      {
        fixture: "tags.json",
      }
    );

    cy.loginToApplication();
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

  it("verify global feed likes counts", () => {
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

  it.only("delete article from global feed", () => {
    //The aim of this test is to create and delete data just using API calls instead of going the UI which might make you slow
    // now the first thing we need to do is to get the access token by using cypress request method

    const userCredential = {
      user: {
        email: "adam@hotmail.com",
        password: "Kdagaal123",
      },
    };

    const articleBody = {
      article: {
        title: "This is new API title222",
        description: "Post man test",
        body: "API cypress calls",
        tagList: [],
      },
    };

    cy.request(
      "POST",
      "https://api.realworld.io/api/users/login",
      userCredential
    )
      .its("body")
      .then((body) => {
        // from here we made the request and we got back the response we we saved the "body" variable
        // now we are going to extract the token from the body variable

        const token = body.user.token;

        // now the second step we are going to do is to make the second request

        cy.request({
          url: "https://api.realworld.io/api/articles/",
          headers: { Authorization: "Token " + token },
          method: "POST",
          body: articleBody,
        }).then((response) => {
          expect(response.status).to.equal(201);
        });

        // now here we are perform to delete the article from the global feed. and then validate that deletion.

        //cy.contains("Global Feed").click();
        cy.get(".article-preview").first().click();
        cy.contains(articleBody.article.title).click();
        cy.get(".article-actions").contains("Delete Article").click();

        // from now we want to make a validation if the article is deleted
        // and we going to make another API request from the list of the article that we don't have the article that we created in the previous steps

        cy.request({
          url: "https://api.realworld.io/api/articles?limit=10&offset=0",
          headers: { Authorization: "Token " + token },
          method: "GET",
        }).then((response) => {
          console.log("====>>>>", response);

          expect(response.body.articles[0].title).not.to.equal(
            articleBody.article.title
          );
        });
      });
  });
});
