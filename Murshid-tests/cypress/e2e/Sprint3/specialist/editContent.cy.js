describe('edit my shared posts or tips', () => {

    let editNumber;

    before(() => {
      cy.readFile('cypress/counter.json').then((data) => {
        editNumber = data.editNumber + 1;      // زيادة الرقم
        cy.writeFile('cypress/counter.json', { editNumber }); // حفظ الرقم الجديد
      });
    });

    it('edit my shared posts ', () => {
        const newText = `this edit number ${editNumber}\nthis edit number ${editNumber}\nthis edit number ${editNumber}\nthis edit number ${editNumber}`;
        cy.loginspec();
        cy.get('#navbar-nav-community').click();
        cy.contains('button', 'My Posts').click();
        cy.wait(2000);
        cy.get('div.flex.gap-2 > button.h-9.text-blue-500.rounded-xl').eq(0).click();
        cy.get('#edit-post-content').clear().type(newText);
        cy.contains('button', 'Save Changes').click();

    });
});