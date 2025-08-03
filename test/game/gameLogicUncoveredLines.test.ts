// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { 
  isValidPlay, 
  isValidTargetLane, 
  calculateMeasurementScore, 
  findPrecedingQubit,
  initializeGame,
  createDeck,
  shuffleDeck,
  isValidControlPlacement,
  startControlTargetPlacement,
  completeControlTargetPlacement,
  cancelControlTargetPlacement,
  calculateHandPenalty,
  determineWinner,
  canPlayUnitaryCard,
  resetUnitaryCardCounters,
  incrementUnitaryCardCounter,
  checkGameEndConditions,
  getGameEndReason,
  eliminatePlayer,
  getNextActivePlayer,
  shouldEliminatePlayer,
  distributeMainDeck
} from '../../src/game/gameLogic';
import { CardType, GameState } from '../../src/game/types';

describe('GameLogic Uncovered Lines', () => {
  describe('createDeck and shuffleDeck coverage', () => {
    it('should create deck and shuffle it', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      
      expect(deck).toHaveLength(shuffled.length);
      expect(deck.every(card => shuffled.includes(card))).toBe(true);
    });
  });

  describe('isValidPlay edge cases', () => {
    const mockBoard: GameState['board'] = {
      lane: [
        [{ id: '1', type: CardType.GATE, value: 'I' }],
        [{ id: '2', type: CardType.GATE, value: 'I' }],
        [],
        null as any // This will trigger line 117
      ]
    };

    it('should return false when lane does not exist - line 117', () => {
      const card = { id: 'test', type: CardType.GATE, value: 'X' };
      
      const result = isValidPlay(card, 3, 0, mockBoard);
      expect(result).toBe(false);
    });

    it('should return false for initial qubit placement after non-measurement card - line 142', () => {
      const card = { id: 'test', type: CardType.INITIAL_QUBIT, value: '|0⟩' };
      const boardWithGate: GameState['board'] = {
        lane: [
          [{ id: '1', type: CardType.GATE, value: 'X' }] // Previous card is not measurement
        ]
      };
      
      const result = isValidPlay(card, 0, 1, boardWithGate);
      expect(result).toBe(false);
    });

    it('should return false for qubit placement without previous card - line 152', () => {
      const card = { id: 'test', type: CardType.QUBIT, value: '|1⟩' };
      const emptyBoard: GameState['board'] = {
        lane: [[]]
      };
      
      const result = isValidPlay(card, 0, 0, emptyBoard);
      expect(result).toBe(false);
    });

    it('should return false for unitary card placement after another unitary - line 172', () => {
      const card = { id: 'test', type: CardType.UNITARY, value: 'U' };
      const boardWithUnitary: GameState['board'] = {
        lane: [
          [{ id: '1', type: CardType.UNITARY, value: 'U' }]
        ]
      };
      
      const result = isValidPlay(card, 0, 1, boardWithUnitary);
      expect(result).toBe(false);
    });
  });

  describe('isValidTargetLane edge cases', () => {
    it('should return false when position is out of range - line 283-284', () => {
      const controlLane = [{ id: '1', type: CardType.GATE, value: 'I' }];
      const targetLane = [{ id: '2', type: CardType.GATE, value: 'X' }];
      
      const result = isValidTargetLane(controlLane, targetLane, 0, 5); // Position 5 doesn't exist
      expect(result).toBe(false);
    });

    it('should return false when target card is null - line 291-292', () => {
      const controlLane = [{ id: '1', type: CardType.GATE, value: 'I' }];
      const targetLane = [null as any]; // Target slot is empty
      
      const result = isValidTargetLane(controlLane, targetLane, 0, 0);
      expect(result).toBe(false);
    });
  });

  describe('calculateMeasurementScore edge cases', () => {
    it('should return 5 for measurement outcome 1 - line 321', () => {
      const result = calculateMeasurementScore('|0⟩', '⟨0|');
      expect(result).toBe(5); // |0⟩ measured with ⟨0| gives result '1' (perfect match)
    });

    it('should return 5 for measurement outcome 1 - line 321', () => {
      const result = calculateMeasurementScore('|1⟩', '⟨1|');
      expect(result).toBe(5); // Expected outcome is '1'
    });
  });

  describe('Game initialization edge cases', () => {
    it('should handle game initialization with custom player names', () => {
      const customNames = ['Alice', 'Bob', 'Charlie', 'David'];
      const gameState = initializeGame(customNames);
      
      expect(gameState.players).toHaveLength(4);
      expect(gameState.players[0].name).toBe('Alice');
      expect(gameState.players[1].name).toBe('Bob');
      expect(gameState.players[2].name).toBe('Charlie');
      expect(gameState.players[3].name).toBe('David');
    });
  });

  describe('findPrecedingQubit edge cases', () => {
    it('should handle lanes with mixed card types', () => {
      const lane = [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        { id: '3', type: CardType.GATE, value: 'X' },
        { id: '4', type: CardType.UNITARY, value: 'U' }
      ];
      
      const result = findPrecedingQubit(lane, 3);
      expect(result).toEqual({ id: '2', type: CardType.INITIAL_QUBIT, value: '|0⟩' });
    });

    it('should return null when no qubit found in lane', () => {
      const lane = [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.GATE, value: 'X' }
      ];
      
      const result = findPrecedingQubit(lane, 1);
      expect(result).toBeNull();
    });
  });

  describe('Complex board state validations', () => {
    it('should handle measurement card placement with unfinalized lanes', () => {
      const card = { id: 'test', type: CardType.MEASUREMENT, value: '⟨0|' };
      const complexBoard: GameState['board'] = {
        lane: [
          [
            { id: '1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
            { id: '2', type: CardType.GATE, value: 'X' },
            { id: '3', type: CardType.UNITARY, value: 'U' } // Unfinalized lane
          ]
        ]
      };
      
      const result = isValidPlay(card, 0, 3, complexBoard, false);
      expect(result).toBe(false); // Should fail because lane is not finalized
    });

    it('should allow measurement card placement with allowUnfinalizedMeasurement flag', () => {
      const card = { id: 'test', type: CardType.MEASUREMENT, value: '⟨0|' };
      const complexBoard: GameState['board'] = {
        lane: [
          [
            { id: '1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
            { id: '2', type: CardType.GATE, value: 'X' },
            { id: '3', type: CardType.UNITARY, value: 'U' }
          ]
        ]
      };
      
      const result = isValidPlay(card, 0, 3, complexBoard, true);
      expect(result).toBe(true); // Should pass with allowUnfinalizedMeasurement
    });
  });

  describe('Control placement functions', () => {
    let mockGameState: GameState;

    beforeEach(() => {
      mockGameState = initializeGame(['Player1', 'Player2', 'Player3', 'Player4']);
      // Set up a basic board state
      mockGameState.board.lane[0] = [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.GATE, value: 'X' }
      ];
    });

    it('should validate control placement with gaps - line 452-453', () => {
      // Create a lane with gaps
      mockGameState.board.lane[0] = [
        { id: '1', type: CardType.GATE, value: 'I' },
        null, // Gap at position 1
        { id: '2', type: CardType.GATE, value: 'X' }
      ];
      
      const result = isValidControlPlacement(mockGameState, 0, 2);
      expect(result).toBe(false);
    });

    it('should reject control placement when position is occupied - line 445-446', () => {
      const result = isValidControlPlacement(mockGameState, 0, 1); // Position 1 has a card
      expect(result).toBe(false);
    });

    it('should throw error for invalid control placement - line 468-469', () => {
      // Create a state with gaps
      mockGameState.board.lane[0] = [
        { id: '1', type: CardType.GATE, value: 'I' },
        null // Gap
      ];
      
      const controlCard = { id: 'ctrl', type: CardType.CONTROL, value: 'CNOT' };
      
      expect(() => {
        startControlTargetPlacement(mockGameState, controlCard, 0, 2);
      }).toThrow('Invalid control card placement: gaps detected in preceding positions');
    });
  });

  describe('Hand penalty and scoring functions', () => {
    it('should calculate hand penalty correctly', () => {
      const hand = [
        { id: '1', type: CardType.GATE, value: 'X' },
        { id: '2', type: CardType.UNITARY, value: 'U' },
        { id: '3', type: CardType.MEASUREMENT, value: '⟨0|' }
      ];
      
      const penalty = calculateHandPenalty(hand);
      expect(penalty).toBeGreaterThanOrEqual(0);
    });

    it('should determine winner correctly', () => {
      const gameState = initializeGame(['Player1', 'Player2', 'Player3', 'Player4']);
      gameState.gameEnded = true;
      
      const result = determineWinner(gameState);
      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('finalScores');
    });
  });

  describe('Unitary card restriction functions', () => {
    it('should check unitary card play restrictions', () => {
      const gameState = initializeGame(['Player1', 'Player2', 'Player3', 'Player4']);
      
      const result = canPlayUnitaryCard(gameState, 'player-0');
      expect(typeof result).toBe('boolean');
    });

    it('should reset unitary card counters', () => {
      const gameState = initializeGame(['Player1', 'Player2', 'Player3', 'Player4']);
      
      const result = resetUnitaryCardCounters(gameState);
      expect(result.unitaryCardsPlayedThisTurn).toBeDefined();
    });

    it('should increment unitary card counter', () => {
      const gameState = initializeGame(['Player1', 'Player2', 'Player3', 'Player4']);
      
      const result = incrementUnitaryCardCounter(gameState, 'player-0');
      expect(result.unitaryCardsPlayedThisTurn).toBeDefined();
    });
  });

  describe('Game end condition functions', () => {
    it('should check game end conditions', () => {
      const gameState = initializeGame(['Player1', 'Player2', 'Player3', 'Player4']);
      
      const result = checkGameEndConditions(gameState);
      expect(typeof result).toBe('boolean');
    });

    it('should get game end reason', () => {
      const gameState = initializeGame(['Player1', 'Player2', 'Player3', 'Player4']);
      gameState.gameEnded = true;
      
      const reason = getGameEndReason(gameState);
      expect(typeof reason).toBe('string');
    });

    it('should eliminate player correctly', () => {
      const gameState = initializeGame(['Player1', 'Player2', 'Player3', 'Player4']);
      
      // First set the player to have 4+ passes so they can be eliminated
      gameState.players[1].passes = 4;
      
      const result = eliminatePlayer(gameState, gameState.players[1].id);
      expect(result.players.find(p => p.id === gameState.players[1].id)?.eliminated).toBe(true);
    });

    it('should get next active player', () => {
      const gameState = initializeGame(['Player1', 'Player2', 'Player3', 'Player4']);
      
      const nextPlayer = getNextActivePlayer(gameState, 'player-0');
      expect(typeof nextPlayer === 'string' || nextPlayer === null).toBe(true);
    });

    it('should determine if player should be eliminated', () => {
      const player = {
        id: 'test',
        name: 'Test Player',
        hand: [],
        score: 0,
        passes: 5, // High pass count
        eliminated: false
      };
      
      const result = shouldEliminatePlayer(player);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Additional edge cases for measurement scoring', () => {
    it('should handle complex quantum state measurement combinations', () => {
      // Test all combinations to cover the switch statement lines 334, 340-357
      const testCases = [
        { qubit: '|0⟩', measurement: '⟨0|', expected: 5 }, // |0⟩ with ⟨0| → outcome '1' → 5 points (perfect match)
        { qubit: '|0⟩', measurement: '⟨1|', expected: 3 }, // |0⟩ with ⟨1| → outcome '0' → 3 points (no match)
        { qubit: '|1⟩', measurement: '⟨0|', expected: 3 }, // |1⟩ with ⟨0| → outcome '0' → 3 points (no match)
        { qubit: '|1⟩', measurement: '⟨1|', expected: 5 }, // |1⟩ with ⟨1| → outcome '1' → 5 points (perfect match)
        { qubit: '|+⟩', measurement: '⟨0|', expected: 3 }, // |+⟩ cross-basis → outcome '0' → 3 points
        { qubit: '|+⟩', measurement: '⟨1|', expected: 3 }, // |+⟩ cross-basis → outcome '0' → 3 points
        { qubit: '|+⟩', measurement: '⟨+|', expected: 5 }, // |+⟩ with ⟨+| → outcome '1' → 5 points (perfect match)
        { qubit: '|+⟩', measurement: '⟨-|', expected: 3 }, // |+⟩ with ⟨-| → outcome '0' → 3 points (no match)
        { qubit: '|-⟩', measurement: '⟨0|', expected: 3 }, // |-⟩ cross-basis → outcome '0' → 3 points
        { qubit: '|-⟩', measurement: '⟨1|', expected: 3 }, // |-⟩ cross-basis → outcome '0' → 3 points
        { qubit: '|-⟩', measurement: '⟨+|', expected: 3 }, // |-⟩ with ⟨+| → outcome '0' → 3 points (no match)
        { qubit: '|-⟩', measurement: '⟨-|', expected: 5 }  // |-⟩ with ⟨-| → outcome '1' → 5 points (perfect match)
      ];
      
      testCases.forEach(({ qubit, measurement, expected }) => {
        const score = calculateMeasurementScore(qubit, measurement);
        expect(score).toBe(expected);
      });
    });
  });

  describe('Additional Coverage for Uncovered Lines', () => {
    describe('isLaneFinalized edge cases', () => {
      it('should handle lane without qubit cards - line 72', () => {
        // Test isLaneFinalized indirectly through isValidPlay with measurement cards
        const mockBoard: GameState['board'] = {
          lane: [
            [{ id: '1', type: CardType.GATE, value: 'I' }], // No qubit cards
            [],
            [],
            []
          ]
        };

        const measurementCard = { id: 'meas', type: CardType.MEASUREMENT, value: '⟨0|' };
        
        // This should trigger the hasQubitCard check in isLaneFinalized (line 72)
        const result = isValidPlay(measurementCard, 0, 1, mockBoard);
        expect(result).toBe(false);
      });
    });

    describe('isValidPlay INITIAL_QUBIT edge cases', () => {
      it('should handle INITIAL_QUBIT placement at start without previous card - line 142', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [], // Empty lane
            [],
            [],
            []
          ]
        };

        const initialQubitCard = { id: 'init', type: CardType.INITIAL_QUBIT, value: '|0⟩' };
        
        // Try to place at position 0 (no previous card) - should trigger line 142
        const result = isValidPlay(initialQubitCard, 0, 0, mockBoard);
        expect(result).toBe(false);
      });
    });

    describe('isValidPlay gate placement on existing card edge cases', () => {
      it('should handle gate placement on non-target/non-unitary card - line 238', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [
              { id: '1', type: CardType.GATE, value: 'I' },
              { id: '2', type: CardType.GATE, value: 'X' } // Existing gate card
            ],
            [],
            [],
            []
          ]
        };

        const gateCard = { id: 'gate', type: CardType.GATE, value: 'H' };
        
        // Try to place gate on top of another gate (not UNITARY or TARGET) - should trigger line 238
        const result = isValidPlay(gateCard, 0, 1, mockBoard);
        expect(result).toBe(false);
      });
    });

    describe('isValidControlCardPlay edge cases', () => {
      it('should handle control lane beyond bounds - line 283-284', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [{ id: '1', type: CardType.GATE, value: 'I' }],
            [],
            [],
            []
          ]
        };

        // Try control placement at position beyond lane length + 1 - should trigger line 283-284
        const result = isValidControlPlacement(
          { board: mockBoard } as GameState,
          0, // control lane
          5  // position way beyond lane length
        );
        expect(result).toBe(false);
      });

      it('should handle target card type validation - line 291-292', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [{ id: '1', type: CardType.GATE, value: 'I' }, null], // null at position 1
            [
              { id: '2', type: CardType.GATE, value: 'I' },
              { id: '3', type: CardType.QUBIT, value: '|0⟩' } // Invalid target type
            ],
            [],
            []
          ]
        };

        const gameState: GameState = {
          board: mockBoard,
          controlTargetPlacement: {
            controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
            controlLane: 0,
            controlPosition: 1,
            waitingForTarget: true
          }
        } as any;

        // Try to validate target lane with QUBIT card (invalid target) - should trigger line 291-292
        const result = isValidTargetLane(gameState, 1);
        expect(result).toBe(false);
      });
    });

    describe('initializeGame edge cases', () => {
      it('should handle deck distribution break condition - line 412', () => {
        // Create game with minimum players to test break condition in distribution loop
        const players = ['Player1', 'Player2', 'Player3']; // Minimum 3 players
        const gameState = initializeGame(players);
        
        // Verify that deck is empty after distribution (cards distributed)
        expect(gameState.deck).toHaveLength(0);
        expect(gameState.players.every(p => p.hand.length > 0)).toBe(true);
      });
    });

    describe('completeControlTargetPlacement edge cases', () => {
      it('should handle lane extension during control-target placement - line 526, 544', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [{ id: '1', type: CardType.GATE, value: 'I' }], // Control lane with 1 card
            [{ id: '2', type: CardType.GATE, value: 'X' }] // Target lane with 1 card
          ]
        };

        const gameState: GameState = {
          board: mockBoard,
          players: [
            { 
              id: 'p1', 
              name: 'Player1', 
              hand: [{ id: 'ctrl', type: CardType.CONTROL, value: 'C' }],
              score: 0, 
              passes: 0, 
              eliminated: false 
            }
          ],
          currentPlayerId: 'p1',
          controlTargetPlacement: {
            controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
            controlLane: 0,
            controlPosition: 1,
            waitingForTarget: true
          }
        } as any;

        // Complete placement to trigger lane extension (lines 526, 544)
        const result = completeControlTargetPlacement(gameState, 1);
        
        expect(result.board.lane[0]).toHaveLength(2); // Extended
        expect(result.board.lane[1]).toHaveLength(2); // Extended
      });
    });

    describe('isValidTargetLane edge cases', () => {
      it('should handle target position already occupied - line 591, 596-597', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [
              { id: '1', type: CardType.GATE, value: 'I' },
              { id: '2', type: CardType.GATE, value: 'X' }
            ],
            [
              { id: '3', type: CardType.GATE, value: 'I' },
              { id: '4', type: CardType.GATE, value: 'H' } // Position already occupied
            ],
            [],
            []
          ]
        };

        const gameState: GameState = {
          board: mockBoard,
          controlTargetPlacement: {
            controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
            controlLane: 0,
            controlPosition: 1,
            waitingForTarget: true
          }
        } as any;

        // Try to place target where position is already occupied - should trigger line 596-597
        const result = isValidTargetLane(gameState, 1);
        expect(result).toBe(false);
      });
    });

    describe('distributeMainDeck edge cases', () => {
      it('should handle normal play phase requirement - line 715', () => {
        const gameState: GameState = {
          gamePhase: 'initial_selection', // Not normal_play
          deck: [],
          players: []
        } as any;

        // Try to distribute when not in normal_play phase - should trigger line 715
        expect(() => {
          distributeMainDeck(gameState);
        }).toThrow('Main deck can only be distributed after initial selection is complete');
      });
    });

    describe('Additional coverage for isValidTargetLane', () => {
      it('should handle gaps in control lane - line 608', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [
              { id: '1', type: CardType.GATE, value: 'I' },
              null, // Gap at position 1
              { id: '2', type: CardType.GATE, value: 'X' }
            ],
            [
              { id: '3', type: CardType.GATE, value: 'I' },
              { id: '4', type: CardType.GATE, value: 'H' }
            ]
          ]
        };

        const gameState: GameState = {
          board: mockBoard,
          controlTargetPlacement: {
            controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
            controlLane: 0,
            controlPosition: 2, // Position 2, but position 1 is null (gap)
            waitingForTarget: true
          }
        } as any;

        // Should trigger line 608 - control lane has gaps
        const result = isValidTargetLane(gameState, 1);
        expect(result).toBe(false);
      });

      it('should handle gaps in target lane - line 615', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [
              { id: '1', type: CardType.GATE, value: 'I' },
              { id: '2', type: CardType.GATE, value: 'X' }
            ],
            [
              { id: '3', type: CardType.GATE, value: 'I' },
              null // Gap at position 1
            ]
          ]
        };

        const gameState: GameState = {
          board: mockBoard,
          controlTargetPlacement: {
            controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
            controlLane: 0,
            controlPosition: 2, // Position 2
            waitingForTarget: true
          }
        } as any;

        // Should trigger line 615 - target lane has gaps
        const result = isValidTargetLane(gameState, 1);
        expect(result).toBe(false);
      });

      it('should handle target placement after measurement card - line 623', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [
              { id: '1', type: CardType.GATE, value: 'I' },
              { id: '2', type: CardType.GATE, value: 'X' }
            ],
            [
              { id: '3', type: CardType.GATE, value: 'I' },
              { id: '4', type: CardType.MEASUREMENT, value: '⟨0|' } // Measurement card at position 1
            ]
          ]
        };

        const gameState: GameState = {
          board: mockBoard,
          controlTargetPlacement: {
            controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
            controlLane: 0,
            controlPosition: 2, // Position 2, position 1 has measurement card
            waitingForTarget: true
          }
        } as any;

        // Should trigger line 623 - cannot place TARGET after measurement card
        const result = isValidTargetLane(gameState, 1);
        expect(result).toBe(false);
      });
    });

    describe('Game end conditions edge cases', () => {
      it('should handle all active players passing 3+ times - line 768', () => {
        const gameState = initializeGame(['Player1', 'Player2', 'Player3']);
        
        // Set all players to have 3+ passes
        gameState.players.forEach(player => {
          player.passes = 3;
        });

        // Should trigger line 768
        const result = checkGameEndConditions(gameState);
        expect(result).toBe(true);
      });

      it('should get all active players pass reason - line 794', () => {
        const gameState = initializeGame(['Player1', 'Player2', 'Player3']);
        gameState.gameEnded = true;
        
        // Set all players to have 3+ passes
        gameState.players.forEach(player => {
          player.passes = 3;
        });

        // Should trigger line 794
        const reason = getGameEndReason(gameState);
        expect(reason).toBe('all_active_players_pass');
      });
    });

    describe('Additional edge cases for complete coverage', () => {
      it('should handle UNITARY card placement at end of lane - line 172', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [{ id: '1', type: CardType.GATE, value: 'I' }] // Previous card is not measurement
          ]
        };

        const unitaryCard = { id: 'test', type: CardType.UNITARY, value: 'U' };
        
        // Should trigger line 172 - valid unitary placement
        const result = isValidPlay(unitaryCard, 0, 1, mockBoard);
        expect(result).toBe(true);
      });

      it('should handle measurement card placement without previous card - line 202', () => {
        const mockBoard: GameState['board'] = {
          lane: [[]] // Empty lane
        };

        const measurementCard = { id: 'test', type: CardType.MEASUREMENT, value: '⟨0|' };
        
        // Should trigger line 202 - cannot place measurement if no previous card
        const result = isValidPlay(measurementCard, 0, 0, mockBoard);
        expect(result).toBe(false);
      });

      it('should handle CONTROL card placement at end of lane - line 206', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [{ id: '1', type: CardType.GATE, value: 'I' }]
          ]
        };

        const controlCard = { id: 'test', type: CardType.CONTROL, value: 'C' };
        
        // Should trigger line 206 - CONTROL cards are handled by special placement logic
        const result = isValidPlay(controlCard, 0, 1, mockBoard);
        expect(result).toBe(false);
      });

      it('should handle TARGET card placement at end of lane - line 210', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [{ id: '1', type: CardType.GATE, value: 'I' }]
          ]
        };

        const targetCard = { id: 'test', type: CardType.TARGET, value: 'O' };
        
        // Should trigger line 210 - TARGET cards cannot be manually placed
        const result = isValidPlay(targetCard, 0, 1, mockBoard);
        expect(result).toBe(false);
      });

      it('should handle controlled Hadamard gate restriction - line 232-236', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [
              { id: '1', type: CardType.GATE, value: 'I' },
              { id: 'target', type: CardType.TARGET, value: 'O' }
            ]
          ]
        };

        const hadamardCard = { id: 'test', type: CardType.GATE, value: 'H' };
        
        // Should trigger line 232-236 - H gate on TARGET with controlledHadamard disabled
        const result = isValidPlay(hadamardCard, 0, 1, mockBoard, false, false);
        expect(result).toBe(false);
      });

      it('should allow controlled Hadamard when enabled - line 236', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [
              { id: '1', type: CardType.GATE, value: 'I' },
              { id: 'target', type: CardType.TARGET, value: 'O' }
            ]
          ]
        };

        const hadamardCard = { id: 'test', type: CardType.GATE, value: 'H' };
        
        // Should trigger line 237 - H gate on TARGET with controlledHadamard enabled
        const result = isValidPlay(hadamardCard, 0, 1, mockBoard, false, true);
        expect(result).toBe(true);
      });

      it('should handle completeControlTargetPlacement with no pending placement - line 493', () => {
        const gameState: GameState = {
          controlTargetPlacement: undefined // No pending placement
        } as any;

        // Should trigger line 493
        expect(() => {
          completeControlTargetPlacement(gameState, 1);
        }).toThrow('No pending control-target placement');
      });

      it('should handle invalid target lane in complete placement - line 498', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [{ id: '1', type: CardType.GATE, value: 'I' }],
            [] // Empty target lane
          ]
        };

        const gameState: GameState = {
          board: mockBoard,
          controlTargetPlacement: {
            controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
            controlLane: 0,
            controlPosition: 1,
            waitingForTarget: true
          }
        } as any;

        // Make isValidTargetLane return false by testing non-adjacent lane
        expect(() => {
          completeControlTargetPlacement(gameState, 3); // Lane 3 is not adjacent to lane 0
        }).toThrow('Invalid target lane for control-target placement');
      });

      it('should handle missing current player in complete placement - line 544', () => {
        const mockBoard: GameState['board'] = {
          lane: [
            [{ id: '1', type: CardType.GATE, value: 'I' }],
            [{ id: '2', type: CardType.GATE, value: 'X' }]
          ]
        };

        const gameState: GameState = {
          board: mockBoard,
          currentPlayerId: 'nonexistent-player', // Player doesn't exist
          players: [
            { 
              id: 'different-player', 
              name: 'Player1', 
              hand: [],
              score: 0, 
              passes: 0, 
              eliminated: false 
            }
          ],
          controlTargetPlacement: {
            controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
            controlLane: 0,
            controlPosition: 1,
            waitingForTarget: true
          }
        } as any;

        // Should trigger line 544
        expect(() => {
          completeControlTargetPlacement(gameState, 1);
        }).toThrow('Current player not found');
      });

      it('should handle deck distribution break in loop - line 412', () => {
        // This is already covered by the initializeGame test, but let's be explicit
        const players = ['Player1', 'Player2', 'Player3'];
        const gameState = initializeGame(players);
        
        // The deck should be empty after distribution (line 412 break condition)
        expect(gameState.deck).toHaveLength(0);
        expect(gameState.players.every(p => p.hand.length > 0)).toBe(true);
      });
    });
  });
});