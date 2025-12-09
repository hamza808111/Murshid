describe('ask advice', () => {
    it('ask advice', () => {
        cy.loginAsStudent();
        cy.get('#navbar-notifications-button').click();
        cy.wait(2500);
        cy.contains('New answer on your question: is there any different between AI and CS majors?').closest('div.flex.items-start').click();
        cy.wait(2500);
        cy.contains('span', 'mohammed-specialist').click();
        cy.contains('button', 'Send Message').click();
        cy.get('textarea[placeholder="Type a message..."]').type('test');
        cy.get('button.bg-blue-500').click();
        
    });
});