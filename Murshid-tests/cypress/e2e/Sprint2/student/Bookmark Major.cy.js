describe('Bookmark Major', () => {
    it('1-Bookmark Major - Sunny', () => {
        cy.loginAsStudent();
        cy.get('#navbar-nav-majors').click();
        cy.get('#majors-bookmark-aa2046e2-22f4-40a1-9d08-d6b1af6e0679 > svg').click();
    });
});