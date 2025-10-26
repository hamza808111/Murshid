describe('E2E-B (Buttons) - Authentication', () => {
  it('user login via form and lands on /', () => {//------------------------------------------------
    // Start at home; app should route unauth users to login automatically
    cy.visit('/');
    cy.wait(800);
    cy.url().should('include', '/login');

    // Fill login form and submit
    cy.get('#email').type('ayman@ayman.com');
    cy.wait(400);
    cy.get('#password').type('Ayman123');
    cy.wait(400);
    cy.contains('button', 'Login').click();
    cy.wait(1200);

    cy.url().should('match', /\/$/);
  });

  it('admin login via form and lands on /admin', () => {//------------------------------------------------
    cy.visit('/');
    cy.wait(800);
    cy.url().should('include', '/login');

    cy.get('#email').type('admin1@admin.admin');
    cy.wait(400);
    cy.get('#password').type('adminADMIN');
    cy.wait(400);
    cy.contains('button', 'Login').click();
    cy.wait(1200);

    cy.url().should('include', '/admin');
  });

  it('guest login by clicking the button lands on /', () => {
    cy.visit('/');
    cy.wait(800);
    cy.url().should('include', '/login');

    cy.contains('button', 'Continue as Guest').click();
    cy.wait(1200);

    cy.url().should('match', /\/$/);
  });
});

describe('E2E-B (Buttons) - Signup via link', () => {
  it('signs up a new user from login link and redirects to /', () => {//------------------------------------------------
    const unique = Date.now();
    cy.visit('/');
    cy.wait(800);
    cy.url().should('include', '/login');

    // Navigate to signup by clicking the link
    cy.contains('a', 'Sign up').click();
    cy.wait(800);
    cy.url().should('include', '/signup');

    cy.get('#name').type(`Test User ${unique}`);
    cy.wait(300);
    cy.get('#email').type(`newuser+${unique}@test.com`);
    cy.wait(300);
    cy.get('#password').type('Password123!');
    cy.wait(200);
    cy.get('#password').blur();
    cy.get('#confirm-password').scrollIntoView().type('Password123!');
    cy.wait(300);
    cy.contains('button', 'Sign Up').click();
    cy.wait(1500);

    cy.url().should('match', /\/$/);
  });

  it('duplicate email prevents signup and stays on page', () => {//------------------------------------------------
    cy.visit('/');
    cy.wait(800);
    cy.url().should('include', '/login');

    cy.contains('a', 'Sign up').click();
    cy.wait(800);
    cy.url().should('include', '/signup');

    cy.get('#name').type('Duplicate User');
    cy.wait(200);
    cy.get('#email').type('m.ay.albilaly@gmail.com');
    cy.wait(200);
    cy.get('#password').type('Password123!');
    cy.wait(200);
    cy.get('#password').blur();
    cy.get('#confirm-password').type('Password123!');
    cy.wait(200);
    cy.contains('button', 'Sign Up').click();
    cy.wait(1200);

    cy.url().should('include', '/signup');
  });

  it('shows validation errors for invalid inputs and stays on /signup', () => {
    cy.visit('/');
    cy.wait(800);
    cy.url().should('include', '/login');

    cy.contains('a', 'Sign up').click();
    cy.wait(800);
    cy.url().should('include', '/signup');

    cy.get('#name').type('A');
    cy.wait(150);
    cy.get('#email').type('invalid-email');
    cy.wait(150);
    cy.get('#password').type('short');
    cy.wait(150);
    cy.get('#password').blur();
    cy.get('#confirm-password').type('mismatch');
    cy.wait(150);
    cy.contains('button', 'Sign Up').click();
    cy.wait(800);

    cy.url().should('include', '/signup');
  });
});

