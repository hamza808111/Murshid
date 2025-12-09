describe('under review', () => {
    it('under review', () => {
        cy.loginspec();
        cy.contains('button', 'More').click();
        cy.contains('div[role="menuitem"]', 'Community').click();
        cy.contains('button', 'Create Post').click();
        cy.get('input[placeholder="Write your post title..."]').type('My First Post'); 

        cy.get('textarea[placeholder="Write your post content..."]').type('This is the content of my first post.');

        cy.get('input[placeholder="Search universities..."]').type('King Saud University');
        cy.contains('button', 'King Saud University').click();
        cy.get('input[placeholder="Search majors..."]').type('Computer Science'); 
        cy.contains('button', 'Computer Science').click();
        cy.contains('button', 'Publish Post').click();
        cy.contains('Post created successfully').should('be.visible');

    });
});