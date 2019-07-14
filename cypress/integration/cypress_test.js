/// <reference types="Cypress" />

// describe('Navigate to login page', function () {
//     it('Submit login form and open member drawer', function () {
//         // Visit homepage
//         cy.visit(Cypress.env('baseUrl'))
//         // Find link eleemnt to desired page. Click it to navigate to it
//         cy.get('.header-member-link')
//           .click()
//         // Find form eleemnts and fill them in
//         cy.get('#MemberLoginForm input[name="memberForm.email"]')
//           .type('dev@netmechanics.gr')
//           .should('have.value','dev@netmechanics.gr')
//
//         cy.get('#MemberLoginForm input[name="memberForm.password"]')
//           .type('123456')
//           .should('have.value','123456')
//
//         // Submit the form
//         cy.get('#MemberLoginForm button[type="submit"]')
//           .click()
//
//         // Assert login
//         // cy.get('link[href*="member"]') // prior 1.4.x
//         // Open drawer
//         cy.get('[data-target="#memberLinksPreview"]')
//           .click()
//     })
// })

describe('Add product to cart', function() {
    it('Navigate to catalog page and add product to cart', function() {
        cy.visit(Cypress.env('baseUrl'))
        // Navigate to category page
        cy.get('.nmmenu-link.depth-1').first().click()
        // Check if active class was added to navigetion element
        // .should('not.have.class', 'active')
        // Find product and click on the link to navigate to product page
        cy.get('.pr-item')
          .first() // or eq(0)
          .find('a[itemprop="url"]')
          .click()
        // Add product to cart
        // BUG - Cypress window.location issue: TODO https://github.com/cypress-io/cypress/issues/2367
        cy.get('button.btn-add2cart')
          .click()
    })
})
