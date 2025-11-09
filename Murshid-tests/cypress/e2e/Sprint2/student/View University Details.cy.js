describe('View University Details', () => {
    it('1-View University Details - Sunny', () => {
        cy.loginAsStudent();
        cy.get('#navbar-nav-universities').click();
        cy.get('#universities-search-input').clear().type('this Item for testing');
        cy.get('#universities-card-d9776f6b-5a26-4eeb-8cc6-c3758933b53f').click();
        cy.url().should('include', '/d9776f6b-5a26-4eeb-8cc6-c3758933b53f');
    });
});