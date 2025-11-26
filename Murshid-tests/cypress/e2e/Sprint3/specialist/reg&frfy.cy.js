describe('register and verify my background', () => {
    it('', () => {
        cy.visit('/signup');
        cy.get('#signup-name').type('specialist test name');
        cy.get('#signup-email').type(generateRandomEmail());
        const password = generateStrongPassword();
        cy.get('#signup-password').type(password);
        cy.get('#root > div:nth-child(3) > div').click();
        cy.get('#signup-confirm-password').type(password);
        cy.get('#signup-role').click();
        cy.get('#signup-role-specialist').click();
        cy.get('#signup-university').click();
        cy.get('#signup-university-db8e5b05-e898-4d4b-a87b-b6f4f5f31e2e').click();
        cy.get('#signup-gender').click();
        cy.get('#signup-gender-male').click();
        cy.get('#signup-level-specialist').click();
        cy.get('#signup-level-specialist-4').click();
        cy.get('#signup-specialist-proof').click();
        const image1 = 'image.png';
        cy.get('#signup-specialist-proof').attachFile(image1);
        cy.get('#signup-specialist-proof').should($input => {
            expect($input[0].files[0].name).to.equal(image1);
        });
        cy.get('#signup-submit-button').click();
        cy.contains('h1', 'Account Suspended').should('be.visible');
    
        



    });
});

function generateRandomEmail() {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let name = "";
  
    const length = Math.floor(Math.random() * 3) + 3; // (3 - 5)
    for (let i = 0; i < length; i++) {
      name += letters.charAt(Math.floor(Math.random() * letters.length));
    }
  
    return name + "@gmail.com";
  }


  function generateStrongPassword() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const all = upper + lower + numbers;
  
    let password = "";
  
    password += upper.charAt(Math.floor(Math.random() * upper.length));
  
    password += lower.charAt(Math.floor(Math.random() * lower.length));
  
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  
    while (password.length < 8) {
      password += all.charAt(Math.floor(Math.random() * all.length));
    }
  
    password = password.split("").sort(() => Math.random() - 0.5).join("");
  
    return password;
  }
  