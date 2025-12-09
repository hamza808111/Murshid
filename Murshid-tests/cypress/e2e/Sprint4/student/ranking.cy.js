describe('ranking', () => {
    it('ranking', () => {
        cy.loginAsStudent();
        cy.wait(5000);
        cy.contains('button', 'More').click();
        cy.contains('div[role="menuitem"]', 'Majors').click();
        cy.contains('button[role="tab"]', 'Rankings').click();
        // cy.wait(23000); not in demo

    });
});