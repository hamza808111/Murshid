describe('Authentication - Login and Guest', () => {
  it('logs in as normal user and lands on /', () => {
    cy.loginAsUser();
    cy.url().should('match', /\/$/);
  });

  it('logs in as admin and lands on /admin', () => {
    cy.loginAsAdmin();
    cy.url().should('include', '/admin');
  });

  it('guest login navigates to /', () => {
    cy.loginAsGuest();
    cy.url().should('match', /\/$/);
  });

  it('shows validation for invalid email format', () => {
    cy.visit('/login');
    cy.get('#email').type('not-an-email');
    cy.get('#password').type('somepass');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/login');
  });

  it('handles wrong credentials gracefully', () => {
    cy.visit('/login');
    cy.get('#email').type('wrong@example.com');
    cy.get('#password').type('WrongPass123');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/login');
  });
});

describe('Authentication - Signup', () => {
  it('signs up a new user and redirects to /', () => {
    const unique = Date.now();
    cy.visit('/signup');
    cy.get('#name').type(`Test User ${unique}`);
    cy.get('#email').type(`newuser+${unique}@test.com`);
    cy.get('#password').type('Password123!');
    // Hide validation popup so it doesn't cover confirm input
    cy.get('#password').blur();
    cy.get('#confirm-password').scrollIntoView().type('Password123!');
    cy.contains('button', 'Sign Up').click();
    cy.url().should('match', /\/$/);
  });

  it('prevents duplicate email signup and stays on page', () => {
    cy.visit('/signup');
    cy.get('#name').type('Duplicate User');
    cy.get('#email').type('m.ay.albilaly@gmail.com');
    cy.get('#password').type('Password123!');
    cy.get('#password').blur();
    cy.get('#confirm-password').scrollIntoView().type('Password123!');
    cy.contains('button', 'Sign Up').click();
    cy.url().should('include', '/signup');
  });

  it('shows validation errors for invalid inputs', () => {
    cy.visit('/signup');
    cy.get('#name').type('A');
    cy.get('#email').type('invalid-email');
    cy.get('#password').type('short');
    cy.get('#password').blur();
    cy.get('#confirm-password').scrollIntoView().type('mismatch');
    cy.contains('button', 'Sign Up').click();
    cy.url().should('include', '/signup');
  });
});

