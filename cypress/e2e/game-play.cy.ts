describe('Game Play', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clickByTestId('start-game-button');
  });

  it('should display game board and player hands', () => {
    cy.shouldExistByTestId('game-screen');
    cy.shouldExistByTestId('quantum-circuit-board');
    cy.shouldExistByTestId('board-title').should('contain', '量子回路');
    
    // Check for player hands
    cy.shouldExistByTestId('player-hand-0');
    cy.shouldExistByTestId('player-hand-1');
    cy.shouldExistByTestId('player-hand-2');
    cy.shouldExistByTestId('player-hand-3');
  });

  it('should display game information', () => {
    cy.shouldExistByTestId('turn-counter').should('contain', 'ターン:');
    cy.shouldExistByTestId('measurement-counter').should('contain', '測定回数:');
  });

  it('should highlight current player', () => {
    cy.getByTestId('player-hand-0').within(() => {
      cy.getByTestId('player-hand-title').should('contain', '現在のプレイヤー');
    });
  });

  it('should show quit confirmation when quit button is clicked', () => {
    cy.clickByTestId('quit-button');
    cy.shouldExistByTestId('confirmation-popup');
    cy.getByTestId('confirm-button').should('contain', '終了');
    cy.getByTestId('cancel-button').should('contain', 'キャンセル');
    
    // Cancel quit
    cy.clickByTestId('cancel-button');
    cy.shouldNotExistByTestId('confirmation-popup');
    cy.shouldExistByTestId('game-screen');
  });

  it('should return to title when confirming quit', () => {
    cy.clickByTestId('quit-button');
    cy.clickByTestId('confirm-button');
    cy.shouldExistByTestId('title-screen');
    cy.shouldNotExistByTestId('game-screen');
  });

  it('should be able to select a card from hand', () => {
    // This test assumes the first player has at least one card
    cy.getByTestId('player-hand-0').within(() => {
      cy.get('[data-testid^="card-"]').first().click();
      cy.get('[data-testid^="card-"]').first().should('have.class', 'ring-cyan-400');
    });
  });

  it('should show pass button for current player', () => {
    cy.getByTestId('player-hand-0').within(() => {
      cy.shouldExistByTestId('pass-button');
    });
    
    // Other players should not have pass button
    cy.getByTestId('player-hand-1').within(() => {
      cy.shouldNotExistByTestId('pass-button');
    });
  });
});