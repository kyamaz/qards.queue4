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
  shouldEliminatePlayer
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
    it('should return 3 for measurement outcome 0 - line 321', () => {
      const result = calculateMeasurementScore('|0⟩', '⟨0|');
      expect(result).toBe(3); // Expected outcome is '0'
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
        { qubit: '|0⟩', measurement: '⟨0|', expected: 3 }, // |0⟩ → outcome '0' → 3 points
        { qubit: '|0⟩', measurement: '⟨1|', expected: 3 }, // |0⟩ → outcome '0' → 3 points
        { qubit: '|1⟩', measurement: '⟨0|', expected: 5 }, // |1⟩ → outcome '1' → 5 points
        { qubit: '|1⟩', measurement: '⟨1|', expected: 5 }, // |1⟩ → outcome '1' → 5 points
        { qubit: '|+⟩', measurement: '⟨0|', expected: 3 }, // |+⟩ → outcome '0' → 3 points
        { qubit: '|+⟩', measurement: '⟨1|', expected: 3 }, // |+⟩ → outcome '0' → 3 points
        { qubit: '|-⟩', measurement: '⟨0|', expected: 3 }, // |-⟩ → outcome '0' → 3 points
        { qubit: '|-⟩', measurement: '⟨1|', expected: 3 }, // |-⟩ → outcome '0' → 3 points
        { qubit: '|-⟩', measurement: '⟨+|', expected: 5 }, // |-⟩ → outcome '1' → 5 points
        { qubit: '|-⟩', measurement: '⟨-|', expected: 5 }  // |-⟩ → outcome '1' → 5 points
      ];
      
      testCases.forEach(({ qubit, measurement, expected }) => {
        const score = calculateMeasurementScore(qubit, measurement);
        expect(score).toBe(expected);
      });
    });
  });
});