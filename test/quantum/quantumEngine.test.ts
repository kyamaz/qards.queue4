// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { QuantumEngine } from '../../src/quantum/quantumEngine';
import { QuantumComputationContext, QubitState, MeasurementBasis, QuantumState, QuantumCircuitElement } from '../../src/quantum/types';

describe('QuantumEngine (Multi-Qubit)', () => {
  let quantumEngine: QuantumEngine;

  beforeEach(() => {
    quantumEngine = new QuantumEngine();
  });

  describe('State Initialization', () => {
    it('should create a |00⟩ initial state correctly', () => {
      const state = quantumEngine.createInitialState(['|0⟩', '|0⟩']);
      expect(state.numQubits).toBe(2);
      expect(state.amplitudes.length).toBe(4);
      expect(state.amplitudes[0].real).toBe(1); // |00⟩
      expect(state.amplitudes[1].real).toBe(0);
      expect(state.amplitudes[2].real).toBe(0);
      expect(state.amplitudes[3].real).toBe(0);
    });

    it('should create a |10⟩ initial state correctly', () => {
      const state = quantumEngine.createInitialState(['|1⟩', '|0⟩']);
      expect(state.numQubits).toBe(2);
      expect(state.amplitudes.length).toBe(4);
      expect(state.amplitudes[0].real).toBe(0);
      expect(state.amplitudes[1].real).toBe(0);
      expect(state.amplitudes[2].real).toBe(1); // |10⟩
      expect(state.amplitudes[3].real).toBe(0);
    });
  });

  describe('Gate Application', () => {
    it('should apply a single-qubit X gate to the target qubit', () => {
      // Apply X to the second qubit of |00⟩ -> should become |01⟩
      let state = quantumEngine.createInitialState(['|0⟩', '|0⟩']);
      const xGateElement: QuantumCircuitElement = { type: 'gate', value: 'X', position: 0, targetLane: 1 };
      
      // Private method access for testing
      state = quantumEngine['applyGate'](state, xGateElement);

      expect(state.amplitudes[0].real).toBeCloseTo(0); // |00⟩
      expect(state.amplitudes[1].real).toBeCloseTo(1); // |01⟩
      expect(state.amplitudes[2].real).toBeCloseTo(0); // |10⟩
      expect(state.amplitudes[3].real).toBeCloseTo(0); // |11⟩
    });

    it('should apply CNOT gate correctly when control is 0', () => {
      // Apply CNOT to |01⟩ -> should remain |01⟩
      let state = quantumEngine.createInitialState(['|0⟩', '|1⟩']);
      const cnotElement: QuantumCircuitElement = { type: 'gate', value: 'CNOT', position: 0, controlLane: 0, targetLane: 1 };
      
      state = quantumEngine['applyGate'](state, cnotElement);

      expect(state.amplitudes[1].real).toBeCloseTo(1); // |01⟩
    });

    it('should apply CNOT gate correctly when control is 1', () => {
      // Apply CNOT to |10⟩ -> should become |11⟩
      let state = quantumEngine.createInitialState(['|1⟩', '|0⟩']);
      const cnotElement: QuantumCircuitElement = { type: 'gate', value: 'CNOT', position: 0, controlLane: 0, targetLane: 1 };
      
      state = quantumEngine['applyGate'](state, cnotElement);

      expect(state.amplitudes[2].real).toBeCloseTo(0); // |10⟩
      expect(state.amplitudes[3].real).toBeCloseTo(1); // |11⟩
    });
  });

  describe('Measurement', () => {
    it('should correctly calculate measurement probability for a specific qubit', () => {
      // State is |+1⟩ = (1/√2)|01⟩ + (1/√2)|11⟩
      const state = quantumEngine.createInitialState(['|+⟩', '|1⟩']);
      
      // Probability of measuring the first qubit (qubit 0) as '0' should be 0.5
      const { probability } = quantumEngine['performMeasurement'](state, 0, '⟨0|');
      expect(probability).toBeCloseTo(0.5);
    });

    it('should collapse the state correctly after measurement', () => {
      // Start with Bell state: (1/√2)(|00⟩ + |11⟩)
      let state = quantumEngine.createInitialState(['|0⟩', '|0⟩']);
      state = quantumEngine['applyGate'](state, { type: 'gate', value: 'H', position: 0, targetLane: 0 });
      state = quantumEngine['applyGate'](state, { type: 'gate', value: 'CNOT', position: 1, controlLane: 0, targetLane: 1 });

      // Mock random to force measuring qubit 0 as '1'
      jest.spyOn(Math, 'random').mockReturnValue(0.6); // > 0.5
      
      const { finalState } = quantumEngine['performMeasurement'](state, 0, '⟨0|');
      
      // After measuring qubit 0 as '1', the state must collapse to |11⟩
      expect(finalState.amplitudes[0].real).toBeCloseTo(0);
      expect(finalState.amplitudes[1].real).toBeCloseTo(0);
      expect(finalState.amplitudes[2].real).toBeCloseTo(0);
      expect(finalState.amplitudes[3].real).toBeCloseTo(1); // |11⟩
    });
  });

  describe('Full Circuit Execution (Entanglement)', () => {
    it('should create an entangled Bell state and measure it', () => {
      const context: QuantumComputationContext = {
        circuit: {
          numQubits: 2,
          initialState: quantumEngine.createInitialState(['|0⟩', '|0⟩']),
          elements: [
            { type: 'gate', value: 'H', position: 0, targetLane: 0 },
            { type: 'gate', value: 'CNOT', position: 1, controlLane: 0, targetLane: 1 },
          ],
        },
        measurementLane: 0, // Measure the first qubit
        measurementPosition: 2,
        measurementBasis: '⟨0|',
      };

      const result = quantumEngine.executeQuantumComputation(context);
      
      // In a Bell state, measuring one qubit gives a 50/50 random outcome
      expect(result.measurementResult.probability).toBeCloseTo(0.5);
      expect(result.computationSteps.some(step => step.includes('Applied CNOT'))).toBe(true);
    });
  });
});