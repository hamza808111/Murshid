describe('comment on a post', () => {
    it('comment on a post', () => {
        cy.loginAsStudent();
        cy.get('#navbar-nav-community').click();
        cy.contains('div.card-hover', 'for testing purposes').click();
        cy.get('textarea[placeholder="Write your answer here..."]').clear().type('testing comment');
        cy.contains('button', 'Submit Answer').click();

    });
});