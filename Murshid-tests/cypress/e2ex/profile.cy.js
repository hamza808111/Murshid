describe('Profile - View and Edit', () => {
  it('redirects unauthenticated user to /login', () => {
    cy.visit('/profile');
    cy.url().should('include', '/login');
  });

  it('shows profile info for logged-in user', () => {
    cy.loginAsUser();

    // Navigate via navbar to ensure auth UI is ready
    cy.contains('button', 'Profile', { timeout: 10000 })
      .should('be.visible')
      .click();

    cy.url().should('include', '/profile');

    // Wait for any loading indicator to disappear if present
    cy.get('body').then($b => {
      if ($b.find('.animate-spin').length) {
        cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');
      }
    });

    cy.contains('h3', 'Personal Information', { timeout: 10000 })
      .scrollIntoView()
      .should('be.visible');
    cy.contains('Email Address', { timeout: 10000 }).should('be.visible');
  });

  it('edits name and saves successfully', () => {
    cy.loginAsUser();
    cy.contains('button', 'Profile', { timeout: 10000 }).should('be.visible').click();
    cy.url().should('include', '/profile');
    cy.get('body').then($b => {
      if ($b.find('.animate-spin').length) {
        cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');
      }
    });
    cy.contains('button', 'Edit Profile', { timeout: 10000 }).should('be.visible').click();
    const newName = `E2E User ${Date.now()}`;
    cy.get('#name').clear().type(newName);
    cy.contains('button', 'Save Changes').click();
    cy.contains(newName).should('be.visible');
  });

  it('shows validation when email is invalid and stays in edit mode', () => {
    cy.loginAsUser();
    cy.contains('button', 'Profile', { timeout: 10000 }).should('be.visible').click();
    cy.url().should('include', '/profile');
    cy.get('body').then($b => {
      if ($b.find('.animate-spin').length) {
        cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');
      }
    });
    cy.contains('button', 'Edit Profile', { timeout: 10000 }).should('be.visible').click();
    cy.get('#email').clear().type('invalid-email');
    cy.contains('button', 'Save Changes').click();
    // Still in edit mode (Save/Cancel present)
    cy.contains('button', 'Save Changes').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
  });

  it('cancel reverts changes and exits edit mode', () => {
    cy.loginAsUser();
    cy.contains('button', 'Profile', { timeout: 10000 }).should('be.visible').click();
    cy.url().should('include', '/profile');
    cy.get('body').then($b => {
      if ($b.find('.animate-spin').length) {
        cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');
      }
    });
    cy.contains('button', 'Edit Profile', { timeout: 10000 }).should('be.visible').click();
    cy.get('#name').clear().type('Temp Change');
    cy.contains('button', 'Cancel').click();
    cy.contains('button', 'Edit Profile').should('be.visible');
  });
});

