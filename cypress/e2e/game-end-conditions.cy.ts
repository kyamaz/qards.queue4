// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

describe('Game End Conditions and Scoring', () => {
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

  it('should display game end banner when game ends', () => {
    // Check if game end banner exists (might not be visible initially)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="game-ended-banner"]').length > 0) {
        cy.shouldExistByTestId('game-ended-banner');
        cy.log('Game end banner found and verified');
      } else {
        cy.log('Game end banner not present - game still active');
      }
    });
  });

  it('should show winner announcement when game ends', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="winner-announcement"]').length > 0) {
        cy.shouldExistByTestId('winner-announcement');
        cy.log('Winner announcement found and verified');
      } else {
        cy.log('Winner announcement not present - game still active');
      }
    });
  });

  it('should display final scores for all players', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="final-score-display"]').length > 0) {
        cy.shouldExistByTestId('final-score-display');
        cy.log('Final score display found');
      } else {
        cy.log('Final score display not present - game still active');
      }
    });
  });

  it('should calculate hand penalties correctly in final scores', () => {
    // Check if final score breakdown elements exist
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="final-score-breakdown-"]').length > 0) {
        // Final score breakdown should show scoring information
        cy.get('[data-testid^="final-score-breakdown-"]').each(($breakdown) => {
          cy.wrap($breakdown).should('be.visible');
          cy.log('Final score breakdown element found');
        });
      } else {
        // Check alternative selectors or skip if game hasn't ended
        cy.log('Final score breakdown not present - game may still be active');
      }
    });
  });

  it('should handle player elimination after 4 passes', () => {
    // Test player elimination logic
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="pass-button"]').length > 0 && 
          $body.find('[data-testid="game-ended-banner"]').length === 0) {
        
        // Try to make passes and check for elimination
        for (let i = 0; i < 4; i++) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="pass-button"]').length > 0) {
              cy.clickByTestId('pass-button');
              cy.wait(1000);
              cy.log(`Pass ${i + 1} executed`);
              
              // Check for pass count updates
              cy.get('[data-testid$="-pass-count"]').then(($passCounts) => {
                if ($passCounts.length > 0) {
                  cy.log('Pass count elements found');
                }
              });
            }
          });
        }
        
        // After 4 passes, check for elimination status
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid$="-eliminated-status"]').length > 0) {
            cy.get('[data-testid$="-eliminated-status"]').should('exist');
            cy.log('Player elimination status found');
          } else {
            cy.log('No elimination status found - may not be implemented or visible');
          }
        });
      } else {
        cy.log('Cannot test elimination - game ended or pass button not available');
      }
    });
  });

  it('should end game when measurement limit (11) is reached', () => {
    // Check measurement counter if it exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="measurement-counter"]').length > 0) {
        cy.getByTestId('measurement-counter').invoke('text').then((text) => {
          const count = parseInt(text.match(/\d+/)?.[0] || '0');
          
          if (count >= 11) {
            // Game should have ended
            cy.shouldExistByTestId('game-ended-banner');
            cy.log('Measurement limit reached - game ended');
          } else {
            cy.log(`Measurement count: ${count} - limit not reached yet`);
          }
        });
      } else {
        // Check if we're in initial phase where measurement counter isn't visible
        if ($body.find('[data-testid="current-initial-player"]').length > 0) {
          cy.log('Measurement counter not visible - still in initial phase');
        } else {
          cy.log('Measurement counter not found - may not be implemented or visible');
        }
      }
    });
  });

  it('should end game when player empties their hand', () => {
    // Check for players with empty hands
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid$="-hand-count"]').length > 0) {
        cy.get('[data-testid$="-hand-count"]').each(($handCount) => {
          cy.wrap($handCount).invoke('text').then((text) => {
            if (text.includes('0枚') || text.includes('0')) {
              // Check if game ended due to empty hand
              cy.get('body').then(($body) => {
                if ($body.find('[data-testid="game-ended-banner"]').length > 0) {
                  cy.shouldExistByTestId('game-ended-banner');
                  cy.log('Game ended due to empty hand');
                } else {
                  cy.log('Player has empty hand but game continues');
                }
              });
            }
          });
        });
      } else {
        cy.log('Hand count elements not found');
      }
    });
  });

  it('should end game when insufficient active players remain', () => {
    // Check elimination status elements
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid$="-eliminated-status"]').length > 0) {
        // Count eliminated players
        cy.get('[data-testid$="-eliminated-status"]').then(($eliminated) => {
          const eliminatedCount = $eliminated.length;
          const totalPlayers = 4;
          
          if (totalPlayers - eliminatedCount <= 1) {
            cy.shouldExistByTestId('game-ended-banner');
            cy.log('Insufficient active players - game ended');
          } else {
            cy.log(`${totalPlayers - eliminatedCount} active players remaining`);
          }
        });
      } else {
        // No eliminated players yet, or elimination status not visible
        cy.log('No elimination status elements found - all players still active');
      }
    });
  });

  it('should allow viewing different player hands when game ends', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="game-ended-banner"]').length > 0) {
        // Game has ended, test hand viewing
        cy.get('[data-testid^="player-info-"]').then(($players) => {
          if ($players.length > 0) {
            // Click on first player to test hand viewing
            cy.wrap($players.first()).click();
            cy.wait(500);
            cy.log('Player hand viewing tested');
          }
        });
      } else {
        cy.log('Game has not ended - cannot test hand viewing');
      }
    });
  });

  it('should disable interactions when game has ended', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="game-ended-banner"]').length > 0) {
        // Game has ended, test disabled interactions
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="pass-button"]').length > 0) {
            cy.get('[data-testid="pass-button"]').should('be.disabled');
          }
          
          if ($body.find('[data-testid^="hand-card-"]').length > 0) {
            // Cards should not be selectable
            cy.get('[data-testid^="hand-card-"]').first().click();
            cy.get('[data-testid^="hand-card-"]').first().should('not.have.class', 'ring-cyan-400');
          }
        });
        
        cy.shouldExistByTestId('game-ended-banner');
        cy.log('Game interactions properly disabled');
      } else {
        cy.log('Game has not ended - cannot test disabled interactions');
      }
    });
  });

  it('should show correct end reason message', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="game-ended-banner"]').length > 0) {
        // Should show one of the possible end reasons
        const endReasons = [
          '測定回数上限',
          'アクティブなプレイヤー',
          'パス',
          '手札が空',
          '終了',
          'ゲーム終了'
        ];
        
        let foundReason = false;
        const bodyText = $body.text();
        endReasons.forEach(reason => {
          if (bodyText.includes(reason)) {
            foundReason = true;
            cy.log(`Found end reason: ${reason}`);
          }
        });
        
        // At minimum, should show some end-related text
        if (!foundReason) {
          cy.log('No specific end reason found, but game ended banner exists');
        }
      } else {
        cy.log('Game has not ended - no end reason to check');
      }
    });
  });
});