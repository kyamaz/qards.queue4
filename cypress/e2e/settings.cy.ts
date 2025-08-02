describe('Settings Screen', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clickByTestId('settings-button');
  });

  it('should display all settings sections', () => {
    cy.shouldExistByTestId('settings-title');
    cy.shouldExistByTestId('game-settings-title');
    cy.shouldExistByTestId('rule-settings-title');
    cy.shouldExistByTestId('system-settings-title');
  });

  it('should update player count', () => {
    cy.getByTestId('player-count-select').select('5');
    cy.getByTestId('player-count-select').should('have.value', '5');
  });

  it('should update COM player count', () => {
    cy.getByTestId('com-player-count-select').select('2');
    cy.getByTestId('com-player-count-select').should('have.value', '2');
    cy.getByTestId('player-count-display').should('contain', '人間プレイヤー1人 + COMプレイヤー2人');
  });

  it('should toggle show hints checkbox', () => {
    cy.getByTestId('show-hints-checkbox').should('be.checked');
    cy.getByTestId('show-hints-checkbox').click();
    cy.getByTestId('show-hints-checkbox').should('not.be.checked');
  });

  it('should toggle controlled Hadamard checkbox', () => {
    cy.getByTestId('controlled-hadamard-checkbox').should('not.be.checked');
    cy.getByTestId('controlled-hadamard-checkbox').click();
    cy.getByTestId('controlled-hadamard-checkbox').should('be.checked');
  });

  it('should save settings and persist them', () => {
    // Change some settings
    cy.getByTestId('difficulty-select').select('hard');
    cy.getByTestId('show-hints-checkbox').click();
    
    // Save settings
    cy.clickByTestId('save-button');
    
    // Go back to title
    cy.clickByTestId('back-button');
    cy.shouldExistByTestId('title-screen');
    
    // Return to settings
    cy.clickByTestId('settings-button');
    
    // Verify settings persisted
    cy.getByTestId('difficulty-select').should('have.value', 'hard');
    cy.getByTestId('show-hints-checkbox').should('not.be.checked');
  });

  it('should reset settings to defaults', () => {
    // Change some settings
    cy.getByTestId('difficulty-select').select('easy');
    cy.getByTestId('com-player-count-select').select('1');
    
    // Reset settings
    cy.clickByTestId('reset-button');
    
    // Verify defaults restored
    cy.getByTestId('difficulty-select').should('have.value', 'normal');
    cy.getByTestId('com-player-count-select').should('have.value', '3');
  });
});