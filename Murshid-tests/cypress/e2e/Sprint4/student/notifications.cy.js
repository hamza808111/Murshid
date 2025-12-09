//login as specialist
// post an answer
//login as a student 
//check if there is a notifications
//click on the notification
describe('notifications', () => {
    it('notifications', () => {
        cy.loginspec();
        cy.contains('button', 'More').click();
        cy.contains('div[role="menuitem"]', 'Community').click();
        cy.contains('button', 'Students').click();
        cy.wait(5000);
        cy.visit('https://murshid-vrtb.vercel.app/community/post/ae5878b5-d80f-429b-8e5c-395d1bc704d9');
        cy.wait(17000);
        const answer = 'test';
        cy.get('textarea[placeholder="Write your answer here..."]').clear().type('test'); 
        cy.wait(5000);
        cy.contains('button', 'Submit Answer').click();
        cy.wait(5000);
        cy.get('#navbar-profile-button').click();
        cy.get('#profile-logout-button').click();
        cy.get('#profile-logout-confirm-button').click();
        cy.wait(5000);

        cy.loginAsStudent();
        cy.get('#navbar-notifications-button').click();





        
        // cy.loginAsStudent();
        
    });
});