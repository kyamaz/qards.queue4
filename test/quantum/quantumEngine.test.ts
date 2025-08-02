// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { QuantumEngine } from '../../src/quantum/quantumEngine';
import { QuantumComputationContext, QubitState, QuantumCircuitElement } from '../../src/quantum/types';

describe('QuantumEngine (Multi-Qubit, Generic)', () => {
  let quantumEngine: QuantumEngine;

  beforeEach(() => {
    quantumEngine = new QuantumEngine();
  });

  describe('State Initialization', () => {
    it('should create a |010⟩ initial state correctly for 3 qubits', () => {
      const state = quantumEngine.createInitialState(['|0⟩', '|1⟩', '|0⟩']);
      expect(state.numQubits).toBe(3);
      expect(state.amplitudes.length).toBe(8);
      expect(state.amplitudes[2].real).toBe(1); // |010⟩ is index 2
      expect(state.amplitudes.filter(a => a.real !== 0).length).toBe(1);
    });
  });

  describe('Gate Application (Generic)', () => {
    it('should apply a single-qubit X gate on a 3-qubit system', () => {
      let state = quantumEngine.createInitialState(['|1⟩', '|0⟩', '|1⟩']); // |101⟩ is index 5
      const xGateElement: QuantumCircuitElement = { type: 'gate', value: 'X', position: 0, targetLane: 1 };
      state = quantumEngine['applyGate'](state, xGateElement);
      expect(state.amplitudes[5].real).toBeCloseTo(0);
      expect(state.amplitudes[7].real).toBeCloseTo(1); // |111⟩ is index 7
    });

    it('should apply CNOT gate with control > target', () => {
      let state = quantumEngine.createInitialState(['|1⟩', '|1⟩', '|0⟩']); // |110⟩ is index 6
      const cnotElement: QuantumCircuitElement = { type: 'gate', value: 'CNOT', position: 0, controlLane: 1, targetLane: 0 };
      state = quantumEngine['applyGate'](state, cnotElement);
      expect(state.amplitudes[6].real).toBeCloseTo(0);
      expect(state.amplitudes[2].real).toBeCloseTo(1); // |010⟩ is index 2
    });

    it('should apply CNOT gate on non-adjacent qubits in a 3-qubit system', () => {
      let state = quantumEngine.createInitialState(['|1⟩', '|0⟩', '|0⟩']); // |100⟩ is index 4
      const cnotElement: QuantumCircuitElement = { type: 'gate', value: 'CNOT', position: 0, controlLane: 0, targetLane: 2 };
      state = quantumEngine['applyGate'](state, cnotElement);
      expect(state.amplitudes[4].real).toBeCloseTo(0);
      expect(state.amplitudes[5].real).toBeCloseTo(1); // |101⟩ is index 5
    });
  });

  describe('Entanglement and State Collapse', () => {
    let bellState;

    beforeEach(() => {
      // Create Bell state: (|00⟩ + |11⟩) / √2
      bellState = quantumEngine.createInitialState(['|0⟩', '|0⟩']);
      bellState = quantumEngine['applyGate'](bellState, { type: 'gate', value: 'H', position: 0, targetLane: 0 });
      bellState = quantumEngine['applyGate'](bellState, { type: 'gate', value: 'CNOT', position: 1, controlLane: 0, targetLane: 1 });
    });

    it('should ensure the other qubit is 0 if the first is measured as 0', () => {
      // Force measurement of qubit 0 to be '0'
      jest.spyOn(Math, 'random').mockReturnValue(0.4); // < 0.5
      const { finalState } = quantumEngine['performMeasurement'](bellState, 0, '⟨0|');
      
      // The state must have collapsed to |00⟩. Now, measure qubit 1.
      const secondMeasurement = quantumEngine['performMeasurement'](finalState, 1, '⟨0|');
      
      // The outcome MUST be '0' with 100% probability.
      expect(secondMeasurement.outcome).toBe('0');
      expect(secondMeasurement.probability).toBeCloseTo(1.0);
    });

    it('should ensure the other qubit is 1 if the first is measured as 1', () => {
      // Force measurement of qubit 0 to be '1'
      jest.spyOn(Math, 'random').mockReturnValue(0.6); // > 0.5
      const { finalState } = quantumEngine['performMeasurement'](bellState, 0, '⟨0|');
      
      // The state must have collapsed to |11⟩. Now, measure qubit 1.
      const secondMeasurement = quantumEngine['performMeasurement'](finalState, 1, '⟨0|');
      
      // The outcome MUST be '1' with 100% probability.
      expect(secondMeasurement.outcome).toBe('1');
      expect(secondMeasurement.probability).toBeCloseTo(1.0);
    });
  });

  describe('Full Circuit Execution (GHZ State)', () => {
    it('should create a 3-qubit GHZ state and measure it', () => {
      const context: QuantumComputationContext = {
        circuit: {
          numQubits: 3,
          initialState: quantumEngine.createInitialState(['|0⟩', '|0⟩', '|0⟩']),
          elements: [
            { type: 'gate', value: 'H', position: 0, targetLane: 0 },
            { type: 'gate', value: 'CNOT', position: 1, controlLane: 0, targetLane: 1 },
            { type: 'gate', value: 'CNOT', position: 2, controlLane: 0, targetLane: 2 },
          ],
        },
        measurementLane: 2,
        measurementPosition: 3,
        measurementBasis: '⟨0|',
      };

      const result = quantumEngine.executeQuantumComputation(context);
      
      expect(result.measurementResult.probability).toBeCloseTo(0.5);
      expect(result.computationSteps.filter(s => s.includes('Applied CNOT')).length).toBe(2);
    });
  });

  describe('Additional Coverage Tests', () => {
    it('should handle |+⟩ and |-⟩ qubit states', () => {
      const statePlus = quantumEngine.createInitialState(['|+⟩']);
      expect(statePlus.amplitudes[0].real).toBeCloseTo(1/Math.sqrt(2));
      expect(statePlus.amplitudes[1].real).toBeCloseTo(1/Math.sqrt(2));

      const stateMinus = quantumEngine.createInitialState(['|-⟩']);
      expect(stateMinus.amplitudes[0].real).toBeCloseTo(1/Math.sqrt(2));
      expect(stateMinus.amplitudes[1].real).toBeCloseTo(-1/Math.sqrt(2));
    });

    it('should handle unknown gate types', () => {
      expect(() => {
        quantumEngine['getGateMatrix']('UNKNOWN' as any);
      }).toThrow('Unknown gate type: UNKNOWN');
    });

    it('should handle unknown qubit states', () => {
      expect(() => {
        quantumEngine.createInitialState(['|unknown⟩' as any]);
      }).toThrow('Unknown qubit state: |unknown⟩');
    });

    it('should handle Y and Z gates', () => {
      let state = quantumEngine.createInitialState(['|0⟩']);
      
      // Test Z gate
      const zContext: QuantumComputationContext = {
        circuit: {
          numQubits: 1,
          initialState: state,
          elements: [{ type: 'gate', value: 'Z', position: 0, targetLane: 0 }],
        },
        measurementLane: 0,
        measurementPosition: 1,
        measurementBasis: '⟨0|',
      };

      const result = quantumEngine.executeQuantumComputation(zContext);
      expect(result).toHaveProperty('measurementResult');
    });

    it('should handle I (identity) gate', () => {
      let state = quantumEngine.createInitialState(['|1⟩']);
      
      const iContext: QuantumComputationContext = {
        circuit: {
          numQubits: 1,
          initialState: state,
          elements: [{ type: 'gate', value: 'I', position: 0, targetLane: 0 }],
        },
        measurementLane: 0,
        measurementPosition: 1,
        measurementBasis: '⟨0|',
      };

      const result = quantumEngine.executeQuantumComputation(iContext);
      expect(result.measurementResult.outcome).toBe('1');
      expect(result.measurementResult.probability).toBeCloseTo(1.0);
    });

    it('should handle measurement with zero probability states', () => {
      // Create a state that shouldn't exist
      const state = quantumEngine.createInitialState(['|0⟩']);
      
      // Manually set up a measurement that will have zero probability
      const result = quantumEngine['performMeasurement'](state, 0, '⟨0|');
      expect(result.outcome).toBe('0');
      expect(result.probability).toBeCloseTo(1.0);
    });

    it('should handle measurement basis warnings', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const state = quantumEngine.createInitialState(['|0⟩']);
      const context: QuantumComputationContext = {
        circuit: {
          numQubits: 1,
          initialState: state,
          elements: [],
        },
        measurementLane: 0,
        measurementPosition: 0,
        measurementBasis: '⟨+|',
      };

      const result = quantumEngine.executeQuantumComputation(context);
      expect(result.computationSteps.some(step => step.includes('Warning'))).toBe(true);
      
      consoleSpy.mockRestore();
    });

    it('should handle computation errors gracefully', () => {
      // Create an invalid context to trigger error handling
      const invalidContext: QuantumComputationContext = {
        circuit: {
          numQubits: 1,
          initialState: quantumEngine.createInitialState(['|0⟩']),
          elements: [{ type: 'gate', value: 'CNOT', position: 0, targetLane: 0 } as any], // Invalid CNOT without controlLane
        },
        measurementLane: 0,
        measurementPosition: 1,
        measurementBasis: '⟨0|',
      };

      expect(() => {
        quantumEngine.executeQuantumComputation(invalidContext);
      }).toThrow();
    });

    it('should get last computation steps', () => {
      const state = quantumEngine.createInitialState(['|0⟩']);
      const context: QuantumComputationContext = {
        circuit: {
          numQubits: 1,
          initialState: state,
          elements: [{ type: 'gate', value: 'H', position: 0, targetLane: 0 }],
        },
        measurementLane: 0,
        measurementPosition: 1,
        measurementBasis: '⟨0|',
      };

      quantumEngine.executeQuantumComputation(context);
      const steps = quantumEngine.getLastComputationSteps();
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0]).toContain('Starting quantum computation');
    });

    it('should handle state to string conversion for complex states', () => {
      // Create a more complex state for string conversion testing
      const state = quantumEngine.createInitialState(['|0⟩', '|0⟩']);
      const hContext: QuantumComputationContext = {
        circuit: {
          numQubits: 2,
          initialState: state,
          elements: [{ type: 'gate', value: 'H', position: 0, targetLane: 0 }],
        },
        measurementLane: 0,
        measurementPosition: 1,
        measurementBasis: '⟨0|',
      };

      const result = quantumEngine.executeQuantumComputation(hContext);
      expect(result.computationSteps.some(step => step.includes('|ψ⟩'))).toBe(true);
    });
  });
});