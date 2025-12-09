describe('verify specialist background', () => {
    it('verify specialist background', () => {
        cy.loginAsAdmin();
        cy.window().then((win) => {
            cy.spy(win, 'open').as('windowOpen');
          });
          
          cy.get('#admin-dashboard-proof-link-3959edd7-43d5-43c7-8ba8-d31449689899').click();
          
          cy.get('@windowOpen').should('be.called');
    });
});