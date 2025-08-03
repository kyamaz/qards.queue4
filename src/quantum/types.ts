// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Quantum computation types and interfaces for qards-queue4
 */

export type QubitState = '|0⟩' | '|1⟩' | '|+⟩' | '|-⟩';
export type MeasurementBasis = '⟨0|' | '⟨1|' | '⟨+|' | '⟨-|';
export type GateType = 'I' | 'X' | 'Z' | 'H' | 'CNOT';

/**
 * Represents a complex number
 */
export interface Complex {
  real: number;
  imaginary: number;
}

/**
 * Quantum state representation for up to N qubits.
 * The amplitudes array stores the 2^N complex amplitudes for the computational basis states.
 * For 2 qubits, the order is |00⟩, |01⟩, |10⟩, |11⟩.
 */
export interface QuantumState {
  amplitudes: Complex[];
  numQubits: number;
}

/**
 * Quantum gate matrix representation (2x2 or 4x4 etc. complex matrix)
 */
export interface QuantumGate {
  matrix: Complex[][];
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
  type: 'gate' | 'measurement';
  value: GateType | MeasurementBasis;
  position: number;
  // For single-qubit gates, targetLane is the laneIndex
  // For two-qubit gates (CNOT), specifies control and target lanes
  controlLane?: number; 
  targetLane: number;
}

/**
 * Complete quantum circuit representation
 */
export interface QuantumCircuit {
  elements: QuantumCircuitElement[];
  initialState: QuantumState;
  numQubits: number;
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
