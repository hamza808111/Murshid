describe('analytics', () => {
    it('analytics', () => {
        cy.loginAsAdmin();        
        cy.contains('button', /^More$/).click();
        cy.contains('div[role="menuitem"]', 'Analytics').click();
        cy.url().should('include', '/analytics');
    });
});