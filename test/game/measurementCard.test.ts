// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { calculateMeasurementScore, findPrecedingQubit } from '../../src/game/gameLogic';
import { Card, CardType } from '../../src/game/types';

describe('Measurement Card Functionality', () => {
  describe('calculateMeasurementScore', () => {
    it('should return 5 points for measurement result 1', () => {
      // |0⟩ measured with ⟨0| gives result '1' (perfect match)
      expect(calculateMeasurementScore('|0⟩', '⟨0|')).toBe(5);
      
      // |1⟩ measured with ⟨1| gives result '1' (perfect match)
      expect(calculateMeasurementScore('|1⟩', '⟨1|')).toBe(5);
      
      // |+⟩ measured with ⟨+| gives result '1' (perfect match)
      expect(calculateMeasurementScore('|+⟩', '⟨+|')).toBe(5);
      
      // |-⟩ measured with ⟨-| gives result '1' (perfect match)
      expect(calculateMeasurementScore('|-⟩', '⟨-|')).toBe(5);
    });

    it('should return 3 points for measurement result 0', () => {
      // |0⟩ measured with ⟨1| gives result '0' (no match)
      expect(calculateMeasurementScore('|0⟩', '⟨1|')).toBe(3);
      
      // |1⟩ measured with ⟨0| gives result '0' (no match)
      expect(calculateMeasurementScore('|1⟩', '⟨0|')).toBe(3);
      
      // |+⟩ measured with ⟨-| gives result '0' (no match)
      expect(calculateMeasurementScore('|+⟩', '⟨-|')).toBe(3);
      
      // |-⟩ measured with ⟨+| gives result '0' (no match)
      expect(calculateMeasurementScore('|-⟩', '⟨+|')).toBe(3);
      
      // Cross-basis measurements (50% probability cases default to '0')
      expect(calculateMeasurementScore('|0⟩', '⟨+|')).toBe(3);
      expect(calculateMeasurementScore('|0⟩', '⟨-|')).toBe(3);
      expect(calculateMeasurementScore('|1⟩', '⟨+|')).toBe(5); // |1⟩ in +/- basis defaults to '1'
      expect(calculateMeasurementScore('|1⟩', '⟨-|')).toBe(5); // |1⟩ in +/- basis defaults to '1'
      expect(calculateMeasurementScore('|+⟩', '⟨0|')).toBe(3);
      expect(calculateMeasurementScore('|+⟩', '⟨1|')).toBe(3);
      expect(calculateMeasurementScore('|-⟩', '⟨0|')).toBe(3);
      expect(calculateMeasurementScore('|-⟩', '⟨1|')).toBe(3);
    });

    it('should return 3 points for unknown combinations (default to measurement result 0)', () => {
      expect(calculateMeasurementScore('unknown', '⟨0|')).toBe(3);
      expect(calculateMeasurementScore('|0⟩', 'unknown')).toBe(3);
      expect(calculateMeasurementScore('unknown', 'unknown')).toBe(3);
    });
  });

  describe('findPrecedingQubit', () => {
    it('should find the most recent qubit card', () => {
      const lane: (Card | null)[] = [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.QUBIT, value: '|0⟩' },
        { id: '3', type: CardType.GATE, value: 'X' },
        { id: '4', type: CardType.QUBIT, value: '|+⟩' },
        null // Measurement position
      ];

      const result = findPrecedingQubit(lane, 4);
      expect(result).toEqual({ id: '4', type: CardType.QUBIT, value: '|+⟩' });
    });

    it('should find initial qubit cards', () => {
      const lane: (Card | null)[] = [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.INITIAL_QUBIT, value: '|1⟩' },
        { id: '3', type: CardType.GATE, value: 'H' },
        null // Measurement position
      ];

      const result = findPrecedingQubit(lane, 3);
      expect(result).toEqual({ id: '2', type: CardType.INITIAL_QUBIT, value: '|1⟩' });
    });

    it('should return null when no qubit is found', () => {
      const lane: (Card | null)[] = [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.GATE, value: 'X' },
        { id: '3', type: CardType.UNITARY, value: 'U' },
        null // Measurement position
      ];

      const result = findPrecedingQubit(lane, 3);
      expect(result).toBeNull();
    });

    it('should handle empty lane', () => {
      const lane: (Card | null)[] = [];
      const result = findPrecedingQubit(lane, 0);
      expect(result).toBeNull();
    });

    it('should handle measurement at the beginning of lane', () => {
      const lane: (Card | null)[] = [
        null // Measurement position at start
      ];

      const result = findPrecedingQubit(lane, 0);
      expect(result).toBeNull();
    });

    it('should skip null values when searching backwards', () => {
      const lane: (Card | null)[] = [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.QUBIT, value: '|0⟩' },
        null,
        null,
        { id: '3', type: CardType.GATE, value: 'X' },
        null // Measurement position
      ];

      const result = findPrecedingQubit(lane, 5);
      expect(result).toEqual({ id: '2', type: CardType.QUBIT, value: '|0⟩' });
    });

    it('should find the most recent qubit among multiple', () => {
      const lane: (Card | null)[] = [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        { id: '3', type: CardType.GATE, value: 'X' },
        { id: '4', type: CardType.QUBIT, value: '|+⟩' },
        { id: '5', type: CardType.GATE, value: 'Z' },
        { id: '6', type: CardType.QUBIT, value: '|-⟩' },
        null // Measurement position
      ];

      const result = findPrecedingQubit(lane, 6);
      expect(result).toEqual({ id: '6', type: CardType.QUBIT, value: '|-⟩' });
    });
  });

  describe('Measurement Card Game Logic', () => {
    it('should calculate correct scores based on measurement outcomes', () => {
      const testCases = [
        // Perfect matches → measurement result '1' → 5 points
        { quantum: '|0⟩', measurement: '⟨0|', expectedScore: 5, description: '|0⟩ with ⟨0|, perfect match' },
        { quantum: '|1⟩', measurement: '⟨1|', expectedScore: 5, description: '|1⟩ with ⟨1|, perfect match' },
        { quantum: '|+⟩', measurement: '⟨+|', expectedScore: 5, description: '|+⟩ with ⟨+|, perfect match' },
        { quantum: '|-⟩', measurement: '⟨-|', expectedScore: 5, description: '|-⟩ with ⟨-|, perfect match' },
        
        // No matches → measurement result '0' → 3 points
        { quantum: '|0⟩', measurement: '⟨1|', expectedScore: 3, description: '|0⟩ with ⟨1|, no match' },
        { quantum: '|1⟩', measurement: '⟨0|', expectedScore: 3, description: '|1⟩ with ⟨0|, no match' },
        { quantum: '|+⟩', measurement: '⟨-|', expectedScore: 3, description: '|+⟩ with ⟨-|, no match' },
        { quantum: '|-⟩', measurement: '⟨+|', expectedScore: 3, description: '|-⟩ with ⟨+|, no match' },
        
        // Cross-basis measurements (50% probability, use defaults)
        { quantum: '|0⟩', measurement: '⟨+|', expectedScore: 3, description: '|0⟩ in +/- basis, default 0' },
        { quantum: '|0⟩', measurement: '⟨-|', expectedScore: 3, description: '|0⟩ in +/- basis, default 0' },
        { quantum: '|1⟩', measurement: '⟨+|', expectedScore: 5, description: '|1⟩ in +/- basis, default 1' },
        { quantum: '|1⟩', measurement: '⟨-|', expectedScore: 5, description: '|1⟩ in +/- basis, default 1' },
        { quantum: '|+⟩', measurement: '⟨0|', expectedScore: 3, description: '|+⟩ in computational basis, default 0' },
        { quantum: '|+⟩', measurement: '⟨1|', expectedScore: 3, description: '|+⟩ in computational basis, default 0' },
        { quantum: '|-⟩', measurement: '⟨0|', expectedScore: 3, description: '|-⟩ in computational basis, default 0' },
        { quantum: '|-⟩', measurement: '⟨1|', expectedScore: 3, description: '|-⟩ in computational basis, default 0' }
      ];

      testCases.forEach(({ quantum, measurement, expectedScore, description }) => {
        expect(calculateMeasurementScore(quantum, measurement))
          .toBe(expectedScore);
      });
    });

    it('should work correctly with INITIAL_QUBIT cards', () => {
      // Test INITIAL_QUBIT cards with correct measurement outcome
      const testCases = [
        // Perfect matches with INITIAL_QUBIT should give same results as regular QUBIT
        { quantum: '|0⟩', measurement: '⟨0|', expectedScore: 5, description: 'INITIAL_QUBIT |0⟩ with ⟨0|, perfect match' },
        { quantum: '|0⟩', measurement: '⟨1|', expectedScore: 3, description: 'INITIAL_QUBIT |0⟩ with ⟨1|, no match' },
        { quantum: '|1⟩', measurement: '⟨1|', expectedScore: 5, description: 'INITIAL_QUBIT |1⟩ with ⟨1|, perfect match' },
        { quantum: '|1⟩', measurement: '⟨0|', expectedScore: 3, description: 'INITIAL_QUBIT |1⟩ with ⟨0|, no match' },
      ];

      testCases.forEach(({ quantum, measurement, expectedScore, description }) => {
        expect(calculateMeasurementScore(quantum, measurement))
          .toBe(expectedScore);
      });
    });

    it('should handle INITIAL_QUBIT measurement integration correctly', () => {
      // Test the full integration: findPrecedingQubit + calculateMeasurementScore
      const lane: (Card | null)[] = [
        { id: '1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        { id: '2', type: CardType.GATE, value: 'H' },
        null // Measurement position
      ];

      const precedingQubit = findPrecedingQubit(lane, 2);
      expect(precedingQubit).not.toBeNull();
      
      if (precedingQubit) {
        // Test that INITIAL_QUBIT |0⟩ measured with ⟨0| gives 5 points (outcome '1')
        const score = calculateMeasurementScore(precedingQubit.value, '⟨0|');
        expect(score).toBe(5);
        
        // Test that INITIAL_QUBIT |0⟩ measured with ⟨1| gives 3 points (outcome '0')
        const score2 = calculateMeasurementScore(precedingQubit.value, '⟨1|');
        expect(score2).toBe(3);
      }
    });
  });
});