// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { isValidPlay } from '../../src/game/gameLogic';
import { CardType } from '../../src/game/types';

describe('TARGET Card Placement Rules', () => {
  // Mock board with TARGET card
  const mockBoardWithTarget = {
    lane: [
      [
        { id: 'i1', type: CardType.GATE, value: 'I' as const },
        { id: 't1', type: CardType.TARGET, value: 'T' as const }
      ],
    ],
  };

  // Mock board with UNITARY card for comparison
  const mockBoardWithUnitary = {
    lane: [
      [
        { id: 'i1', type: CardType.GATE, value: 'I' as const },
        { id: 'u1', type: CardType.UNITARY, value: 'U' as const }
      ],
    ],
  };

  it('should allow GATE cards to be placed on TARGET cards', () => {
    const gateCard = { id: 'x1', type: CardType.GATE, value: 'X' as const };
    
    // Should be able to place GATE on TARGET card
    expect(isValidPlay(gateCard, 0, 1, mockBoardWithTarget)).toBe(true);
  });

  it('should allow GATE cards to be placed on UNITARY cards (existing behavior)', () => {
    const gateCard = { id: 'x1', type: CardType.GATE, value: 'X' as const };
    
    // Should be able to place GATE on UNITARY card (existing functionality)
    expect(isValidPlay(gateCard, 0, 1, mockBoardWithUnitary)).toBe(true);
  });

  it('should not allow other card types to be placed on TARGET cards', () => {
    const qubitCard = { id: 'q1', type: CardType.QUBIT, value: '|0⟩' as const };
    const unitaryCard = { id: 'u2', type: CardType.UNITARY, value: 'U' as const };
    const measurementCard = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' as const };
    const controlCard = { id: 'c1', type: CardType.CONTROL, value: 'C' as const };
    
    // These should all fail when trying to place on TARGET card
    expect(isValidPlay(qubitCard, 0, 1, mockBoardWithTarget)).toBe(false);
    expect(isValidPlay(unitaryCard, 0, 1, mockBoardWithTarget)).toBe(false);
    expect(isValidPlay(measurementCard, 0, 1, mockBoardWithTarget)).toBe(false);
    expect(isValidPlay(controlCard, 0, 1, mockBoardWithTarget)).toBe(false);
  });

  it('should allow different GATE types on TARGET cards', () => {
    const gateCards = [
      { id: 'i2', type: CardType.GATE, value: 'I' as const },
      { id: 'x1', type: CardType.GATE, value: 'X' as const },
      { id: 'z1', type: CardType.GATE, value: 'Z' as const }
    ];
    
    gateCards.forEach(gateCard => {
      expect(isValidPlay(gateCard, 0, 1, mockBoardWithTarget)).toBe(true);
    });
  });

  it('should allow H gate on TARGET cards when controlledHadamard is enabled', () => {
    const hCard = { id: 'h1', type: CardType.GATE, value: 'H' as const };
    
    // With controlledHadamard enabled
    expect(isValidPlay(hCard, 0, 1, mockBoardWithTarget, false, true)).toBe(true);
  });

  it('should not allow H gate on TARGET cards when controlledHadamard is disabled', () => {
    const hCard = { id: 'h1', type: CardType.GATE, value: 'H' as const };
    
    // With controlledHadamard disabled (default)
    expect(isValidPlay(hCard, 0, 1, mockBoardWithTarget, false, false)).toBe(false);
    
    // Without controlledHadamard parameter (defaults to false)
    expect(isValidPlay(hCard, 0, 1, mockBoardWithTarget)).toBe(false);
  });

  it('should not allow TARGET cards to be manually placed (not in deck)', () => {
    const targetCard = { id: 't2', type: CardType.TARGET, value: 'T' as const };
    
    const emptyBoard = {
      lane: [
        [{ id: 'i1', type: CardType.GATE, value: 'I' as const }],
      ],
    };
    
    // TARGET cards should not be manually placeable
    expect(isValidPlay(targetCard, 0, 1, emptyBoard)).toBe(false);
  });

  it('should handle TARGET cards in different lane positions', () => {
    const multiLaneBoard = {
      lane: [
        [
          { id: 'i1', type: CardType.GATE, value: 'I' as const },
          { id: 't1', type: CardType.TARGET, value: 'T' as const }
        ],
        [
          { id: 'i2', type: CardType.GATE, value: 'I' as const },
          null,
          { id: 't2', type: CardType.TARGET, value: 'T' as const }
        ],
      ],
    };

    const gateCard = { id: 'x1', type: CardType.GATE, value: 'X' as const };
    
    // Should work in lane 0, position 1
    expect(isValidPlay(gateCard, 0, 1, multiLaneBoard)).toBe(true);
    
    // Should work in lane 1, position 2
    expect(isValidPlay(gateCard, 1, 2, multiLaneBoard)).toBe(true);
    
    // Should not work in lane 1, position 1 (empty slot)
    expect(isValidPlay(gateCard, 1, 1, multiLaneBoard)).toBe(true); // Actually valid - can place in empty slot
  });
});