describe('Game Board Interactions', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clickByTestId('start-game-button');
  });

  it('should display quantum circuit board with lanes', () => {
    cy.shouldExistByTestId('quantum-circuit-board');
    cy.shouldExistByTestId('board-title').should('contain', '量子回路');
    
    // Check for lanes
    cy.shouldExistByTestId('board-lane-0');
    cy.shouldExistByTestId('board-lane-1');
    cy.shouldExistByTestId('board-lane-2');
    cy.shouldExistByTestId('board-lane-3');
  });

  it('should display initial I gates in each lane', () => {
    // Each lane should have at least one card (the initial I gate)
    cy.getByTestId('board-lane-0').within(() => {
      cy.get('[data-testid^="card-gate-lane0-pos0"]').should('exist');
    });
    cy.getByTestId('board-lane-1').within(() => {
      cy.get('[data-testid^="card-gate-lane1-pos0"]').should('exist');
    });
    cy.getByTestId('board-lane-2').within(() => {
      cy.get('[data-testid^="card-gate-lane2-pos0"]').should('exist');
    });
    cy.getByTestId('board-lane-3').within(() => {
      cy.get('[data-testid^="card-gate-lane3-pos0"]').should('exist');
    });
  });

  it('should show empty slots for card placement', () => {
    // Check for empty slots (they should exist after the initial I gates)
    cy.get('[data-testid^="empty-slot-"]').should('have.length.greaterThan', 0);
  });

  it('should be able to select a card and click on empty slot', () => {
    // Select a card from the current player's hand
    cy.getByTestId('player-hand-0').within(() => {
      cy.get('[data-testid^="card-"]').first().click();
    });
    
    // The selected card should have the selection ring
    cy.getByTestId('player-hand-0').within(() => {
      cy.get('[data-testid^="card-"]').first().should('have.class', 'ring-cyan-400');
    });
    
    // Try to click on an empty slot
    // Note: This might not actually place the card if it's not a valid move
    cy.get('[data-testid^="empty-slot-"]').first().click();
  });

  it('should display measurement and turn counters', () => {
    cy.getByTestId('turn-counter')
      .should('exist')
      .and('contain', 'ターン:')
      .and('contain', '1');
      
    cy.getByTestId('measurement-counter')
      .should('exist')
      .and('contain', '測定回数:')
      .and('contain', '0');
  });

  it('should show player scores', () => {
    // Check that all player scores are displayed
    for (let i = 0; i < 4; i++) {
      cy.getByTestId(`player-hand-${i}`).within(() => {
        cy.contains('得点:').should('exist');
      });
    }
  });

  it('should handle board scrolling', () => {
    // If there are many cards, the board should be scrollable
    // This test just checks that the scroll container exists
    cy.getByTestId('quantum-circuit-board').should('have.css', 'overflow-x', 'auto');
  });
});