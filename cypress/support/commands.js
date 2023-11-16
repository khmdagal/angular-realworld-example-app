/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add("loginToApplication", () => {
  const userCredential = {
    user: {
      email: "adam@hotmail.com",
      password: "Kdagaal123",
    },
  };

  cy.request(
    "POST",
    "https://api.realworld.io/api/users/login",
    userCredential
  ).its("body").then((body) => {
    // just the above line I add its() method before we used then() and navigate through response.body.user.token
    // but this time we strait away touch body
console.log("====>>>",body)

    const token = body.user.token;

    // now we are going to visit the home page of our application
    // because we already authenticated in the just the above request we posted

    cy.visit("/", {
      // here when we visit the application home page
      // we provide and option onBeforeLoad event we want to use our window object
      // and then we want to ge the localStorage from the window
      // and then to set the item to the jwtToken and the value is the token we store in the token variable in the above

      onBeforeLoad(win) {
        win.localStorage.setItem("jwtToken", token);
      },
    });
  });

  // cy.visit("/login");
  // cy.get("[placeholder='Email']").type("adam@hotmail.com");
  // cy.get("[placeholder='Password']").type("Kdagaal123");
  // cy.get("form").submit();
});
