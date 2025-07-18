// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { 
  isValidTargetLane,
  startControlTargetPlacement,
  completeControlTargetPlacement
} from '../../src/game/gameLogic';
import { CardType, GameState } from '../../src/game/types';

// Mock uuidv4 to provide different IDs for different entities
let idCounter = 0;
jest.mock('uuid', () => ({
  v4: jest.fn(() => `mock-uuid-${++idCounter}`),
}));

describe('TARGET Card Placement Restrictions', () => {
  let gameState: GameState;

  beforeEach(() => {
    // Reset the counter before each test
    idCounter = 0;
    
    // Create a basic game state for testing
    gameState = {
      players: [
        { id: 'p1', name: 'Player 1', hand: [], score: 0, passes: 0 },
        { id: 'p2', name: 'Player 2', hand: [], score: 0, passes: 0 },
        { id: 'p3', name: 'Player 3', hand: [], score: 0, passes: 0 },
      ],
      deck: [],
      board: {
        lane: [
          [
            { id: 'gate1', type: CardType.GATE, value: 'I' },
            null // Empty slot at position 1
          ],
          [
            { id: 'gate2', type: CardType.GATE, value: 'X' },
            { id: 'gate3', type: CardType.GATE, value: 'Z' }
          ],
          [],
          []
        ]
      },
      currentPlayerId: 'p1',
      turn: 1,
      measurementCount: 0,
      gameEnded: false,
      turnDirection: 'forward',
      gamePhase: 'normal_play',
      unitaryCardsPlayedThisTurn: {},
    };
  });

  describe('TARGET placement after Measurement cards', () => {
    it('should prevent TARGET placement when preceding card is a Measurement card', () => {
      // Set up a scenario where target lane has a measurement card at position 0
      gameState.board.lane[1] = [
        { id: 'measurement1', type: CardType.MEASUREMENT, value: '⟨0|' }
      ];
      
      // Create control-target placement state
      const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' };
      const updatedGameState = startControlTargetPlacement(gameState, controlCard, 0, 1);

      // Try to place TARGET in lane 1 at position 1 (after measurement card)
      const canPlaceTarget = isValidTargetLane(updatedGameState, 1);
      
      expect(canPlaceTarget).toBe(false);
    });

    it('should allow TARGET placement when preceding card is not a Measurement card', () => {
      // Set up a scenario where target lane has a gate card at position 0
      gameState.board.lane[1] = [
        { id: 'gate1', type: CardType.GATE, value: 'I' }
      ];
      
      // Create control-target placement state
      const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' };
      const updatedGameState = startControlTargetPlacement(gameState, controlCard, 0, 1);

      // Try to place TARGET in lane 1 at position 1 (after gate card)
      const canPlaceTarget = isValidTargetLane(updatedGameState, 1);
      
      expect(canPlaceTarget).toBe(true);
    });

    it('should allow TARGET placement when there is no preceding card (position 0)', () => {
      // Set up a scenario where both lanes are empty (position 0 placement)
      gameState.board.lane[0] = [];
      gameState.board.lane[1] = [];
      
      // Create control-target placement state at position 0
      const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' };
      const updatedGameState = startControlTargetPlacement(gameState, controlCard, 0, 0);

      // Try to place TARGET in lane 1 at position 0 (no preceding card)
      const canPlaceTarget = isValidTargetLane(updatedGameState, 1);
      
      expect(canPlaceTarget).toBe(true);
    });

    it('should prevent TARGET placement after Unitary + Measurement sequence', () => {
      // Set up a scenario with Unitary then Measurement card
      gameState.board.lane[1] = [
        { id: 'unitary1', type: CardType.UNITARY, value: 'U' },
        { id: 'measurement1', type: CardType.MEASUREMENT, value: '⟨0|' }
      ];
      
      // Try to place control at position 2
      gameState.board.lane[0] = [
        { id: 'gate1', type: CardType.GATE, value: 'I' },
        { id: 'gate2', type: CardType.GATE, value: 'X' },
        null // Empty slot at position 2
      ];
      
      // Create control-target placement state
      const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' };
      const updatedGameState = startControlTargetPlacement(gameState, controlCard, 0, 2);

      // Try to place TARGET in lane 1 at position 2 (after measurement card)
      const canPlaceTarget = isValidTargetLane(updatedGameState, 1);
      
      expect(canPlaceTarget).toBe(false);
    });

    it('should allow TARGET placement after other card types', () => {
      // Test with different card types as preceding cards
      const testCases = [
        { type: CardType.QUBIT, value: '|0⟩' },
        { type: CardType.INITIAL_QUBIT, value: '|1⟩' },
        { type: CardType.GATE, value: 'H' },
        { type: CardType.UNITARY, value: 'U' },
        { type: CardType.CONTROL, value: 'C' },
      ];

      testCases.forEach(({ type, value }) => {
        // Set up target lane with the test card
        gameState.board.lane[1] = [
          { id: `test-${type}`, type, value }
        ];
        
        // Create control-target placement state
        const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' };
        const updatedGameState = startControlTargetPlacement(gameState, controlCard, 0, 1);

        // Try to place TARGET in lane 1 at position 1
        const canPlaceTarget = isValidTargetLane(updatedGameState, 1);
        
        expect(canPlaceTarget).toBe(true);
      });
    });
  });

  describe('Complete control-target placement with restrictions', () => {
    it('should fail to complete placement when target position violates measurement restriction', () => {
      // Set up a scenario where target lane has a measurement card
      gameState.board.lane[1] = [
        { id: 'measurement1', type: CardType.MEASUREMENT, value: '⟨0|' }
      ];
      
      // Create control-target placement state
      const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' };
      const updatedGameState = startControlTargetPlacement(gameState, controlCard, 0, 1);

      // Try to complete the placement (should fail)
      expect(() => {
        completeControlTargetPlacement(updatedGameState, 1);
      }).toThrow();
    });

    it('should successfully complete placement when target position is valid', () => {
      // Set up a scenario where target lane has a gate card
      gameState.board.lane[1] = [
        { id: 'gate1', type: CardType.GATE, value: 'I' }
      ];
      
      // Create control-target placement state
      const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' };
      const placementGameState = startControlTargetPlacement(gameState, controlCard, 0, 1);

      // Complete the placement (should succeed)
      const finalGameState = completeControlTargetPlacement(placementGameState, 1);
      
      expect(finalGameState.controlTargetPlacement).toBeUndefined();
      expect(finalGameState.board.lane[0][1]).toBeDefined();
      expect(finalGameState.board.lane[1][1]).toBeDefined();
      expect(finalGameState.board.lane[1][1]?.type).toBe(CardType.TARGET);
    });
  });
});