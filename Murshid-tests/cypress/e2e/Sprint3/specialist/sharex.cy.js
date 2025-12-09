describe('Share Experiences', () => {
    it('Share Experiences', () => {
        cy.loginspec();
        cy.get('#navbar-nav-community').click();
        cy.contains('button', 'Create Post').click()
        cy.get('input[placeholder="Write your post title..."]').type('for testing purposes');
        cy.get('textarea[placeholder="Write your post content..."]').type('for testing purposes');
        // cy.get('#root > div:nth-child(3) > div > div').click();
        // cy.get('.flex.gap-2.mb-2 input').contain('Universities').type('king sa');
        cy.get('input[placeholder="Search universities..."]').type('king sa');
        cy.contains('button', 'King Saud University').click();
        cy.get('input[placeholder="Search majors..."]').type('soft');
        cy.contains('button', 'Software Engineering').click();
        cy.contains('button', 'Publish Post').click();
    });
});