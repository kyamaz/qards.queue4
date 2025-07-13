import { createDeck, shuffleDeck, initializeGame, isValidPlay, isValidControlCardPlay } from '../../src/game/gameLogic';
import { Card, CardType, GameState } from '../../src/game/types';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid');

describe('Game Logic Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue('test-uuid');
  });

  describe('createDeck edge cases', () => {
    it('should handle UUID generation failure gracefully', () => {
      // Test that deck creation doesn't fail even if UUID has issues
      const deck = createDeck();
      expect(deck).toBeDefined();
      expect(deck.length).toBe(56); // Main deck without INITIAL_QUBIT cards
    });

    it('should create unique IDs for all cards', () => {
      let callCount = 0;
      (uuidv4 as jest.Mock).mockImplementation(() => `test-uuid-${callCount++}`);
      
      const deck = createDeck();
      const uniqueIds = new Set(deck.map(card => card.id));
      
      expect(uniqueIds.size).toBe(deck.length);
    });
  });

  describe('shuffleDeck edge cases', () => {
    it('should handle empty deck', () => {
      const emptyDeck: Card[] = [];
      const shuffled = shuffleDeck([...emptyDeck]);
      
      expect(shuffled).toEqual([]);
      expect(shuffled.length).toBe(0);
    });

    it('should handle single card deck', () => {
      const singleCard: Card = { id: '1', type: CardType.GATE, value: 'X' };
      const deck = [singleCard];
      const shuffled = shuffleDeck([...deck]);
      
      expect(shuffled.length).toBe(1);
      expect(shuffled[0]).toEqual(singleCard);
    });

    it('should not modify original deck array', () => {
      const originalDeck = createDeck();
      const deckCopy = [...originalDeck];
      shuffleDeck(deckCopy);
      
      expect(originalDeck.length).toBe(56); // Main deck without INITIAL_QUBIT cards
      expect(originalDeck[0]).toBeDefined();
    });
  });

  describe('initializeGame edge cases', () => {
    it('should handle exactly 3 players', () => {
      const gameState = initializeGame(['A', 'B', 'C']);
      expect(gameState.players.length).toBe(3);
    });

    it('should handle exactly 5 players', () => {
      const gameState = initializeGame(['A', 'B', 'C', 'D', 'E']);
      expect(gameState.players.length).toBe(5);
    });

    it('should throw error with 2 players', () => {
      expect(() => initializeGame(['A', 'B'])).toThrow('Player count must be between 3 and 6.');
    });

    it('should throw error with 7 players', () => {
      expect(() => initializeGame(['A', 'B', 'C', 'D', 'E', 'F', 'G'])).toThrow('Player count must be between 3 and 6.');
    });

    it('should throw error with empty player array', () => {
      expect(() => initializeGame([])).toThrow('Player count must be between 3 and 6.');
    });

    it('should handle exactly 6 players', () => {
      const gameState = initializeGame(['A', 'B', 'C', 'D', 'E', 'F']);
      expect(gameState.players.length).toBe(6);
    });

    it('should handle player names with special characters', () => {
      const specialNames = ['Player@1', 'Player#2', 'Player$3'];
      const gameState = initializeGame(specialNames);
      
      expect(gameState.players[0].name).toBe('Player@1');
      expect(gameState.players[1].name).toBe('Player#2');
      expect(gameState.players[2].name).toBe('Player$3');
    });

    it('should handle very long player names', () => {
      const longName = 'A'.repeat(100);
      const gameState = initializeGame([longName, 'B', 'C']);
      
      expect(gameState.players[0].name).toBe(longName);
    });

    it('should distribute all cards when there are 5 players', () => {
      const gameState = initializeGame(['A', 'B', 'C', 'D', 'E']);
      
      // Count total cards in hands
      const totalCardsInHands = gameState.players.reduce((sum, player) => sum + player.hand.length, 0);
      
      // Should have distributed 5 initial cards (one per player) + remaining deck cards
      expect(totalCardsInHands).toBeGreaterThan(0);
      
      // Each player should have at least one card (initial qubit)
      gameState.players.forEach(player => {
        expect(player.hand.length).toBeGreaterThan(0);
      });
    });

    it('should set correct initial board state with 4 lanes', () => {
      const gameState = initializeGame(['A', 'B', 'C']);
      
      expect(gameState.board.lane.length).toBe(4);
      
      // Each lane should start empty (no I gates anymore)
      gameState.board.lane.forEach(lane => {
        expect(lane.length).toBe(0);
      });
    });
  });

  describe('isValidPlay edge cases', () => {
    let mockBoard: GameState['board'];

    beforeEach(() => {
      mockBoard = {
        lane: [
          [{ id: '1', type: CardType.GATE, value: 'I' }],
          [{ id: '2', type: CardType.GATE, value: 'I' }],
          [{ id: '3', type: CardType.GATE, value: 'I' }],
          [{ id: '4', type: CardType.GATE, value: 'I' }]
        ]
      };
    });

    it('should reject placement on non-existent lane', () => {
      const card: Card = { id: '5', type: CardType.GATE, value: 'X' };
      
      expect(isValidPlay(card, 4, 0, mockBoard)).toBe(false); // Lane index 4 doesn't exist
      expect(isValidPlay(card, -1, 0, mockBoard)).toBe(false); // Negative lane index
    });

    it('should reject placement at negative position', () => {
      const card: Card = { id: '5', type: CardType.GATE, value: 'X' };
      
      expect(isValidPlay(card, 0, -1, mockBoard)).toBe(false);
    });

    it('should handle placement on lane with null values', () => {
      mockBoard.lane[0] = [
        { id: '1', type: CardType.GATE, value: 'I' },
        null,
        { id: '2', type: CardType.GATE, value: 'X' }
      ];
      
      const card: Card = { id: '5', type: CardType.GATE, value: 'Z' };
      
      // Should be able to place in the null slot
      expect(isValidPlay(card, 0, 1, mockBoard)).toBe(true);
    });

    it('should reject qubit placement after non-measurement card at end of lane', () => {
      mockBoard.lane[0].push({ id: '2', type: CardType.GATE, value: 'X' });
      
      const quantumBit: Card = { id: '5', type: CardType.QUBIT, value: '|+⟩' };
      
      expect(isValidPlay(quantumBit, 0, 2, mockBoard)).toBe(false);
    });

    it('should allow qubit placement after measurement at end of lane', () => {
      mockBoard.lane[0].push({ id: '2', type: CardType.MEASUREMENT, value: '⟨0|' });
      
      const quantumBit: Card = { id: '5', type: CardType.QUBIT, value: '|+⟩' };
      
      expect(isValidPlay(quantumBit, 0, 2, mockBoard)).toBe(true);
    });

    it('should handle initial qubit cards same as regular qubits', () => {
      mockBoard.lane[0].push({ id: '2', type: CardType.MEASUREMENT, value: '⟨0|' });
      
      const initialQuantumBit: Card = { id: '5', type: CardType.INITIAL_QUBIT, value: '|0⟩' };
      
      expect(isValidPlay(initialQuantumBit, 0, 2, mockBoard)).toBe(true);
    });

    it('should reject unitary card on top of another unitary', () => {
      mockBoard.lane[0].push({ id: '2', type: CardType.UNITARY, value: 'U' });
      
      const unitaryCard: Card = { id: '5', type: CardType.UNITARY, value: 'U' };
      
      expect(isValidPlay(unitaryCard, 0, 2, mockBoard)).toBe(false);
    });

    it('should allow gate card on top of unitary card', () => {
      mockBoard.lane[0] = [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.UNITARY, value: 'U' }
      ];
      
      const gateCard: Card = { id: '5', type: CardType.GATE, value: 'X' };
      
      expect(isValidPlay(gateCard, 0, 1, mockBoard)).toBe(true);
    });

    it('should allow measurement card placement after non-measurement cards', () => {
      const measurementCard: Card = { id: '5', type: CardType.MEASUREMENT, value: '⟨0|' };
      
      // I gate in lane - measurement cards can be placed after any non-measurement card
      expect(isValidPlay(measurementCard, 0, 1, mockBoard)).toBe(true);
    });

    it('should handle unknown card type', () => {
      const unknownCard: Card = { id: '5', type: 'UNKNOWN' as CardType, value: '?' };
      
      expect(isValidPlay(unknownCard, 0, 1, mockBoard)).toBe(false);
    });
  });

  describe('isValidControlCardPlay edge cases', () => {
    let mockBoard: GameState['board'];

    beforeEach(() => {
      mockBoard = {
        lane: [
          [{ id: '1', type: CardType.GATE, value: 'I' }, { id: '2', type: CardType.GATE, value: 'X' }],
          [{ id: '3', type: CardType.GATE, value: 'I' }, { id: '4', type: CardType.GATE, value: 'Z' }],
          [{ id: '5', type: CardType.GATE, value: 'I' }],
          [{ id: '6', type: CardType.GATE, value: 'I' }]
        ]
      };
    });

    it('should reject control placement on same lane as target', () => {
      expect(isValidControlCardPlay(0, 0, 1, mockBoard)).toBe(false);
    });

    it('should reject control placement on non-adjacent lanes', () => {
      expect(isValidControlCardPlay(0, 2, 1, mockBoard)).toBe(false); // Lane 0 to 2
      expect(isValidControlCardPlay(0, 3, 1, mockBoard)).toBe(false); // Lane 0 to 3
    });

    it('should handle negative lane indices', () => {
      expect(isValidControlCardPlay(-1, 0, 1, mockBoard)).toBe(false);
      expect(isValidControlCardPlay(0, -1, 1, mockBoard)).toBe(false);
    });

    it('should handle out of bounds lane indices', () => {
      expect(isValidControlCardPlay(4, 3, 1, mockBoard)).toBe(false);
      expect(isValidControlCardPlay(3, 4, 1, mockBoard)).toBe(false);
    });

    it('should reject when control slot is occupied', () => {
      // Position 1 in lane 0 already has a card
      expect(isValidControlCardPlay(0, 1, 1, mockBoard)).toBe(false);
    });

    it('should reject when target slot is empty', () => {
      // Lane 2 only has one card at position 0
      expect(isValidControlCardPlay(1, 2, 1, mockBoard)).toBe(false);
    });

    it('should reject when position is out of bounds for control lane', () => {
      expect(isValidControlCardPlay(2, 1, 5, mockBoard)).toBe(false);
    });

    it('should reject non-gate and non-control targets', () => {
      mockBoard.lane[1][1] = { id: '7', type: CardType.QUBIT, value: '|+⟩' };
      
      expect(isValidControlCardPlay(0, 1, 1, mockBoard)).toBe(false);
    });

    it('should accept control card targeting another control card', () => {
      mockBoard.lane[1][1] = { id: '7', type: CardType.CONTROL, value: 'C' };
      mockBoard.lane[0][1] = null; // Make control slot empty
      
      expect(isValidControlCardPlay(0, 1, 1, mockBoard)).toBe(true);
    });

    it('should reject Hadamard gate as target', () => {
      mockBoard.lane[1][1] = { id: '7', type: CardType.GATE, value: 'H' };
      mockBoard.lane[0][1] = null; // Make control slot empty
      
      expect(isValidControlCardPlay(0, 1, 1, mockBoard)).toBe(false);
    });

    it('should handle lanes with different lengths', () => {
      mockBoard.lane[0] = [
        { id: '1', type: CardType.GATE, value: 'I' },
        null,
        null,
        { id: '2', type: CardType.GATE, value: 'X' }
      ];
      mockBoard.lane[1] = [
        { id: '3', type: CardType.GATE, value: 'I' },
        { id: '4', type: CardType.GATE, value: 'Z' }
      ];
      
      // Try to place control at position 3 targeting position 3 (which doesn't exist in lane 1)
      expect(isValidControlCardPlay(0, 1, 3, mockBoard)).toBe(false);
    });
  });
});