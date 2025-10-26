describe('Navbar - Login/Logout and Navigation', () => {
  it('shows Login when logged out', () => {
    cy.visit('/');
    // Protected route redirects to /login; check Login button exists
    cy.url().should('include', '/login');
    cy.contains('button', 'Login').should('be.visible');
  });

  it('shows Profile and Logout when logged in, and logout works', () => {
    cy.loginAsUser();
    cy.contains('button', 'Profile').should('be.visible');
    cy.contains('button', 'Logout').should('be.visible');
    cy.logoutViaNavbar();
  });
});

