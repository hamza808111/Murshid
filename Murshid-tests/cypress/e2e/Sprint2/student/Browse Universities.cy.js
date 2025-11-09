describe('Browse Universities', () => {
    it('1-Browse Universities - Sunny', () => {
        cy.loginAsStudent();
        cy.get('#navbar-nav-universities').click();
        cy.get('#universities-search-input').clear().type('this Item for testing');
        cy.wait(1500);
        cy.get('#universities-card-d9776f6b-5a26-4eeb-8cc6-c3758933b53f').click();
    });
});