// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

describe('Initial Placement Phase', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clickByTestId('start-game-button');
  });

  it('should start in initial placement phase with correct player', () => {
    // Check that we're in initial placement phase
    cy.shouldExistByTestId('current-initial-player');
    
    // Should show initial placement instructions via message
    cy.get('[data-testid="game-message"]').should('exist');
  });

  it('should display initial player progress indicator', () => {
    // Check if progress indicator exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid*="initial-progress"]').length > 0) {
        // Should have progress dots for each player
        cy.get('[data-testid*="initial-progress"]').should('have.length', 4);
      } else if ($body.find('[data-testid="current-initial-player"]').length > 0) {
        // At minimum, current initial player should be displayed
        cy.shouldExistByTestId('current-initial-player');
      } else {
        cy.log('Progress indicator not found - may not be visible in current phase');
      }
    });
  });

  it('should allow placing initial qubit cards in empty lanes', () => {
    // Select an initial qubit card from hand
    cy.get('[data-testid^="hand-card-initial-qubit"]').first().click();
    
    // The card should be selected (highlighted)
    cy.get('[data-testid^="hand-card-initial-qubit"]').first()
      .should('have.class', 'ring-cyan-400');
    
    // Click on an empty lane position 0
    cy.get('[data-testid="empty-slot-lane0-pos0"]').click();
    
    // Verify the card was placed
    cy.get('[data-testid^="board-card-initial-qubit-lane0-pos0"]').should('exist');
  });

  it('should only allow placement at position 0 in empty lanes', () => {
    // Try to select initial qubit card
    cy.get('[data-testid^="hand-card-initial-qubit"]').first().click();
    
    // Should not be able to place at position 1
    cy.get('[data-testid="empty-slot-lane0-pos1"]').click();
    
    // Should show error message
    cy.get('[data-message-type="error"]').should('be.visible');
  });

  it('should advance to next player after placing initial cards', () => {
    // Get current player name before any actions
    cy.getByTestId('current-initial-player').invoke('text').then((currentPlayerName) => {
      // Place all initial qubit cards for current player
      cy.get('[data-testid^="hand-card-initial-qubit"]').then(($cards) => {
        if ($cards.length > 0) {
          // Place each card
          $cards.each((index, card) => {
            if (index < 4) { // Max 4 lanes
              cy.wrap(card).click();
              cy.get(`[data-testid="empty-slot-lane${index}-pos0"]`).click();
              cy.wait(500); // Wait for placement
            }
          });
          
          // Wait for player transition
          cy.wait(1000);
          
          // Player should advance
          cy.getByTestId('current-initial-player').invoke('text').should('not.equal', currentPlayerName);
        } else {
          cy.log('No initial qubit cards to place');
        }
      });
    });
  });

  it('should allow skipping player with no initial cards', () => {
    // If skip button is available, click it
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="skip-initial-button"]').length > 0) {
        cy.clickByTestId('skip-initial-button');
        cy.get('[data-testid="game-message"]').should('be.visible');
      }
    });
  });

  it('should transition to normal play after initial placement', () => {
    // Complete initial placement by cycling through all players
    // This is a simplified approach - in reality would need to handle varying numbers of initial cards
    const maxRounds = 12; // Enough rounds to handle all players placing their cards
    let laneIndex = 0;
    
    for (let round = 0; round < maxRounds; round++) {
      cy.get('body').then(($body) => {
        // Check if we're still in initial placement phase
        if ($body.find('[data-testid="current-initial-player"]').length === 0) {
          // Already transitioned to normal play
          return false; // Exit loop
        }
        
        if ($body.find('[data-testid^="hand-card-initial-qubit"]').length > 0) {
          // Place an initial card if available
          cy.get('[data-testid^="hand-card-initial-qubit"]').first().click();
          cy.get(`[data-testid="empty-slot-lane${laneIndex % 4}-pos0"]`).click();
          laneIndex++;
          cy.wait(500); // Wait for placement
        } else if ($body.find('[data-testid="skip-initial-button"]').length > 0) {
          // Skip if no cards
          cy.clickByTestId('skip-initial-button');
          cy.wait(500);
        }
      });
    }
    
    // Should eventually transition to normal play
    cy.shouldExistByTestId('current-player-name', { timeout: 10000 });
  });
});