// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/// <reference types="cypress" />

/**
 * Game helper commands for common test scenarios
 */

// Helper to skip initial placement phase quickly
Cypress.Commands.add('skipInitialPlacement', () => {
  // Wait for initial placement to load
  cy.wait(1000);
  
  // Check if we're in initial placement phase
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="current-initial-player"]').length > 0) {
      // We're in initial placement, try to complete it quickly
      for (let round = 0; round < 10; round++) { // Max 10 rounds to avoid infinite loop
        cy.get('body').then(($body) => {
          // Check if still in initial phase
          if ($body.find('[data-testid="current-initial-player"]').length > 0) {
            if ($body.find('[data-testid^="hand-card-initial-qubit"]').length > 0) {
              // Place initial card if available
              cy.get('[data-testid^="hand-card-initial-qubit"]').first().click();
              
              // Find first available empty slot at position 0
              cy.get('[data-testid^="empty-slot-lane"][data-testid$="-pos0"]').first().click();
              cy.wait(500);
            } else if ($body.find('[data-testid="skip-initial-button"]').length > 0) {
              // Skip if no cards available
              cy.clickByTestId('skip-initial-button');
              cy.wait(500);
            } else {
              // No action available, break
              return false;
            }
          } else {
            // No longer in initial phase
            return false;
          }
        });
      }
    }
  });
  
  // Wait for transition to normal play
  cy.wait(1000);
});

// Helper to place a card if possible
Cypress.Commands.add('placeCardIfPossible', (cardTypePrefix: string) => {
  cy.get(`[data-testid^="hand-card-${cardTypePrefix}"]`).first().then(($card) => {
    if ($card.length > 0) {
      cy.wrap($card).click();
      
      // Look for highlighted valid positions
      cy.get('.ring-cyan-400').first().then(($slot) => {
        if ($slot.length > 0) {
          cy.wrap($slot).click();
          return true;
        }
      });
    }
  });
});

// Helper to get current player ID
Cypress.Commands.add('getCurrentPlayerId', () => {
  return cy.getByTestId('current-player-name').invoke('text').then((name) => {
    // Extract player letter from name (e.g., "プレイヤーA" -> "A")
    const match = name.match(/([A-F])$/);
    return match ? match[1] : 'A';
  });
});

// Helper to wait for turn to advance
Cypress.Commands.add('waitForTurnAdvance', (previousPlayerName: string) => {
  cy.getByTestId('current-player-name').should('not.contain', previousPlayerName);
});

// Helper to check if game has ended
Cypress.Commands.add('isGameEnded', () => {
  return cy.get('body').then(($body) => {
    return $body.find('[data-testid="game-ended-banner"]').length > 0;
  });
});

// Helper to setup a specific game state for testing
Cypress.Commands.add('setupGameState', (state: 'normal' | 'nearEnd' | 'initialComplete') => {
  cy.visit('/');
  cy.clickByTestId('start-game-button');
  
  switch (state) {
    case 'normal':
      cy.skipInitialPlacement();
      break;
      
    case 'initialComplete':
      cy.skipInitialPlacement();
      break;
      
    case 'nearEnd':
      cy.skipInitialPlacement();
      // Try to advance game state by placing multiple cards
      for (let i = 0; i < 5; i++) {
        cy.placeCardIfPossible('gate');
        cy.wait(500);
      }
      break;
  }
});

// Helper to force language change
Cypress.Commands.add('setLanguage', (language: 'ja' | 'en') => {
  cy.visit('/');
  cy.clickByTestId('settings-button');
  
  const optionText = language === 'ja' ? '日本語' : 'English';
  cy.get('select').contains('option', optionText).then(($option) => {
    const value = $option.val();
    cy.get('select').select(value);
  });
  
  cy.clickByTestId('save-button');
  cy.clickByTestId('back-button');
});

// Helper to verify card placement
Cypress.Commands.add('verifyCardPlaced', (cardType: string, laneIndex: number, position: number) => {
  cy.get(`[data-testid^="board-card-${cardType}-lane${laneIndex}-pos${position}"]`).should('exist');
});

// Helper to count cards of specific type on board
Cypress.Commands.add('countBoardCards', (cardType: string) => {
  return cy.get(`[data-testid^="board-card-${cardType}"]`).then(($cards) => {
    return $cards.length;
  });
});

// Helper to verify measurement result display
Cypress.Commands.add('verifyMeasurementResult', (cardId: string, expectedResult: '0' | '1') => {
  cy.get(`[data-testid="measurement-result-${cardId}"]`)
    .should('exist')
    .and('contain', expectedResult);
});

// TypeScript declarations for new commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Skip the initial placement phase quickly
       */
      skipInitialPlacement(): Chainable<void>;
      
      /**
       * Place a card of specified type if possible
       */
      placeCardIfPossible(cardTypePrefix: string): Chainable<boolean>;
      
      /**
       * Get the current player ID letter
       */
      getCurrentPlayerId(): Chainable<string>;
      
      /**
       * Wait for turn to advance from previous player
       */
      waitForTurnAdvance(previousPlayerName: string): Chainable<void>;
      
      /**
       * Check if game has ended
       */
      isGameEnded(): Chainable<boolean>;
      
      /**
       * Setup specific game state for testing
       */
      setupGameState(state: 'normal' | 'nearEnd' | 'initialComplete'): Chainable<void>;
      
      /**
       * Set language for testing
       */
      setLanguage(language: 'ja' | 'en'): Chainable<void>;
      
      /**
       * Verify a card was placed at specific position
       */
      verifyCardPlaced(cardType: string, laneIndex: number, position: number): Chainable<void>;
      
      /**
       * Count cards of specific type on board
       */
      countBoardCards(cardType: string): Chainable<number>;
      
      /**
       * Verify measurement result display
       */
      verifyMeasurementResult(cardId: string, expectedResult: '0' | '1'): Chainable<void>;
    }
  }
}

export {};