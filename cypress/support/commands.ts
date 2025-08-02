/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to get element by data-testid
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Custom command to click element by data-testid
Cypress.Commands.add('clickByTestId', (testId: string) => {
  return cy.getByTestId(testId).click();
});

// Custom command to check if element exists by data-testid
Cypress.Commands.add('shouldExistByTestId', (testId: string) => {
  return cy.getByTestId(testId).should('exist');
});

// Custom command to check if element does not exist by data-testid
Cypress.Commands.add('shouldNotExistByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`).should('not.exist');
});

// TypeScript declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to get element by data-testid
       * @example cy.getByTestId('start-game-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command to click element by data-testid
       * @example cy.clickByTestId('start-game-button')
       */
      clickByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command to check if element exists by data-testid
       * @example cy.shouldExistByTestId('game-board')
       */
      shouldExistByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command to check if element does not exist by data-testid
       * @example cy.shouldNotExistByTestId('loading-spinner')
       */
      shouldNotExistByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};