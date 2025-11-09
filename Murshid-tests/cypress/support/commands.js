// here are the commands that are needed for Sprint 2 testing (Admin)
Cypress.Commands.add('loginAsAdmin', () => {
    cy.visit('/');
    cy.get('#navbar-login-button').click();
    cy.get('#login-email').clear().type('admin1@admin.admin');
    cy.get('#login-password').clear().type('adminADMIN');
    cy.get('#login-submit-button').click();
    cy.url().should('include', '/admin');
  });

Cypress.Commands.add('loginAsStudent', () => {
    cy.visit('/');
    cy.get('#navbar-login-button').click();
    cy.get('#login-email').clear().type('ayman@ayman.com');
    cy.get('#login-password').clear().type('Ayman123');
    cy.get('#login-submit-button').click();
    cy.url().should('not.include', '/login');
});