describe('Suspend User', () => {
    it('1-Suspend User', () => {
        cy.loginAsAdmin();
        cy.get('#admin-dashboard-suspend-user-3dbbd2aa-827f-45a6-b5ac-a9b3f85fb357').click();
        //have to login with the suspended (E2E) user information to check
        cy.contains('button', 'Suspend').click();
        
    });
    it('2-Reactivate User', () => {
        cy.loginAsAdmin();
        cy.get('#admin-dashboard-suspend-user-3dbbd2aa-827f-45a6-b5ac-a9b3f85fb357').click();
        //have to login with the suspended (E2E) user information to check
        
    });
});