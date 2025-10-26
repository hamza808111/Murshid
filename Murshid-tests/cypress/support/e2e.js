// Global Cypress support file
// Runs before every spec

// Utility: clear session state
beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

// Custom commands for auth flows
Cypress.Commands.add('loginAsUser', () => {
  cy.visit('/login');
  cy.get('#email').clear().type('ayman@ayman.com');
  cy.get('#password').clear().type('Ayman123');
  cy.contains('button', 'Login').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/login');
  cy.get('#email').clear().type('admin1@admin.admin');
  cy.get('#password').clear().type('adminADMIN');
  cy.contains('button', 'Login').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('loginAsGuest', () => {
  cy.visit('/login');
  cy.contains('button', 'Continue as Guest').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('logoutViaNavbar', () => {
  cy.contains('button', 'Logout').click({ force: true });
  cy.url().should('include', '/login');
});

// Types for TS users (ignored in JS env)
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       loginAsUser(): Chainable<void>
//       loginAsAdmin(): Chainable<void>
//       loginAsGuest(): Chainable<void>
//       logoutViaNavbar(): Chainable<void>
//     }
//   }
// }


