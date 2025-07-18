// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { QuantumEngine } from '../../src/quantum/quantumEngine';
import { QuantumComputationContext, QuantumCircuit, QubitState, MeasurementBasis } from '../../src/quantum/types';

describe('QuantumEngine', () => {
  let quantumEngine: QuantumEngine;

  beforeEach(() => {
    quantumEngine = new QuantumEngine();
  });

  describe('Quantum State Conversion', () => {
    it('should convert |0⟩ to correct quantum state', () => {
      const result = quantumEngine.executeQuantumComputation({
        circuit: {
          lanes: [[{
            type: 'qubit',
            value: '|0⟩',
            position: 0,
            laneIndex: 0
          }]],
          initialStates: [{ amplitude0: { real: 1, imaginary: 0 }, amplitude1: { real: 0, imaginary: 0 } }]
        },
        measurementLane: 0,
        measurementPosition: 1,
        measurementBasis: '⟨0|'
      });

      expect(result.measurementResult.outcome).toBe('0');
      expect(result.measurementResult.probability).toBeCloseTo(1.0);
    });

    it('should convert |1⟩ to correct quantum state', () => {
      const result = quantumEngine.executeQuantumComputation({
        circuit: {
          lanes: [[{
            type: 'qubit',
            value: '|1⟩',
            position: 0,
            laneIndex: 0
          }]],
          initialStates: [{ amplitude0: { real: 0, imaginary: 0 }, amplitude1: { real: 1, imaginary: 0 } }]
        },
        measurementLane: 0,
        measurementPosition: 1,
        measurementBasis: '⟨1|'
      });

      expect(result.measurementResult.outcome).toBe('1');
      expect(result.measurementResult.probability).toBeCloseTo(1.0);
    });

    it('should convert |+⟩ to superposition state', () => {
      const result = quantumEngine.executeQuantumComputation({
        circuit: {
          lanes: [[{
            type: 'qubit',
            value: '|+⟩',
            position: 0,
            laneIndex: 0
          }]],
          initialStates: [{ 
            amplitude0: { real: 1/Math.sqrt(2), imaginary: 0 }, 
            amplitude1: { real: 1/Math.sqrt(2), imaginary: 0 } 
          }]
        },
        measurementLane: 0,
        measurementPosition: 1,
        measurementBasis: '⟨+|'
      });

      expect(result.measurementResult.probability).toBeCloseTo(1.0);
    });
  });

  describe('Gate Operations', () => {
    it('should apply X gate correctly', () => {
      const result = quantumEngine.executeQuantumComputation({
        circuit: {
          lanes: [[
            {
              type: 'qubit',
              value: '|0⟩',
              position: 0,
              laneIndex: 0
            },
            {
              type: 'gate',
              value: 'X',
              position: 1,
              laneIndex: 0
            }
          ]],
          initialStates: [{ amplitude0: { real: 1, imaginary: 0 }, amplitude1: { real: 0, imaginary: 0 } }]
        },
        measurementLane: 0,
        measurementPosition: 2,
        measurementBasis: '⟨1|'
      });

      // After X gate, |0⟩ should become |1⟩
      expect(result.measurementResult.outcome).toBe('1');
      expect(result.measurementResult.probability).toBeCloseTo(1.0);
    });

    it('should apply H gate to create superposition', () => {
      const result = quantumEngine.executeQuantumComputation({
        circuit: {
          lanes: [[
            {
              type: 'qubit',
              value: '|0⟩',
              position: 0,
              laneIndex: 0
            },
            {
              type: 'gate',
              value: 'H',
              position: 1,
              laneIndex: 0
            }
          ]],
          initialStates: [{ amplitude0: { real: 1, imaginary: 0 }, amplitude1: { real: 0, imaginary: 0 } }]
        },
        measurementLane: 0,
        measurementPosition: 2,
        measurementBasis: '⟨0|'
      });

      // After H gate, |0⟩ should be in superposition
      expect(result.measurementResult.probability).toBeCloseTo(0.5);
    });

    it('should apply I gate without changing state', () => {
      const result = quantumEngine.executeQuantumComputation({
        circuit: {
          lanes: [[
            {
              type: 'qubit',
              value: '|1⟩',
              position: 0,
              laneIndex: 0
            },
            {
              type: 'gate',
              value: 'I',
              position: 1,
              laneIndex: 0
            }
          ]],
          initialStates: [{ amplitude0: { real: 0, imaginary: 0 }, amplitude1: { real: 1, imaginary: 0 } }]
        },
        measurementLane: 0,
        measurementPosition: 2,
        measurementBasis: '⟨1|'
      });

      // Identity gate should not change the state
      expect(result.measurementResult.outcome).toBe('1');
      expect(result.measurementResult.probability).toBeCloseTo(1.0);
    });
  });

  describe('Measurement Bases', () => {
    it('should measure in computational basis correctly', () => {
      const result = quantumEngine.executeQuantumComputation({
        circuit: {
          lanes: [[{
            type: 'qubit',
            value: '|0⟩',
            position: 0,
            laneIndex: 0
          }]],
          initialStates: [{ amplitude0: { real: 1, imaginary: 0 }, amplitude1: { real: 0, imaginary: 0 } }]
        },
        measurementLane: 0,
        measurementPosition: 1,
        measurementBasis: '⟨0|'
      });

      expect(result.measurementResult.outcome).toBe('0');
      expect(result.gameScore).toBeGreaterThanOrEqual(0);
    });

    it('should measure in Hadamard basis correctly', () => {
      const result = quantumEngine.executeQuantumComputation({
        circuit: {
          lanes: [[{
            type: 'qubit',
            value: '|+⟩',
            position: 0,
            laneIndex: 0
          }]],
          initialStates: [{ 
            amplitude0: { real: 1/Math.sqrt(2), imaginary: 0 }, 
            amplitude1: { real: 1/Math.sqrt(2), imaginary: 0 } 
          }]
        },
        measurementLane: 0,
        measurementPosition: 1,
        measurementBasis: '⟨+|'
      });

      expect(result.measurementResult.probability).toBeCloseTo(1.0);
      expect(result.gameScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Computation Steps', () => {
    it('should record computation steps', () => {
      const result = quantumEngine.executeQuantumComputation({
        circuit: {
          lanes: [[
            {
              type: 'qubit',
              value: '|0⟩',
              position: 0,
              laneIndex: 0
            },
            {
              type: 'gate',
              value: 'X',
              position: 1,
              laneIndex: 0
            }
          ]],
          initialStates: [{ amplitude0: { real: 1, imaginary: 0 }, amplitude1: { real: 0, imaginary: 0 } }]
        },
        measurementLane: 0,
        measurementPosition: 2,
        measurementBasis: '⟨1|'
      });

      expect(result.computationSteps).toBeInstanceOf(Array);
      expect(result.computationSteps.length).toBeGreaterThan(0);
      expect(result.computationSteps.some(step => step.includes('Starting quantum computation'))).toBe(true);
      expect(result.computationSteps.some(step => step.includes('Applied X gate'))).toBe(true);
    });

    it('should record execution time', () => {
      const result = quantumEngine.executeQuantumComputation({
        circuit: {
          lanes: [[{
            type: 'qubit',
            value: '|0⟩',
            position: 0,
            laneIndex: 0
          }]],
          initialStates: [{ amplitude0: { real: 1, imaginary: 0 }, amplitude1: { real: 0, imaginary: 0 } }]
        },
        measurementLane: 0,
        measurementPosition: 1,
        measurementBasis: '⟨0|'
      });

      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.executionTime).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown gate types gracefully', () => {
      expect(() => {
        quantumEngine.executeQuantumComputation({
          circuit: {
            lanes: [[
              {
                type: 'gate',
                value: 'UNKNOWN',
                position: 0,
                laneIndex: 0
              }
            ]],
            initialStates: [{ amplitude0: { real: 1, imaginary: 0 }, amplitude1: { real: 0, imaginary: 0 } }]
          },
          measurementLane: 0,
          measurementPosition: 1,
          measurementBasis: '⟨0|'
        });
      }).toThrow();
    });

    it('should handle unknown qubit states gracefully', () => {
      expect(() => {
        quantumEngine.cardValueToQuantumState('|unknown⟩' as QubitState);
      }).toThrow();
    });
  });
});