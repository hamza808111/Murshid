describe('Bookmark University', () => {
    it('1-Bookmark University - Sunny', () => {
        cy.loginAsStudent();
        cy.get('#navbar-nav-universities').click();
        cy.get('#universities-bookmark-d9776f6b-5a26-4eeb-8cc6-c3758933b53f').click();
    });
});