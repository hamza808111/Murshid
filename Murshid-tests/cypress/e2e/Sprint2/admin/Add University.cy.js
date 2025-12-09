describe('Add University', () => {
    it('1-Add University - Sunny', () => {
        cy.loginAsAdmin();
        cy.get('#navbar-nav-admin-universities').click();
        cy.get('#admin-universities-add-button').click();
        cy.get('#admin-universities-form-name').clear().type('this Item for testing');
        cy.get('#admin-universities-form-name-ar').clear().type('Test Uni Name (AR)');
        cy.get('#admin-universities-form-description').clear().type('Test Uni-Description (EN)');
        cy.get('#admin-universities-form-description-ar').clear().type('Test Uni-Description (AR)');
        cy.get('#admin-universities-form-city').clear().type('Test Uni-City');
        cy.get('#admin-universities-form-establishment-year').clear().type('1900');
        cy.get('#admin-universities-form-student-count').clear().type('9999');
        cy.get('#admin-universities-form-website').clear().type('https://murshid-vrtb.vercel.app');
        cy.get('#admin-universities-form-contact-email').clear().type('xyz@xyz.xyz');
        cy.get('#admin-universities-form-contact-phone').clear().type('+xyz123456789');
        cy.get('#admin-universities-form-submit-button').click();
        
        // cy.get('').click();
        // cy.get('').clear().type('');

    });
    it('2-Add University - Rainy', () => {
        cy.loginAsAdmin();
        cy.get('#navbar-nav-admin-universities').click();
        cy.get('#admin-universities-add-button').click();
        cy.get('#admin-universities-form-submit-button').click();
    });
});