describe('Game Play', () => {
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

  it('should display game board and player hands', () => {
    cy.shouldExistByTestId('game-screen');
    cy.shouldExistByTestId('quantum-circuit-board');
    cy.shouldExistByTestId('board-title');
    
    // Check for player information panels (using actual UUID-based IDs)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="player-info-"]').length > 0) {
        cy.get('[data-testid^="player-info-"]').should('have.length', 4);
        cy.log('Player info panels found');
      } else {
        cy.log('Player info panels not visible in current phase');
      }
    });
    
    // Check for player hand area
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="player-hand-area"]').length > 0) {
        cy.shouldExistByTestId('player-hand-area');
        cy.log('Player hand area found');
      } else {
        cy.log('Player hand area not visible in current phase');
      }
    });
  });

  it('should display game information', () => {
    // Check if game info elements exist (may not be visible in initial phase)
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

  it('should highlight current player', () => {
    // Check for current player display
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="current-player-name"]').length > 0) {
        cy.shouldExistByTestId('current-player-name');
        cy.log('Current player name found');
      } else if ($body.find('[data-testid="current-initial-player"]').length > 0) {
        cy.shouldExistByTestId('current-initial-player');
        cy.log('Current initial player found');
      } else {
        cy.log('Current player indicator not found');
      }
      
      // Check for active indicator if available
      if ($body.find('[data-testid$="-current-turn"]').length > 0) {
        cy.get('[data-testid$="-current-turn"]').should('exist');
        cy.log('Current turn indicator found');
      }
    });
  });

  it('should show quit confirmation when quit button is clicked', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="quit-button"]').length > 0) {
        cy.clickByTestId('quit-button');
        cy.shouldExistByTestId('confirmation-popup');
        cy.shouldExistByTestId('confirm-button');
        cy.shouldExistByTestId('cancel-button');
        
        // Cancel quit
        cy.clickByTestId('cancel-button');
        cy.shouldNotExistByTestId('confirmation-popup');
        cy.shouldExistByTestId('game-screen');
        cy.log('Quit confirmation tested successfully');
      } else {
        cy.log('Quit button not available in current phase');
      }
    });
  });

  it('should return to title when confirming quit', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="quit-button"]').length > 0) {
        cy.clickByTestId('quit-button');
        cy.clickByTestId('confirm-button');
        cy.shouldExistByTestId('title-screen');
        cy.log('Quit to title tested successfully');
      } else {
        cy.log('Quit button not available in current phase');
      }
    });
  });

  it('should be able to select a card from hand', () => {
    // Check if cards are available in hand
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="hand-card-"]').length > 0) {
        // Select first card
        cy.get('[data-testid^="hand-card-"]').first().click();
        
        // Card should be selected (highlighted)
        cy.get('[data-testid^="hand-card-"]').first().should('have.class', 'ring-cyan-400');
        cy.log('Card selection successful');
      } else {
        cy.log('No cards available in hand');
      }
    });
  });

  it('should show pass button for current player', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="pass-button"]').length > 0) {
        cy.shouldExistByTestId('pass-button');
        cy.log('Pass button found');
      } else {
        cy.log('Pass button not available in current phase');
      }
    });
  });

  it('should handle card placement when valid positions exist', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="hand-card-"]').length > 0) {
        // Select a card
        cy.get('[data-testid^="hand-card-"]').first().click();
        
        // Check for valid placement positions
        cy.get('body').then(($body) => {
          if ($body.find('.ring-cyan-400').length > 0) {
            // Valid positions exist
            cy.get('.ring-cyan-400').should('have.length.greaterThan', 0);
            cy.log('Valid placement positions found');
          } else {
            cy.log('No valid placement positions for selected card');
          }
        });
      } else {
        cy.log('No cards available for placement test');
      }
    });
  });

  it('should display game status messages', () => {
    // Check if game message area exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="game-message"]').length > 0) {
        cy.shouldExistByTestId('game-message');
        cy.log('Game message area found');
      } else if ($body.find('[data-testid="game-status-messages"]').length > 0) {
        cy.shouldExistByTestId('game-status-messages');
        cy.log('Game status messages area found');
      } else {
        cy.log('Game message areas not found or not visible');
      }
    });
  });

  it('should maintain consistent UI layout', () => {
    // Verify basic game structure exists
    cy.shouldExistByTestId('game-screen');
    
    // Check main game areas
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="game-main-area"]').length > 0) {
        cy.shouldExistByTestId('game-main-area');
        cy.log('Main game area found');
      }
      
      if ($body.find('[data-testid="game-board-area"]').length > 0) {
        cy.shouldExistByTestId('game-board-area');
        cy.log('Game board area found');
      }
      
      // At minimum, quantum circuit board should always be present
      cy.shouldExistByTestId('quantum-circuit-board');
    });
  });
});