describe('Search Majors', () => {
    it('1-Search Majors - Sunny', () => {
        cy.loginAsStudent();
        cy.get('#navbar-nav-majors').click();
        cy.get('#majors-search-input').clear().type('Test major name ');
        cy.get('#majors-card-aa2046e2-22f4-40a1-9d08-d6b1af6e0679').should('be.visible');
    });
    it('2-Search Majors - Rainy', () => {
        cy.loginAsStudent();
        cy.get('#navbar-nav-majors').click();
        cy.get('#majors-search-input').clear().type(generateRandomString());
        cy.contains('No results found').should('be.visible');
    });
});

function generateRandomString(length = 20) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return result;
  }