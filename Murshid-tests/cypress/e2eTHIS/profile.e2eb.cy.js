describe('E2E-B (Buttons) - Profile', () => {
  it('redirects unauthenticated user to /login from /profile', () => { 
    //###
    cy.visit('/profile');
    cy.wait(800);
    cy.url().should('include', '/login');
  });//########################################################################################11

  it('shows profile information after logging in and clicking Profile', () => { 
    //###
    // Login by UI
    cy.visit('/');
    cy.wait(600);
    cy.url().should('include', '/login');
    cy.get('#email').type('ayman@ayman.com');
    cy.wait(200);
    cy.get('#password').type('Ayman123');
    cy.wait(200);
    cy.contains('button', 'Login').click();
    cy.wait(1000);

    // Navigate via navbar button
    cy.contains('button', 'Profile', { timeout: 10000 }).should('be.visible').click();
    cy.wait(800);
    cy.url().should('include', '/profile');

    // Wait for content
    cy.contains('h3', 'Personal Information', { timeout: 10000 })
      .scrollIntoView()
      .should('be.visible');
    cy.contains('Email Address', { timeout: 10000 }).should('be.visible');
  });//########################################################################################10

  it('edits name and saves via buttons', () => { 
    //###
    cy.visit('/');
    cy.wait(600);
    cy.url().should('include', '/login');
    cy.get('#email').type('ayman@ayman.com');
    cy.wait(200);
    cy.get('#password').type('Ayman123');
    cy.wait(200);
    cy.contains('button', 'Login').click();
    cy.wait(900);
    cy.contains('button', 'Profile', { timeout: 10000 }).click();
    cy.wait(700);
    cy.contains('button', 'Edit Profile', { timeout: 10000 }).click();
    const newName = `E2E User ${Date.now()}`;
    cy.get('#name').clear().type(newName);
    cy.wait(300);
    cy.contains('button', 'Save Changes').click();
    cy.wait(900);
    cy.contains(newName).should('be.visible');
  });//########################################################################################8

  it('invalid email shows validation and remains in edit mode', () => { 
    //###
    cy.visit('/');
    cy.wait(600);
    cy.url().should('include', '/login');
    cy.get('#email').type('ayman@ayman.com');
    cy.wait(200);
    cy.get('#password').type('Ayman123');
    cy.wait(200);
    cy.contains('button', 'Login').click();
    cy.wait(900);
    cy.contains('button', 'Profile', { timeout: 10000 }).click();
    cy.wait(700);
    cy.contains('button', 'Edit Profile', { timeout: 10000 }).click();
    cy.get('#email').clear().type('invalid-email');
    cy.wait(300);
    cy.contains('button', 'Save Changes').click();
    cy.wait(600);
    cy.contains('button', 'Save Changes').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
  });//########################################################################################9

  it('cancel reverts changes and exits edit mode', () => {
    cy.visit('/');
    cy.wait(600);
    cy.url().should('include', '/login');
    cy.get('#email').type('ayman@ayman.com');
    cy.wait(200);
    cy.get('#password').type('Ayman123');
    cy.wait(200);
    cy.contains('button', 'Login').click();
    cy.wait(900);
    cy.contains('button', 'Profile', { timeout: 10000 }).click();
    cy.wait(700);
    cy.contains('button', 'Edit Profile', { timeout: 10000 }).click();
    cy.get('#name').clear().type('Temp Change');
    cy.wait(300);
    cy.contains('button', 'Cancel').click();
    cy.wait(600);
    cy.contains('button', 'Edit Profile').should('be.visible');
  });
});

