describe('Add Major', () => {
    it('1-Add Major - Sunny', () => {
      cy.loginAsAdmin(); 
      cy.get('#navbar-nav-admin-majors').click();
      cy.get('#admin-majors-add-button').click();
      cy.get('#admin-majors-form-name').type('Test Major Name (EN)');
      cy.get('#admin-majors-form-name-ar').type('Test Major Name (AR)');
      cy.get('#admin-majors-form-description').type('Test Major Description (EN)');
      cy.get('#admin-majors-form-description-ar').type('Test Major Description (AR)');
      cy.get('#admin-majors-form-duration').clear().type('2');
      cy.get('#admin-majors-form-icon').clear().type('Test icon');
      cy.get('#admin-majors-form-salary').clear().type('0-0 SAR');
      cy.get('#admin-majors-form-career-prospects').clear().type('Test Career Prospects (EN)');
      cy.get('#admin-majors-form-career-prospects-ar').clear().type('Test Career Prospects (EN)');
      cy.get('#admin-majors-form-submit-button').click();
    });
    it('2-Add Major - Rainy', () => {
        cy.loginAsAdmin();
        cy.get('#navbar-nav-admin-majors').click();
        cy.get('#admin-majors-add-button').click();
        cy.get('#admin-majors-form-submit-button').click();
        // cy.contains('Pleas fill out this field.').should('be.visible');
        // have to check the message
    });
  });
