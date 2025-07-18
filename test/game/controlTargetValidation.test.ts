// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { 
  initializeGame, 
  isValidControlPlacement,
  startControlTargetPlacement, 
  isValidTargetLane 
} from '../../src/game/gameLogic';
import { CardType } from '../../src/game/types';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('Control-Target Placement Validation', () => {
  describe('isValidControlPlacement', () => {
    it('should allow control placement when no gaps exist', () => {
      const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
      
      // Add cards to create a valid sequence
      gameState.board.lane[0] = [
        { id: 'card1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        { id: 'card2', type: CardType.GATE, value: 'X' }
      ];
      
      // Should be able to place control at position 2 (after filled positions)
      expect(isValidControlPlacement(gameState, 0, 2)).toBe(true);
    });

    it('should not allow control placement when gaps exist', () => {
      const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
      
      // Add cards with a gap
      gameState.board.lane[0] = [
        { id: 'card1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        null, // Gap at position 1
        { id: 'card3', type: CardType.GATE, value: 'X' }
      ];
      
      // Should not be able to place control at position 2 (gap at position 1)
      expect(isValidControlPlacement(gameState, 0, 2)).toBe(false);
    });

    it('should not allow control placement on occupied position', () => {
      const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
      
      gameState.board.lane[0] = [
        { id: 'card1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        { id: 'card2', type: CardType.GATE, value: 'X' }
      ];
      
      // Should not be able to place control at position 1 (already occupied)
      expect(isValidControlPlacement(gameState, 0, 1)).toBe(false);
    });

    it('should allow control placement at position 0 (start of lane)', () => {
      const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
      
      // Empty lane
      gameState.board.lane[0] = [];
      
      // Should be able to place control at position 0
      expect(isValidControlPlacement(gameState, 0, 0)).toBe(true);
    });
  });

  describe('startControlTargetPlacement with validation', () => {
    it('should start placement when control position is valid', () => {
      const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
      
      gameState.board.lane[0] = [
        { id: 'card1', type: CardType.INITIAL_QUBIT, value: '|0⟩' }
      ];
      
      const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' as const };
      
      expect(() => {
        startControlTargetPlacement(gameState, controlCard, 0, 1);
      }).not.toThrow();
    });

    it('should throw error when control position has gaps', () => {
      const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
      
      gameState.board.lane[0] = [
        { id: 'card1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        null, // Gap
        { id: 'card3', type: CardType.GATE, value: 'X' }
      ];
      
      const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' as const };
      
      expect(() => {
        startControlTargetPlacement(gameState, controlCard, 0, 2);
      }).toThrow('Invalid control card placement: gaps detected in preceding positions');
    });
  });

  describe('isValidTargetLane with gap validation', () => {
    it('should allow target placement when both lanes have no gaps', () => {
      const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
      
      // Both lanes filled properly
      gameState.board.lane[0] = [
        { id: 'card1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        { id: 'card2', type: CardType.GATE, value: 'X' }
      ];
      gameState.board.lane[1] = [
        { id: 'card3', type: CardType.INITIAL_QUBIT, value: '|1⟩' },
        { id: 'card4', type: CardType.GATE, value: 'Z' }
      ];
      
      const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' as const };
      const stateWithPending = startControlTargetPlacement(gameState, controlCard, 0, 2);
      
      expect(isValidTargetLane(stateWithPending, 1)).toBe(true);
    });

    it('should not allow target placement when control lane has gaps', () => {
      const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
      
      // Control lane has gap
      gameState.board.lane[0] = [
        { id: 'card1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        null // Gap at position 1
      ];
      gameState.board.lane[1] = [
        { id: 'card3', type: CardType.INITIAL_QUBIT, value: '|1⟩' },
        { id: 'card4', type: CardType.GATE, value: 'Z' }
      ];
      
      const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' as const };
      
      // Manually create pending state (since startControlTargetPlacement would throw)
      const stateWithPending = {
        ...gameState,
        controlTargetPlacement: {
          controlCard,
          controlLane: 0,
          controlPosition: 2,
          waitingForTarget: true,
        },
      };
      
      expect(isValidTargetLane(stateWithPending, 1)).toBe(false);
    });

    it('should not allow target placement when target lane has gaps', () => {
      const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
      
      // Target lane has gap
      gameState.board.lane[0] = [
        { id: 'card1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        { id: 'card2', type: CardType.GATE, value: 'X' }
      ];
      gameState.board.lane[1] = [
        { id: 'card3', type: CardType.INITIAL_QUBIT, value: '|1⟩' },
        null // Gap at position 1
      ];
      
      const controlCard = { id: 'control1', type: CardType.CONTROL, value: 'C' as const };
      const stateWithPending = startControlTargetPlacement(gameState, controlCard, 0, 2);
      
      expect(isValidTargetLane(stateWithPending, 1)).toBe(false);
    });
  });
});