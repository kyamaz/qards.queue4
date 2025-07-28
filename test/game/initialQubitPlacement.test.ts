// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { isValidPlay } from '../../src/game/gameLogic';
import { CardType } from '../../src/game/types';

describe('INITIAL_QUBIT Card Placement Rules', () => {
  // Mock board with INITIAL_QUBIT card only
  const mockBoardWithInitialQubit = {
    lane: [
      [
        { id: 'initial1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const }
      ],
    ],
  };

  it('should allow GATE cards after INITIAL_QUBIT cards', () => {
    const gateCard = { id: 'x1', type: CardType.GATE, value: 'X' as const };
    
    expect(isValidPlay(gateCard, 0, 1, mockBoardWithInitialQubit)).toBe(true);
  });

  it('should NOT allow QUBIT cards after INITIAL_QUBIT cards', () => {
    const qubitCard = { id: 'q1', type: CardType.QUBIT, value: '|+⟩' as const };
    
    expect(isValidPlay(qubitCard, 0, 1, mockBoardWithInitialQubit)).toBe(false);
  });

  it('should allow UNITARY cards after INITIAL_QUBIT cards', () => {
    const unitaryCard = { id: 'u1', type: CardType.UNITARY, value: 'U' as const };
    
    expect(isValidPlay(unitaryCard, 0, 1, mockBoardWithInitialQubit)).toBe(true);
  });

  it('should allow MEASUREMENT cards after INITIAL_QUBIT cards in finalized lane', () => {
    const measurementCard = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' as const };
    // When UNITARY is overridden by GATE, only GATE remains in the lane
    const mockBoardWithFinalizedInitialQubit = {
      lane: [
        [
          { id: 'initial1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
          { id: 'g1', type: CardType.GATE, value: 'H' as const } // UNITARY was replaced by GATE
        ]
      ],
    };
    
    expect(isValidPlay(measurementCard, 0, 2, mockBoardWithFinalizedInitialQubit)).toBe(true);
  });

  it('should not allow CONTROL cards after INITIAL_QUBIT cards', () => {
    const controlCard = { id: 'c1', type: CardType.CONTROL, value: 'C' as const };
    
    expect(isValidPlay(controlCard, 0, 1, mockBoardWithInitialQubit)).toBe(false);
  });

  it('should allow different card types in sequence after INITIAL_QUBIT', () => {
    // Test placing multiple cards after INITIAL_QUBIT
    const boardWithSequence = {
      lane: [
        [
          { id: 'initial1', type: CardType.INITIAL_QUBIT, value: '|0⟩' as const },
          { id: 'gate1', type: CardType.GATE, value: 'X' as const }
        ],
      ],
    };

    const qubitCard = { id: 'q1', type: CardType.QUBIT, value: '|+⟩' as const };
    
    // Should be able to place qubit after gate (which came after INITIAL_QUBIT)
    expect(isValidPlay(qubitCard, 0, 2, boardWithSequence)).toBe(false); // Can't place qubit after gate
    
    const gateCard2 = { id: 'gate2', type: CardType.GATE, value: 'Z' as const };
    
    // Should be able to place gate after gate
    expect(isValidPlay(gateCard2, 0, 2, boardWithSequence)).toBe(true);
  });
});