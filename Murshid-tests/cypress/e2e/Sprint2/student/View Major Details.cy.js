describe('View Major Details', () => {
    it('1-View Major Details - Sunny', () => {
        cy.loginAsStudent();
        cy.get('#navbar-nav-majors').click();
        cy.get('#majors-search-input').clear().type('Test major name ');
        cy.get('#majors-card-aa2046e2-22f4-40a1-9d08-d6b1af6e0679').click();
        cy.url().should('include', '/aa2046e2-22f4-40a1-9d08-d6b1af6e0679');
    });
});