// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { calculateMeasurementScore, findPrecedingQubit } from '../../src/game/gameLogic';
import { Card, CardType } from '../../src/game/types';

describe('Measurement Card Functionality', () => {
  describe('calculateMeasurementScore', () => {
    it('should return 5 points for measurement result 1', () => {
      // |1⟩ states always measure as '1' regardless of measurement basis
      expect(calculateMeasurementScore('|1⟩', '⟨0|')).toBe(5);
      expect(calculateMeasurementScore('|1⟩', '⟨1|')).toBe(5);
      expect(calculateMeasurementScore('|1⟩', '⟨+|')).toBe(5);
      expect(calculateMeasurementScore('|1⟩', '⟨-|')).toBe(5);
      
      // |-⟩ states always measure as '1' in +/- basis
      expect(calculateMeasurementScore('|-⟩', '⟨+|')).toBe(5);
      expect(calculateMeasurementScore('|-⟩', '⟨-|')).toBe(5);
    });

    it('should return 3 points for measurement result 0', () => {
      // |0⟩ states always measure as '0' regardless of measurement basis
      expect(calculateMeasurementScore('|0⟩', '⟨0|')).toBe(3);
      expect(calculateMeasurementScore('|0⟩', '⟨1|')).toBe(3);
      expect(calculateMeasurementScore('|0⟩', '⟨+|')).toBe(3);
      expect(calculateMeasurementScore('|0⟩', '⟨-|')).toBe(3);
      
      // |+⟩ states always measure as '0' in +/- basis and computational basis
      expect(calculateMeasurementScore('|+⟩', '⟨0|')).toBe(3);
      expect(calculateMeasurementScore('|+⟩', '⟨1|')).toBe(3);
      expect(calculateMeasurementScore('|+⟩', '⟨+|')).toBe(3);
      expect(calculateMeasurementScore('|+⟩', '⟨-|')).toBe(3);
      
      // |-⟩ states measure as '0' in computational basis (equal probability, defaulting to '0')
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
        // |0⟩ always gives measurement result '0' → 3 points
        { quantum: '|0⟩', measurement: '⟨0|', expectedScore: 3, description: '|0⟩ measured, result 0' },
        { quantum: '|0⟩', measurement: '⟨1|', expectedScore: 3, description: '|0⟩ measured, result 0' },
        { quantum: '|0⟩', measurement: '⟨+|', expectedScore: 3, description: '|0⟩ measured, result 0' },
        { quantum: '|0⟩', measurement: '⟨-|', expectedScore: 3, description: '|0⟩ measured, result 0' },
        
        // |1⟩ always gives measurement result '1' → 5 points
        { quantum: '|1⟩', measurement: '⟨0|', expectedScore: 5, description: '|1⟩ measured, result 1' },
        { quantum: '|1⟩', measurement: '⟨1|', expectedScore: 5, description: '|1⟩ measured, result 1' },
        { quantum: '|1⟩', measurement: '⟨+|', expectedScore: 5, description: '|1⟩ measured, result 1' },
        { quantum: '|1⟩', measurement: '⟨-|', expectedScore: 5, description: '|1⟩ measured, result 1' },
        
        // |+⟩ always gives measurement result '0' → 3 points
        { quantum: '|+⟩', measurement: '⟨0|', expectedScore: 3, description: '|+⟩ measured, result 0' },
        { quantum: '|+⟩', measurement: '⟨1|', expectedScore: 3, description: '|+⟩ measured, result 0' },
        { quantum: '|+⟩', measurement: '⟨+|', expectedScore: 3, description: '|+⟩ measured, result 0' },
        { quantum: '|+⟩', measurement: '⟨-|', expectedScore: 3, description: '|+⟩ measured, result 0' },
        
        // |-⟩ gives different results based on basis
        { quantum: '|-⟩', measurement: '⟨0|', expectedScore: 3, description: '|-⟩ in computational basis, result 0' },
        { quantum: '|-⟩', measurement: '⟨1|', expectedScore: 3, description: '|-⟩ in computational basis, result 0' },
        { quantum: '|-⟩', measurement: '⟨+|', expectedScore: 5, description: '|-⟩ in +/- basis, result 1' },
        { quantum: '|-⟩', measurement: '⟨-|', expectedScore: 5, description: '|-⟩ in +/- basis, result 1' }
      ];

      testCases.forEach(({ quantum, measurement, expectedScore, description }) => {
        expect(calculateMeasurementScore(quantum, measurement))
          .toBe(expectedScore);
      });
    });
  });
});