describe('Filter Majors', () => {
    it('1-Filter Majors by field', () => {
        cy.loginAsStudent();
        cy.get('#navbar-nav-majors').click();
        cy.get('#majors-category-select').click();
        cy.wait(1000); // letting Radix build the list
        cy.get('[role="option"]').contains('IT').click();
    });

    it('1-Filter Majors by City', () => {
        cy.loginAsStudent();
        cy.get('#navbar-nav-majors').click();
        cy.get('#majors-degree-type-select').click();
        cy.wait(1000); // letting Radix build the list
        cy.get('[role="option"]').contains('Bachelor').click();
    });
});