describe('manage posts', () => {
    it('manage posts', () => {
        cy.loginAsAdmin();
        cy.get('#admin-dashboard-community-card > div > div').click();
        cy.get('#radix-\\:rc\\:-trigger-reports').click();
        cy.url().should('include', 'community');


    });
});