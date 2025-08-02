// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { isValidPlay } from '../../src/game/gameLogic';
import { CardType } from '../../src/game/types';

describe('QUBIT Card Placement Rules', () => {
  const regularQubitCard = { id: 'q1', type: CardType.QUBIT, value: '|+⟩' as const };
  const initialQubitCard = { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const };

  describe('Regular QUBIT cards', () => {
    it('should allow QUBIT cards after MEASUREMENT cards', () => {
      const boardWithMeasurement = {
        lane: [
          [{ id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' as const }],
        ],
      };
      
      expect(isValidPlay(regularQubitCard, 0, 1, boardWithMeasurement)).toBe(true);
    });

    it('should NOT allow QUBIT cards after GATE cards', () => {
      const boardWithGate = {
        lane: [
          [{ id: 'g1', type: CardType.GATE, value: 'X' as const }],
        ],
      };
      
      expect(isValidPlay(regularQubitCard, 0, 1, boardWithGate)).toBe(false);
    });

    it('should NOT allow QUBIT cards after INITIAL_QUBIT cards', () => {
      const boardWithInitialQubit = {
        lane: [
          [{ id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const }],
        ],
      };
      
      expect(isValidPlay(regularQubitCard, 0, 1, boardWithInitialQubit)).toBe(false);
    });

    it('should NOT allow QUBIT cards after other QUBIT cards', () => {
      const boardWithQubit = {
        lane: [
          [{ id: 'q1', type: CardType.QUBIT, value: '|+⟩' as const }],
        ],
      };
      
      expect(isValidPlay(regularQubitCard, 0, 1, boardWithQubit)).toBe(false);
    });

    it('should NOT allow QUBIT cards after UNITARY cards', () => {
      const boardWithUnitary = {
        lane: [
          [{ id: 'u1', type: CardType.UNITARY, value: 'U' as const }],
        ],
      };
      
      expect(isValidPlay(regularQubitCard, 0, 1, boardWithUnitary)).toBe(false);
    });

    it('should NOT allow QUBIT cards after CONTROL cards', () => {
      const boardWithControl = {
        lane: [
          [{ id: 'c1', type: CardType.CONTROL, value: 'C' as const }],
        ],
      };
      
      expect(isValidPlay(regularQubitCard, 0, 1, boardWithControl)).toBe(false);
    });

    it('should NOT allow QUBIT cards after TARGET cards', () => {
      const boardWithTarget = {
        lane: [
          [{ id: 't1', type: CardType.TARGET, value: 'O' as const }],
        ],
      };
      
      expect(isValidPlay(regularQubitCard, 0, 1, boardWithTarget)).toBe(false);
    });

    it('should NOT allow QUBIT cards at the start of a lane', () => {
      const emptyBoard = {
        lane: [[]],
      };
      
      expect(isValidPlay(regularQubitCard, 0, 0, emptyBoard)).toBe(false);
    });
  });

  describe('INITIAL_QUBIT cards', () => {
    it('should allow INITIAL_QUBIT cards after MEASUREMENT cards', () => {
      const boardWithMeasurement = {
        lane: [
          [{ id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' as const }],
        ],
      };
      
      expect(isValidPlay(initialQubitCard, 0, 1, boardWithMeasurement)).toBe(true);
    });

    it('should allow INITIAL_QUBIT cards after initial I gate', () => {
      const boardWithInitialI = {
        lane: [
          [{ id: 'i1', type: CardType.GATE, value: 'I' as const }],
        ],
      };
      
      expect(isValidPlay(initialQubitCard, 0, 1, boardWithInitialI)).toBe(true);
    });

    it('should NOT allow INITIAL_QUBIT cards after other GATE cards', () => {
      const boardWithGate = {
        lane: [
          [{ id: 'g1', type: CardType.GATE, value: 'X' as const }],
        ],
      };
      
      expect(isValidPlay(initialQubitCard, 0, 1, boardWithGate)).toBe(false);
    });

    it('should NOT allow INITIAL_QUBIT cards after I gates in multi-card lanes', () => {
      const boardWithMultipleCards = {
        lane: [
          [
            { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
            { id: 'i1', type: CardType.GATE, value: 'I' as const }
          ],
        ],
      };
      
      expect(isValidPlay(initialQubitCard, 0, 2, boardWithMultipleCards)).toBe(false);
    });
  });

  describe('Sequence validation', () => {
    it('should validate correct sequence: INITIAL_QUBIT → GATE → MEASUREMENT → QUBIT', () => {
      const boardSequence = {
        lane: [
          [
            { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
            { id: 'g1', type: CardType.GATE, value: 'X' as const },
            { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' as const }
          ],
        ],
      };
      
      // Should be able to place regular QUBIT after MEASUREMENT
      expect(isValidPlay(regularQubitCard, 0, 3, boardSequence)).toBe(true);
    });

    it('should prevent invalid sequence: INITIAL_QUBIT → QUBIT', () => {
      const boardWithInitialQubit = {
        lane: [
          [{ id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const }],
        ],
      };
      
      // Should NOT be able to place regular QUBIT after INITIAL_QUBIT
      expect(isValidPlay(regularQubitCard, 0, 1, boardWithInitialQubit)).toBe(false);
    });
  });
});