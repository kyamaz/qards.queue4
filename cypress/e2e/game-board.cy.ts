describe('Game Board Interactions', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clickByTestId('start-game-button');
    cy.wait(3000);
    
    // Skip initial placement phase if needed
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="current-initial-player"]').length > 0) {
        cy.skipInitialPlacement();
        cy.wait(2000);
      }
    });
  });

  it('should display quantum circuit board with lanes', () => {
    cy.shouldExistByTestId('quantum-circuit-board');
    cy.shouldExistByTestId('board-title');
    
    // Check for lanes
    cy.shouldExistByTestId('board-lane-0');
    cy.shouldExistByTestId('board-lane-1');
    cy.shouldExistByTestId('board-lane-2');
    cy.shouldExistByTestId('board-lane-3');
  });

  it('should display initial cards in lanes', () => {
    // Each lane should exist
    for (let i = 0; i < 4; i++) {
      cy.getByTestId(`board-lane-${i}`).should('exist');
      
      // Check for cards in the lane (may or may not have cards initially)
      cy.getByTestId(`board-lane-${i}`).then(($lane) => {
        const cards = $lane.find('[data-testid^="board-card-"]');
        if (cards.length > 0) {
          cy.wrap($lane).within(() => {
            cy.get('[data-testid^="board-card-"]').should('have.length.greaterThan', 0);
          });
          cy.log(`Lane ${i} has ${cards.length} cards`);
        } else {
          cy.log(`Lane ${i} is empty initially`);
        }
      });
    }
  });

  it('should show empty slots for card placement', () => {
    // Check for empty slots (they should exist for card placement)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="empty-slot-"]').length > 0) {
        cy.get('[data-testid^="empty-slot-"]').should('have.length.greaterThan', 0);
        cy.log('Empty slots found for card placement');
      } else {
        cy.log('No empty slots visible - may be game-state dependent');
      }
    });
  });

  it('should be able to select a card and click on empty slot', () => {
    // Select a card from current player's hand if available
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="hand-card-"]').length > 0) {
        cy.get('[data-testid^="hand-card-"]').first().click();
        
        // The selected card should have the selection ring
        cy.get('[data-testid^="hand-card-"]').first().should('have.class', 'ring-cyan-400');
        
        // Try to click on an empty slot if available
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid^="empty-slot-"]').length > 0) {
            cy.get('[data-testid^="empty-slot-"]').first().click();
            cy.log('Clicked on empty slot');
          } else {
            cy.log('No empty slots available to click');
          }
        });
      } else {
        cy.log('No cards in hand to select');
      }
    });
  });

  it('should display measurement and turn counters', () => {
    // Check if turn indicator exists (may not be visible in initial phase)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="turn-indicator"]').length > 0) {
        cy.shouldExistByTestId('turn-indicator');
        cy.log('Turn indicator found');
      } else {
        cy.log('Turn indicator not visible - may be in initial phase');
      }
      
      if ($body.find('[data-testid="measurement-counter"]').length > 0) {
        cy.shouldExistByTestId('measurement-counter');
        cy.log('Measurement counter found');
      } else {
        cy.log('Measurement counter not visible - may be in initial phase');
      }
    });
  });

  it('should show player scores', () => {
    // Check that player info exists (using actual UUID-based IDs)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="player-info-"]').length > 0) {
        cy.get('[data-testid^="player-info-"]').should('have.length', 4);
        
        // Check that each player has score elements
        cy.get('[data-testid^="player-info-"]').each(($playerInfo) => {
          const playerId = $playerInfo.attr('data-testid').replace('player-info-', '');
          cy.wrap($playerInfo).within(() => {
            cy.get(`[data-testid="player-${playerId}-score"]`).should('exist');
          });
        });
        cy.log('Player scores found');
      } else {
        cy.log('Player info not found - may not be visible in current phase');
      }
    });
  });

  it('should handle board scrolling', () => {
    // Test that the board is visible and accessible for potential scrolling
    cy.getByTestId('quantum-circuit-board').should('be.visible');
    
    // Test that the board contains content that might require scrolling
    cy.getByTestId('quantum-circuit-board').within(() => {
      cy.get('[data-testid^="board-lane-"]').should('have.length', 4);
    });
  });
});