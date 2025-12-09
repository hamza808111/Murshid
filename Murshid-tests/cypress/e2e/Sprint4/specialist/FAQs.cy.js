describe('FAQs', () => {
    it('FAQs', () => {
        cy.loginspec();
        cy.contains('button', 'More').click();
        cy.contains('div[role="menuitem"]', 'Help').click();
        

    });
});