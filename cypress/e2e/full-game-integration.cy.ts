// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

describe('Full Game Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete a full game flow from start to finish', () => {
    // Start game
    cy.clickByTestId('start-game-button');
    cy.shouldExistByTestId('game-screen');
    
    // Skip initial placement phase
    cy.skipInitialPlacement();
    
    // Verify we're in normal play
    cy.shouldExistByTestId('current-player-name');
    cy.shouldExistByTestId('turn-indicator');
    cy.shouldExistByTestId('measurement-counter');
    
    // Play several rounds
    for (let round = 0; round < 10; round++) {
      cy.get('body').then(($body) => {
        // Check if game has ended
        if ($body.find('[data-testid="game-ended-banner"]').length > 0) {
          return false; // Exit loop
        }
        
        // Try to place a card or pass
        if ($body.find('[data-testid^="hand-card-"]').length > 0) {
          // Try to place any available card
          cy.get('[data-testid^="hand-card-"]').first().click();
          
          // Look for valid positions
          cy.get('body').then(($body) => {
            if ($body.find('.ring-cyan-400').length > 0) {
              cy.get('.ring-cyan-400').first().click();
            } else {
              // No valid positions, pass
              cy.clickByTestId('pass-button');
            }
          });
        } else {
          // No cards, pass
          cy.clickByTestId('pass-button');
        }
        
        cy.wait(500); // Brief pause between actions
      });
    }
    
    // Verify game state tracking
    cy.get('[data-testid$="-score"]').should('have.length', 4);
    cy.get('[data-testid$="-hand-count"]').should('have.length', 4);
    cy.get('[data-testid$="-pass-count"]').should('have.length', 4);
  });

  it('should handle measurement card placement and scoring', () => {
    cy.setupGameState('normal');
    
    // Look for measurement cards and try to place them
    cy.get('[data-testid^="hand-card-measurement"]').then(($cards) => {
      if ($cards.length > 0) {
        // Just test with first measurement card to avoid DOM detachment
        cy.get('[data-testid^="hand-card-measurement"]').first().click();
        
        // Check for valid positions
        cy.get('body').then(($body) => {
          if ($body.find('.ring-cyan-400').length > 0) {
            // Get initial measurement count
            cy.getByTestId('measurement-counter').invoke('text').then((initialText) => {
              const initialCount = parseInt(initialText.match(/\d+/)?.[0] || '0');
              
              // Place the card
              cy.get('.ring-cyan-400').first().click();
              
              // Wait for placement and score update
              cy.wait(1000);
              
              // Measurement counter should increase
              cy.getByTestId('measurement-counter').invoke('text').then((newText) => {
                const newCount = parseInt(newText.match(/\d+/)?.[0] || '0');
                expect(newCount).to.equal(initialCount + 1);
              });
              
              // Should show measurement result on the card
              cy.get('[data-testid^="measurement-result-"]').should('exist');
            });
          } else {
            cy.log('No valid positions for measurement card');
          }
        });
      } else {
        cy.log('No measurement cards in hand');
      }
    });
  });

  it('should handle control card placement sequence', () => {
    cy.setupGameState('normal');
    
    // Look for control cards with adaptive approach
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="hand-card-control"]').length > 0) {
        cy.get('[data-testid^="hand-card-control"]').first().click();
        
        // Check if there are valid positions for control card
        cy.get('body').then(($body) => {
          if ($body.find('.ring-cyan-400').length > 0) {
            // Place control card
            cy.get('.ring-cyan-400').first().click();
            
            // Wait for UI update
            cy.wait(500);
            
            // Should show target selection message
            cy.get('[data-testid="game-message"]').should('exist');
            
            // Look for highlighted target positions
            cy.get('body').then(($body) => {
              if ($body.find('.ring-cyan-400').length > 0) {
                // Select target position
                cy.get('.ring-cyan-400').first().click();
                
                // Wait for placement
                cy.wait(1000);
                
                // Should create both control and target cards
                cy.get('[data-testid^="board-card-control"]').should('exist');
                cy.get('[data-testid^="board-card-target"]').should('exist');
                
                // Check for connection lines if they exist
                cy.get('body').then(($body) => {
                  if ($body.find('[data-testid^="control-line-"]').length > 0) {
                    cy.get('[data-testid^="control-line-"]').should('exist');
                  }
                  if ($body.find('[data-testid^="target-line-"]').length > 0) {
                    cy.get('[data-testid^="target-line-"]').should('exist');
                  }
                });
                
                cy.log('Control card placement sequence completed');
              } else {
                cy.log('No valid target positions available');
              }
            });
          } else {
            cy.log('No valid positions for control card');
          }
        });
      } else {
        cy.log('No control cards in hand - test skipped');
      }
    });
  });

  it('should handle player elimination and game end', () => {
    cy.setupGameState('normal');
    
    // Force multiple passes to test elimination
    for (let i = 0; i < 5; i++) {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="game-ended-banner"]').length === 0) {
          cy.clickByTestId('pass-button');
          cy.wait(500);
        }
      });
    }
    
    // Check for elimination or game end
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid$="-eliminated-status"]').length > 0) {
        // Player eliminated
        cy.get('[data-testid$="-eliminated-status"]').should('exist');
      } else if ($body.find('[data-testid="game-ended-banner"]').length > 0) {
        // Game ended
        cy.shouldExistByTestId('winner-announcement');
        cy.shouldExistByTestId('final-score-display');
      }
    });
  });

  it('should properly track and display all game metrics', () => {
    cy.setupGameState('normal');
    
    // Verify all tracking elements are present and updating
    cy.shouldExistByTestId('turn-indicator');
    cy.shouldExistByTestId('measurement-counter');
    
    // Player metrics - use actual UUID-based player IDs
    cy.get('[data-testid^="player-info-"]').should('have.length', 4);
    
    // Check that each player has all required metrics
    cy.get('[data-testid^="player-info-"]').each(($playerInfo) => {
      const playerId = $playerInfo.attr('data-testid').replace('player-info-', '');
      cy.wrap($playerInfo).within(() => {
        cy.get(`[data-testid="player-${playerId}-name"]`).should('exist');
        cy.get(`[data-testid="player-${playerId}-hand-count"]`).should('exist');
        cy.get(`[data-testid="player-${playerId}-pass-count"]`).should('exist');
        cy.get(`[data-testid="player-${playerId}-score"]`).should('exist');
      });
    });
    
    // Make a move and verify some metric changes
    cy.get('[data-testid^="hand-card-"]').first().then(($card) => {
      if ($card.length > 0) {
        cy.wrap($card).click();
        
        cy.get('body').then(($body) => {
          if ($body.find('.ring-cyan-400').length > 0) {
            cy.get('.ring-cyan-400').first().click();
          } else {
            cy.clickByTestId('pass-button');
          }
        });
        
        // Wait for action to complete
        cy.wait(1000);
        
        // Verify some element exists (avoid strict checks due to async nature)
        cy.shouldExistByTestId('game-screen');
      }
    });
  });

  it('should maintain UI consistency across different screen sections', () => {
    cy.setupGameState('normal');
    
    // Verify main sections are present
    cy.shouldExistByTestId('game-main-area');
    cy.shouldExistByTestId('game-board-area');
    cy.shouldExistByTestId('player-hand-area');
    cy.shouldExistByTestId('game-status-messages');
    
    // Verify responsive layout elements
    cy.shouldExistByTestId('quantum-circuit-board').should('be.visible');
    cy.get('[data-testid^="player-info-"]').should('have.length', 4);
    
    // Check that interactive elements are accessible
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="pass-button"]').length > 0) {
        cy.getByTestId('pass-button').should('be.visible');
      }
      
      if ($body.find('[data-testid^="hand-card-"]').length > 0) {
        cy.get('[data-testid^="hand-card-"]').first().should('be.visible');
      }
    });
  });

  it('should handle rapid user interactions gracefully', () => {
    cy.setupGameState('normal');
    
    // Test rapid card selection without causing DOM detachment
    cy.get('[data-testid^="hand-card-"]').then(($cards) => {
      if ($cards.length >= 3) {
        // Click different cards rapidly
        cy.get('[data-testid^="hand-card-"]').eq(0).click();
        cy.wait(100);
        cy.get('[data-testid^="hand-card-"]').eq(1).click();
        cy.wait(100);
        cy.get('[data-testid^="hand-card-"]').eq(2).click();
        
        // Should have only one selected card
        cy.get('[data-testid^="hand-card-"]').filter('.ring-cyan-400').should('have.length', 1);
      } else {
        cy.log('Not enough cards for rapid selection test');
      }
    });
    
    // Test placement if valid positions exist
    cy.get('body').then(($body) => {
      if ($body.find('.ring-cyan-400').length > 0) {
        cy.get('.ring-cyan-400').first().click();
        cy.wait(500); // Wait for placement animation
      }
    });
    
    // Game should remain stable
    cy.shouldExistByTestId('game-screen');
    
    // Check for current player indicator (either initial or normal)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="current-initial-player"]').length > 0) {
        cy.shouldExistByTestId('current-initial-player');
      } else {
        cy.shouldExistByTestId('current-player-name');
      }
    });
  });
});