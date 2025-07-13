/**
 * Quantum computation types and interfaces for qards4
 */

export type QubitState = '|0⟩' | '|1⟩' | '|+⟩' | '|-⟩';
export type MeasurementBasis = '⟨0|' | '⟨1|' | '⟨+|' | '⟨-|';
export type GateType = 'I' | 'X' | 'Z' | 'H';

/**
 * Quantum state representation
 */
export interface QuantumState {
  amplitude0: { real: number; imaginary: number };
  amplitude1: { real: number; imaginary: number };
}

/**
 * Quantum gate matrix representation (2x2 complex matrix)
 */
export interface QuantumGate {
  matrix: {
    a: { real: number; imaginary: number }; // top-left
    b: { real: number; imaginary: number }; // top-right
    c: { real: number; imaginary: number }; // bottom-left
    d: { real: number; imaginary: number }; // bottom-right
  };
}

/**
 * Measurement result with probability
 */
export interface MeasurementResult {
  outcome: '0' | '1';
  probability: number;
  finalState: QuantumState;
}

/**
 * Quantum circuit element for computation
 */
export interface QuantumCircuitElement {
  type: 'qubit' | 'gate' | 'measurement';
  value: string;
  position: number;
  laneIndex: number;
}

/**
 * Complete quantum circuit representation
 */
export interface QuantumCircuit {
  lanes: QuantumCircuitElement[][];
  initialStates: QuantumState[];
}

/**
 * Quantum computation context for a single measurement
 */
export interface QuantumComputationContext {
  circuit: QuantumCircuit;
  measurementLane: number;
  measurementPosition: number;
  measurementBasis: MeasurementBasis;
}

/**
 * Quantum computation result
 */
export interface QuantumComputationResult {
  measurementResult: MeasurementResult;
  gameScore: number;
  computationSteps: string[];
  executionTime: number;
}