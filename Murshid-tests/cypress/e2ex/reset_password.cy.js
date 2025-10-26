describe('Password Reset - Forgot and Reset', () => {
  it('sends reset link for valid email', () => {
    cy.visit('/forgot-password');
    cy.get('#email').type('ayman@ayman.com');
    cy.contains('button', 'Send Reset Link').click();
    cy.contains('Password reset link sent').should('be.visible');
  });

  it('shows validation for invalid email', () => {
    cy.visit('/forgot-password');
    cy.get('#email').type('invalid-email');
    cy.contains('button', 'Send Reset Link').click();
    cy.url().should('include', '/forgot-password');
  });

  it('without valid session, visiting /reset-password redirects back to forgot', () => {
    cy.visit('/reset-password');
    // Component verifies session then redirects
    cy.url({ timeout: 10000 }).should('include', '/forgot-password');
  });
});

