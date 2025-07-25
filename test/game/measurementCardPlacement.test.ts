// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { isValidPlay } from '../../src/game/gameLogic';
import { CardType } from '../../src/game/types';

describe('Measurement Card Placement Rules', () => {
  const measurementCard = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' as const };

  it('should allow measurement cards after QUBIT cards in finalized lane', () => {
    const boardWithFinalizedQubit = {
      lane: [
        [
          { id: 'q1', type: CardType.QUBIT, value: '|0⟩' as const },
          { id: 'u1', type: CardType.UNITARY, value: 'U' as const },
          { id: 'g1', type: CardType.GATE, value: 'X' as const }
        ],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 3, boardWithFinalizedQubit)).toBe(true);
  });

  it('should allow measurement cards after INITIAL_QUBIT cards in finalized lane', () => {
    const boardWithFinalizedInitialQubit = {
      lane: [
        [
          { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
          { id: 't1', type: CardType.TARGET, value: 'T' as const },
          { id: 'g1', type: CardType.GATE, value: 'H' as const }
        ],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 3, boardWithFinalizedInitialQubit)).toBe(true);
  });

  it('should allow measurement cards after GATE cards in finalized lane', () => {
    const boardWithFinalizedGate = {
      lane: [
        [
          { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
          { id: 'g1', type: CardType.GATE, value: 'X' as const },
          { id: 'u1', type: CardType.UNITARY, value: 'U' as const },
          { id: 'g2', type: CardType.GATE, value: 'Z' as const }
        ],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 4, boardWithFinalizedGate)).toBe(true);
  });

  it('should allow measurement cards after overridden UNITARY cards', () => {
    const boardWithOverriddenUnitary = {
      lane: [
        [
          { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
          { id: 'u1', type: CardType.UNITARY, value: 'U' as const },
          { id: 'g1', type: CardType.GATE, value: 'H' as const }
        ],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 3, boardWithOverriddenUnitary)).toBe(true);
  });

  it('should allow measurement cards after CONTROL cards in finalized lane', () => {
    const boardWithFinalizedControl = {
      lane: [
        [
          { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
          { id: 'c1', type: CardType.CONTROL, value: 'C' as const },
          { id: 't1', type: CardType.TARGET, value: 'T' as const },
          { id: 'g1', type: CardType.GATE, value: 'X' as const }
        ],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 4, boardWithFinalizedControl)).toBe(true);
  });

  it('should allow measurement cards after overridden TARGET cards', () => {
    const boardWithOverriddenTarget = {
      lane: [
        [
          { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
          { id: 't1', type: CardType.TARGET, value: 'T' as const },
          { id: 'g1', type: CardType.GATE, value: 'Z' as const }
        ],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 3, boardWithOverriddenTarget)).toBe(true);
  });

  it('should NOT allow measurement cards after other MEASUREMENT cards', () => {
    const boardWithMeasurement = {
      lane: [
        [{ id: 'm0', type: CardType.MEASUREMENT, value: '⟨1|' as const }],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 1, boardWithMeasurement)).toBe(false);
  });

  it('should NOT allow measurement cards at the start of a lane (no previous card)', () => {
    const emptyBoard = {
      lane: [[]],
    };
    
    expect(isValidPlay(measurementCard, 0, 0, emptyBoard)).toBe(false);
  });

  it('should allow measurement cards in sequence with other card types', () => {
    const boardWithSequence = {
      lane: [
        [
          { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
          { id: 'g1', type: CardType.GATE, value: 'X' as const },
          { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' as const }
        ],
      ],
    };
    
    // Should be able to place qubit after measurement
    const qubitCard = { id: 'q2', type: CardType.QUBIT, value: '|1⟩' as const };
    expect(isValidPlay(qubitCard, 0, 3, boardWithSequence)).toBe(true);
    
    // Should NOT be able to place another measurement after measurement
    const measurementCard2 = { id: 'm2', type: CardType.MEASUREMENT, value: '⟨1|' as const };
    expect(isValidPlay(measurementCard2, 0, 3, boardWithSequence)).toBe(false);
  });

  it('should validate different measurement card types in finalized lane', () => {
    const boardWithFinalizedLane = {
      lane: [
        [
          { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
          { id: 'g1', type: CardType.GATE, value: 'H' as const },
          { id: 'u1', type: CardType.UNITARY, value: 'U' as const },
          { id: 'g2', type: CardType.GATE, value: 'X' as const }
        ],
      ],
    };
    
    const measurementCards = [
      { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' as const },
      { id: 'm2', type: CardType.MEASUREMENT, value: '⟨1|' as const },
      { id: 'm3', type: CardType.MEASUREMENT, value: '⟨+|' as const },
      { id: 'm4', type: CardType.MEASUREMENT, value: '⟨-|' as const }
    ];
    
    measurementCards.forEach(card => {
      expect(isValidPlay(card, 0, 4, boardWithFinalizedLane)).toBe(true);
    });
  });

  describe('Unfinalized Measurement Rule', () => {
    it('should NOT allow measurement cards in lane with unoverridden UNITARY card', () => {
      const boardWithUnoverriddenUnitary = {
        lane: [
          [
            { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
            { id: 'u1', type: CardType.UNITARY, value: 'U' as const }
          ],
        ],
      };
      
      // Should not allow measurement because UNITARY card is not overridden
      expect(isValidPlay(measurementCard, 0, 2, boardWithUnoverriddenUnitary, false)).toBe(false);
      expect(isValidPlay(measurementCard, 0, 2, boardWithUnoverriddenUnitary)).toBe(false); // No parameter (defaults to false)
    });

    it('should NOT allow measurement cards in lane with unoverridden TARGET card', () => {
      const boardWithUnoverriddenTarget = {
        lane: [
          [
            { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
            { id: 't1', type: CardType.TARGET, value: 'T' as const }
          ],
        ],
      };
      
      // Should not allow measurement because TARGET card is not overridden
      expect(isValidPlay(measurementCard, 0, 2, boardWithUnoverriddenTarget, false)).toBe(false);
      expect(isValidPlay(measurementCard, 0, 2, boardWithUnoverriddenTarget)).toBe(false); // No parameter (defaults to false)
    });

    it('should allow measurement cards in lane with unoverridden UNITARY/TARGET when allowUnfinalizedMeasurement is true', () => {
      const boardWithUnoverriddenUnitary = {
        lane: [
          [
            { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
            { id: 'u1', type: CardType.UNITARY, value: 'U' as const }
          ],
        ],
      };
      
      const boardWithUnoverriddenTarget = {
        lane: [
          [
            { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
            { id: 't1', type: CardType.TARGET, value: 'T' as const }
          ],
        ],
      };
      
      // When rule is enabled - should allow measurement even with unoverridden UNITARY/TARGET
      expect(isValidPlay(measurementCard, 0, 2, boardWithUnoverriddenUnitary, true)).toBe(true);
      expect(isValidPlay(measurementCard, 0, 2, boardWithUnoverriddenTarget, true)).toBe(true);
    });

    it('should allow measurement cards in finalized lane regardless of allowUnfinalizedMeasurement setting', () => {
      const boardWithFinalizedLane = {
        lane: [
          [
            { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
            { id: 'u1', type: CardType.UNITARY, value: 'U' as const },
            { id: 'g1', type: CardType.GATE, value: 'X' as const }
          ],
        ],
      };
      
      // Should work with both settings when lane is finalized (UNITARY is overridden by GATE)
      expect(isValidPlay(measurementCard, 0, 3, boardWithFinalizedLane, false)).toBe(true);
      expect(isValidPlay(measurementCard, 0, 3, boardWithFinalizedLane, true)).toBe(true);
    });

    it('should correctly identify finalized lanes with overridden TARGET cards', () => {
      const boardWithOverriddenTarget = {
        lane: [
          [
            { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|1⟩' as const },
            { id: 't1', type: CardType.TARGET, value: 'T' as const },
            { id: 'g1', type: CardType.GATE, value: 'H' as const }
          ],
        ],
      };
      
      // Should be allowed because TARGET card is overridden by GATE card
      expect(isValidPlay(measurementCard, 0, 3, boardWithOverriddenTarget, false)).toBe(true);
    });

    it('should correctly identify finalized lanes with only GATE cards after QUBIT', () => {
      const boardWithGateOnly = {
        lane: [
          [
            { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
            { id: 'g1', type: CardType.GATE, value: 'X' as const }
          ],
        ],
      };
      
      // Should be allowed because GATE cards don't need to be overridden
      expect(isValidPlay(measurementCard, 0, 2, boardWithGateOnly, false)).toBe(true);
    });

    it('should handle lane without qubit card based on allowUnfinalizedMeasurement setting', () => {
      const boardWithoutQubit = {
        lane: [
          [{ id: 'g1', type: CardType.GATE, value: 'X' as const }],
        ],
      };
      
      // Should not work when allowUnfinalizedMeasurement is false
      expect(isValidPlay(measurementCard, 0, 1, boardWithoutQubit, false)).toBe(false);
      // Should work when allowUnfinalizedMeasurement is true (allows measurement in any lane)
      expect(isValidPlay(measurementCard, 0, 1, boardWithoutQubit, true)).toBe(true);
    });

    it('should handle complex lane with multiple UNITARY/TARGET cards', () => {
      const boardWithComplexLane = {
        lane: [
          [
            { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
            { id: 'u1', type: CardType.UNITARY, value: 'U' as const },
            { id: 'g1', type: CardType.GATE, value: 'X' as const },
            { id: 't1', type: CardType.TARGET, value: 'T' as const }
          ],
        ],
      };
      
      // Should not allow measurement because TARGET card at the end is not overridden
      expect(isValidPlay(measurementCard, 0, 4, boardWithComplexLane, false)).toBe(false);
      
      // Should allow when rule is disabled
      expect(isValidPlay(measurementCard, 0, 4, boardWithComplexLane, true)).toBe(true);
    });

    it('should handle complex lane where all UNITARY/TARGET cards are overridden', () => {
      const boardWithFullyOverriddenLane = {
        lane: [
          [
            { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
            { id: 'u1', type: CardType.UNITARY, value: 'U' as const },
            { id: 'g1', type: CardType.GATE, value: 'X' as const },
            { id: 't1', type: CardType.TARGET, value: 'T' as const },
            { id: 'g2', type: CardType.GATE, value: 'Z' as const }
          ],
        ],
      };
      
      // Should allow measurement because all UNITARY/TARGET cards are overridden
      expect(isValidPlay(measurementCard, 0, 5, boardWithFullyOverriddenLane, false)).toBe(true);
      expect(isValidPlay(measurementCard, 0, 5, boardWithFullyOverriddenLane, true)).toBe(true);
    });
  });
});