// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { isValidPlay } from '../../src/game/gameLogic';
import { CardType } from '../../src/game/types';

describe('Measurement Card Placement Rules', () => {
  const measurementCard = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' as const };

  it('should allow measurement cards after QUBIT cards', () => {
    const boardWithQubit = {
      lane: [
        [{ id: 'q1', type: CardType.QUBIT, value: '|0⟩' as const }],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 1, boardWithQubit)).toBe(true);
  });

  it('should allow measurement cards after INITIAL_QUBIT cards', () => {
    const boardWithInitialQubit = {
      lane: [
        [{ id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const }],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 1, boardWithInitialQubit)).toBe(true);
  });

  it('should allow measurement cards after GATE cards', () => {
    const boardWithGate = {
      lane: [
        [{ id: 'g1', type: CardType.GATE, value: 'X' as const }],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 1, boardWithGate)).toBe(true);
  });

  it('should allow measurement cards after UNITARY cards', () => {
    const boardWithUnitary = {
      lane: [
        [{ id: 'u1', type: CardType.UNITARY, value: 'U' as const }],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 1, boardWithUnitary)).toBe(true);
  });

  it('should allow measurement cards after CONTROL cards', () => {
    const boardWithControl = {
      lane: [
        [{ id: 'c1', type: CardType.CONTROL, value: 'C' as const }],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 1, boardWithControl)).toBe(true);
  });

  it('should allow measurement cards after TARGET cards', () => {
    const boardWithTarget = {
      lane: [
        [{ id: 't1', type: CardType.TARGET, value: 'T' as const }],
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 1, boardWithTarget)).toBe(true);
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

  it('should validate different measurement card types', () => {
    const boardWithGate = {
      lane: [
        [{ id: 'g1', type: CardType.GATE, value: 'H' as const }],
      ],
    };
    
    const measurementCards = [
      { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' as const },
      { id: 'm2', type: CardType.MEASUREMENT, value: '⟨1|' as const },
      { id: 'm3', type: CardType.MEASUREMENT, value: '⟨+|' as const },
      { id: 'm4', type: CardType.MEASUREMENT, value: '⟨-|' as const }
    ];
    
    measurementCards.forEach(card => {
      expect(isValidPlay(card, 0, 1, boardWithGate)).toBe(true);
    });
  });
});