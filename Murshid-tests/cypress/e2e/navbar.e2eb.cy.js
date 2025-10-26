describe('E2E-B (Buttons) - Navbar', () => {
  it('shows Login when logged out (redirect from /)', () => {
    cy.visit('/');
    cy.wait(600);
    cy.url().should('include', '/login');
    cy.contains('button', 'Login').should('be.visible');
  });

  it('shows Profile and Logout after login, and logout works', () => { //---------------------------
    cy.visit('/');
    cy.wait(600);
    cy.url().should('include', '/login');

    cy.get('#email').type('ayman@ayman.com');
    cy.wait(200);
    cy.get('#password').type('Ayman123');
    cy.wait(200);
    cy.contains('button', 'Login').click();
    cy.wait(1000);

    cy.contains('button', 'Profile', { timeout: 8000 }).should('be.visible');
    cy.contains('button', 'Logout').should('be.visible').click();
    cy.wait(800);
    cy.url().should('include', '/login');
  });
});

