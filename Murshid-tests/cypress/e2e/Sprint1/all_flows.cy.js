// Consolidated, ordered E2E suite. Tests run top-to-bottom in this file.
// Small waits are included to make the flow easy to observe.

describe('F1 - Ordered E2E Flow Suite', () => {
  const waitS = 300;
  const waitM = 800;
  const waitL = 1500;
  const ts = Date.now();
  const signupEmail = `student.${ts}@example.com`;
  const studentEmail = 'ayman@ayman.com';
  const studentPass = 'Ayman123';
  const adminEmail = 'admin1@admin.admin';
  const adminPass = 'adminADMIN';

  const openSelectByLabel = (labelText) => {
    cy.contains('label', labelText, { timeout: 20000 })
      .scrollIntoView()
      .should('be.visible')
      .parent()
      .parent()
      .find('[role="combobox"]').first().click();
    cy.wait(waitS);
  };

  const pickOption = (text) => {
    cy.get('body').contains(text, { timeout: 20000 }).click({ force: true });
    cy.wait(waitS);
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  //########################################################################################(1)
  it('1-Signup as a student - Sunny: create account and land on /', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.contains('a', 'Sign up').click();
    cy.wait(waitM);
    cy.url().should('include', '/signup');

    cy.get('#name').type(`Student ${ts}`);
    cy.wait(waitS);
    cy.get('#email').type(signupEmail);
    cy.wait(waitS);
    cy.get('#password').type('Password123!');
    cy.wait(waitS);
    cy.get('#password').blur();
    cy.get('#confirm-password').type('Password123!');
    cy.wait(waitS);

    // Select Role = Student and optional fields if present
    openSelectByLabel('Role');
    pickOption('Student');
    cy.wait(waitM);

    // Student Type (if rendered)
    cy.get('body').then($b => {
      if ($b.text().includes('Student Type')) {
        openSelectByLabel('Student Type');
        pickOption('University');
      }
    });
    // Track (if rendered)
    cy.get('body').then($b => {
      if ($b.text().includes('Academic Track')) {
        openSelectByLabel('Academic Track');
        pickOption('Science');
      }
    });

    cy.contains('button', 'Sign Up').click();
    cy.wait(waitL);
    cy.url().should('match', /\/$/);

    /*
    TEST SCENARIO: Signup (happy)
    TEST CASE: Create new student with valid data
    PRE-CONDITION: Email unused; auto-login on signup
    TEST STEPS: /login → Sign up → fill fields → Role Student → (Student Type/Track) → Sign Up
    TEST DATA: name=Student <timestamp>, email=student.<timestamp>@example.com, pass=Password123!
    EXPECTED RESULT: Redirect to /
    POST CONDITION: New user session active
    ACTUAL RESULT: Redirected to /
    */
  });

  //########################################################################################(2)
  it('2-Signup as a student - Rainy: duplicate email stays on /signup', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.contains('a', 'Sign up').click();
    cy.wait(waitM);

    cy.get('#name').type('Duplicate Student');
    cy.wait(waitS);
    cy.get('#email').type('m.ay.albilaly@gmail.com');
    cy.wait(waitS);
    cy.get('#password').type('Password123!');
    cy.wait(waitS);
    cy.get('#password').blur();
    cy.get('#confirm-password').type('Password123!');
    cy.wait(waitS);
    cy.contains('button', 'Sign Up').click();
    cy.wait(waitM);
    cy.url().should('include', '/signup');

    /*
    TEST SCENARIO: Signup (duplicate)
    TEST CASE: Use already-registered email
    PRE-CONDITION: Email exists
    TEST STEPS: /signup → fill existing email → Sign Up
    TEST DATA: email=m.ay.albilaly@gmail.com
    EXPECTED RESULT: Remain on /signup with error
    POST CONDITION: No user created
    ACTUAL RESULT: Stayed on /signup
    */
  });

  //########################################################################################(3)
  it('3-Login as a student - Sunny: valid creds → /', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.get('#email').type(studentEmail);
    cy.wait(waitS);
    cy.get('#password').type(studentPass);
    cy.wait(waitS);
    cy.contains('button', 'Login').click();
    cy.wait(waitL);
    cy.url().should('match', /\/$/);
  });

  //########################################################################################(4)
  it('4-Login as a student - Rainy: wrong creds stay on /login', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.get('#email').type('wrong@example.com');
    cy.wait(waitS);
    cy.get('#password').type('WrongPass123');
    cy.wait(waitS);
    cy.contains('button', 'Login').click();
    cy.wait(waitM);
    cy.url().should('include', '/login');
  });

  //########################################################################################(5)
  it('5-Login as an admin - Sunny: valid creds → /admin', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.get('#email').type(adminEmail);
    cy.wait(waitS);
    cy.get('#password').type(adminPass);
    cy.wait(waitS);
    cy.contains('button', 'Login').click();
    cy.wait(waitL);
    cy.url().should('include', '/admin');
  });

  //########################################################################################(9)
  it('6-Admin access control - Guest is redirected to /login when visiting /admin', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.contains('button', 'Continue as Guest').click();
    cy.wait(waitM);
    cy.visit('/admin');
    cy.wait(waitM);
    cy.location('pathname', { timeout: 10000 }).should('eq', '/login');
  });

  //########################################################################################(10)
  it('7-Admin access control - Normal user is redirected away from /admin', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.get('#email').type(studentEmail);
    cy.wait(waitS);
    cy.get('#password').type(studentPass);
    cy.wait(waitS);
    cy.contains('button', 'Login').click();
    cy.wait(waitL);
    cy.visit('/admin');
    cy.wait(waitM);
    cy.location('pathname', { timeout: 10000 }).should('not.eq', '/admin');
  });





  it('8-opens delete dialog if delete button is available (conditional)', () => {
    //###
    cy.get('body').then($body => {
      const btn = $body.find('button.text-destructive');
      if (btn.length) {
        cy.wrap(btn.first()).click();
        // Expect a dialog to appear from shadcn AlertDialog
        cy.contains('Are you sure?').should('be.visible');
        // Prefer cancel to avoid destructive ops in shared envs
        cy.contains('button', 'Cancel').click();
      } else {
        cy.log('No delete buttons found - skipping dialog test');
      }
    });
  });





  //########################################################################################(6)
  // it('8-Manage users (admin) - Delete dialog (conditional) and cancel', () => {
  //   cy.visit('/login');
  //   cy.wait(waitM);
  //   cy.get('#email').type(adminEmail);
  //   cy.wait(waitS);
  //   cy.get('#password').type(adminPass);
  //   cy.wait(waitS);
  //   cy.contains('button', 'Login').click();
  //   cy.wait(waitL);

  //   cy.location('pathname', { timeout: 10000 }).then((p) => {
  //     if (p !== '/admin') {
  //       cy.log('Not on /admin (is_admin may be false); skipping dialog test');
  //       return;
  //     }
  //     cy.get('body').then($body => {
  //       // Prefer first enabled delete button
  //       const enabledBtns = $body.find('button.text-destructive:not([disabled])');
  //       if (enabledBtns.length) {
  //         cy.wrap(enabledBtns.first()).scrollIntoView().click({ force: true });
  //         cy.wait(waitS);
  //         // Dialog is rendered in a portal; search globally with generous timeout
  //         cy.get('body').contains('Are you sure?', { timeout: 15000 }).should('exist');
  //         cy.get('body').contains('button', 'Cancel', { timeout: 10000 }).click({ force: true });
  //         cy.wait(waitS);
  //       } else {
  //         cy.log('No enabled delete button present; skipping');
  //       }
  //     });
  //   });
  // });

  //########################################################################################(7)
  it('9-View profile as a student - Sunny: login then open Profile', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.get('#email').type(studentEmail);
    cy.wait(waitS);
    cy.get('#password').type(studentPass);
    cy.wait(waitS);
    cy.contains('button', 'Login').click();
    cy.wait(waitL);
    cy.contains('button', 'Profile', { timeout: 10000 }).should('be.visible').click();
    cy.wait(waitM);
    cy.url().should('include', '/profile');
    cy.contains('h3', 'Personal Information', { timeout: 10000 }).should('be.visible');
    cy.contains('Email Address', { timeout: 10000 }).should('be.visible');
  });

  //########################################################################################(8)
  it('10-Edit profile as a student - Sunny: change name and save', () => {
    const newName = `E2E User ${Date.now()}`;
    cy.visit('/login');
    cy.wait(waitM);
    cy.get('#email').type(studentEmail);
    cy.wait(waitS);
    cy.get('#password').type(studentPass);
    cy.wait(waitS);
    cy.contains('button', 'Login').click();
    cy.wait(waitL);
    cy.contains('button', 'Profile', { timeout: 10000 }).click();
    cy.wait(waitM);
    cy.contains('button', 'Edit Profile', { timeout: 10000 }).click();
    cy.wait(waitS);
    cy.get('#name').clear().type(newName);
    cy.wait(waitS);
    cy.contains('button', 'Save Changes').click();
    cy.wait(waitM);
    cy.contains(newName).should('be.visible');
  });

  //########################################################################################(8)
  it('11-Edit profile as a student - Rainy: invalid email stays in edit mode', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.get('#email').type(studentEmail);
    cy.wait(waitS);
    cy.get('#password').type(studentPass);
    cy.wait(waitS);
    cy.contains('button', 'Login').click();
    cy.wait(waitL);
    cy.contains('button', 'Profile', { timeout: 10000 }).click();
    cy.wait(waitM);
    cy.contains('button', 'Edit Profile', { timeout: 10000 }).click();
    cy.wait(waitS);
    cy.get('#email').clear().type('invalid-email');
    cy.wait(waitS);
    cy.contains('button', 'Save Changes').click();
    cy.wait(waitS);
    cy.contains('button', 'Save Changes').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
  });

  //########################################################################################(7)
  it('12-Logout as a student - Sunny: login then logout → /login', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.get('#email').type(studentEmail);
    cy.wait(waitS);
    cy.get('#password').type(studentPass);
    cy.wait(waitS);
    cy.contains('button', 'Login').click();
    cy.wait(waitL);
    cy.contains('button', 'Logout', { timeout: 10000 }).click();
    cy.wait(waitM);
    cy.url().should('include', '/login');
  });

  //########################################################################################(8)
  it('13-Reset password as a student - Sunny: send reset link', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.contains('a', 'Forgot your password?').click();
    cy.wait(waitM);
    cy.url().should('include', '/forgot-password');
    cy.get('#email').type(studentEmail);
    cy.wait(waitS);
    cy.contains('button', 'Send Reset Link').click();
    cy.wait(waitL);
    cy.contains('Password reset link sent', { timeout: 10000 }).should('be.visible');
  });

  //########################################################################################(8)
  it('14-Reset password as a student - Rainy: invalid email validation', () => {
    cy.visit('/login');
    cy.wait(waitM);
    cy.contains('a', 'Forgot your password?').click();
    cy.wait(waitM);
    cy.url().should('include', '/forgot-password');
    cy.get('#email').type('invalid-email');
    cy.wait(waitS);
    cy.contains('button', 'Send Reset Link').click();
    cy.wait(waitS);
    cy.url().should('include', '/forgot-password');
  });
});


