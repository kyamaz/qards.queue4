describe('Game Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the title screen on initial load', () => {
    cy.shouldExistByTestId('title-screen');
    cy.shouldExistByTestId('start-game-button');
    cy.shouldExistByTestId('rules-button');
    cy.shouldExistByTestId('settings-button');
  });

  it('should navigate to game screen when start button is clicked', () => {
    cy.clickByTestId('start-game-button');
    cy.shouldNotExistByTestId('title-screen');
    cy.shouldExistByTestId('game-screen');
    cy.shouldExistByTestId('quantum-circuit-board');
  });

  it('should navigate to rules screen and back', () => {
    cy.clickByTestId('rules-button');
    cy.shouldExistByTestId('rules-title');
    cy.shouldExistByTestId('rules-back-button');
    
    cy.clickByTestId('rules-back-button');
    cy.shouldExistByTestId('title-screen');
  });

  it('should navigate to settings screen and back', () => {
    cy.clickByTestId('settings-button');
    cy.shouldExistByTestId('settings-title');
    cy.shouldExistByTestId('back-button');
    
    cy.clickByTestId('back-button');
    cy.shouldExistByTestId('title-screen');
  });
});