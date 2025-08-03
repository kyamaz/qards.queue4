// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Quantum computation module for qards.queue4
 * Exports quantum computation engine and game integration
 */

export { QuantumEngine } from './quantumEngine';
export { QuantumGameIntegration } from './gameIntegration';

export type {
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
} from './types';
