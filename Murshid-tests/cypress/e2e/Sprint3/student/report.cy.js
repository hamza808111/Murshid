describe('report a post', () => {
    it('report a post', () => {
        cy.loginAsStudent();
        cy.get('#navbar-nav-community').click();
        cy.contains('div.card-hover', 'Last time im here').click();
        cy.contains('button', 'Report').click();
        cy.contains('label', 'Spam or advertising').click();
        cy.contains('button', 'Submit Report').click();
        cy.get('textarea[placeholder="Write your report here..."]').clear().type('testing report');
        cy.contains('button', 'Submit Report').click();


    });
});