describe('E2E-B (Buttons) - Password Reset (UI clicks)', () => {
  it('navigates from login to forgot password and sends reset link', () => {
    cy.visit('/');
    cy.wait(600);
    cy.url().should('include', '/login');

    // Click the "Forgot your password?" link
    cy.contains('a', 'Forgot your password?').click();
    cy.wait(700);
    cy.url().should('include', '/forgot-password');

    // Enter email and send
    cy.get('#email').type('ayman@ayman.com');
    cy.wait(200);
    cy.contains('button', 'Send Reset Link').click();
    cy.wait(1000);

    cy.contains('Password reset link sent', { timeout: 8000 }).should('be.visible');
  });

  it('shows validation on forgot password with invalid email', () => {
    cy.visit('/');
    cy.wait(600);
    cy.url().should('include', '/login');

    cy.contains('a', 'Forgot your password?').click();
    cy.wait(700);
    cy.url().should('include', '/forgot-password');

    cy.get('#email').type('invalid-email');
    cy.wait(200);
    cy.contains('button', 'Send Reset Link').click();
    cy.wait(800);

    cy.url().should('include', '/forgot-password');
  });
});

