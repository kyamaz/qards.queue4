// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { 
  QuantumEngine, 
  QuantumGameIntegration,
  QuantumState,
  QuantumGate,
  QuantumCircuit,
  QuantumComputationContext,
  QuantumComputationResult,
  MeasurementResult,
  QubitState,
  MeasurementBasis,
  GateType,
  QuantumCircuitElement
} from '../../src/quantum';

describe('Quantum Module Exports', () => {
  describe('Class Exports', () => {
    it('should export QuantumEngine class', () => {
      expect(QuantumEngine).toBeDefined();
      expect(typeof QuantumEngine).toBe('function');
      
      const engine = new QuantumEngine();
      expect(engine).toBeInstanceOf(QuantumEngine);
    });

    it('should export QuantumGameIntegration class', () => {
      expect(QuantumGameIntegration).toBeDefined();
      expect(typeof QuantumGameIntegration).toBe('function');
      
      const integration = new QuantumGameIntegration();
      expect(integration).toBeInstanceOf(QuantumGameIntegration);
    });
  });

  describe('Type Exports', () => {
    it('should have all required type exports available', () => {
      // Test that we can use the exported types in TypeScript
      const qubitState: QubitState = '|0⟩';
      const gateType: GateType = 'H';
      const measurementBasis: MeasurementBasis = '⟨0|';
      
      expect(qubitState).toBe('|0⟩');
      expect(gateType).toBe('H');
      expect(measurementBasis).toBe('⟨0|');
    });

    it('should allow creation of quantum circuit elements', () => {
      const element: QuantumCircuitElement = {
        type: 'gate',
        value: 'H',
        position: 0,
        targetLane: 0
      };
      
      expect(element.type).toBe('gate');
      expect(element.value).toBe('H');
    });

    it('should allow creation of quantum states', () => {
      const engine = new QuantumEngine();
      const state: QuantumState = engine.createInitialState(['|0⟩']);
      
      expect(state).toHaveProperty('amplitudes');
      expect(state).toHaveProperty('numQubits');
    });
  });

  describe('Integration Test', () => {
    it('should work together - QuantumEngine and QuantumGameIntegration', () => {
      const engine = new QuantumEngine();
      const integration = new QuantumGameIntegration();
      
      // Both should be instances of their respective classes
      expect(engine).toBeInstanceOf(QuantumEngine);
      expect(integration).toBeInstanceOf(QuantumGameIntegration);
      
      // Integration should be able to check quantum computation availability
      expect(integration.isQuantumComputationAvailable()).toBe(true);
    });

    it('should create quantum states using exported QuantumEngine', () => {
      const engine = new QuantumEngine();
      const state = engine.createInitialState(['|0⟩', '|1⟩']);
      
      expect(state.numQubits).toBe(2);
      expect(state.amplitudes.length).toBe(4);
    });
  });

  describe('Module Structure', () => {
    it('should export all expected members', () => {
      const quantumModule = require('../../src/quantum');
      
      // Check class exports
      expect(quantumModule.QuantumEngine).toBeDefined();
      expect(quantumModule.QuantumGameIntegration).toBeDefined();
      
      // Ensure exports are functions (constructors)
      expect(typeof quantumModule.QuantumEngine).toBe('function');
      expect(typeof quantumModule.QuantumGameIntegration).toBe('function');
    });
  });
});