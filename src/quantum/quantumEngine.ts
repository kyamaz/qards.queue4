// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Quantum computation engine for qards.queue4
 * Handles quantum state evolution and measurement calculations for a multi-qubit system.
 */

import {
  QuantumState,
  QuantumGate,
  QuantumComputationContext,
  QuantumComputationResult,
  MeasurementResult,
  MeasurementBasis,
  QubitState,
  GateType,
  Complex,
  QuantumCircuitElement,
} from './types';

// Helper functions for complex number arithmetic
const complex = (real: number, imag = 0): Complex => ({ real, imaginary: imag });
const add = (a: Complex, b: Complex): Complex => ({ real: a.real + b.real, imaginary: a.imaginary + b.imaginary });
const mul = (a: Complex, b: Complex): Complex => ({
  real: a.real * b.real - a.imaginary * b.imaginary,
  imaginary: a.real * b.imaginary + a.imaginary * b.real,
});

export class QuantumEngine {
  private computationSteps: string[] = [];

  private C0 = complex(0);
  private C1 = complex(1);
  private INV_SQRT2 = complex(1 / Math.sqrt(2));

  public createInitialState(initialQubits: QubitState[]): QuantumState {
    const numQubits = initialQubits.length;
    let amplitudes = [this.C1];

    for (const qubitState of initialQubits) {
      const qubitAmplitudes = this.qubitStateToAmplitudes(qubitState);
      amplitudes = this.tensorProduct(amplitudes, qubitAmplitudes);
    }
    
    return { amplitudes, numQubits };
  }

  private qubitStateToAmplitudes(state: QubitState): Complex[] {
    switch (state) {
      case '|0⟩': return [this.C1, this.C0];
      case '|1⟩': return [this.C0, this.C1];
      case '|+⟩': return [this.INV_SQRT2, this.INV_SQRT2];
      case '|-⟩': return [this.INV_SQRT2, complex(-1 / Math.sqrt(2))];
      default: throw new Error(`Unknown qubit state: ${state}`);
    }
  }

  private tensorProduct(a: Complex[], b: Complex[]): Complex[] {
    const result: Complex[] = [];
    for (const valA of a) {
      for (const valB of b) {
        result.push(mul(valA, valB));
      }
    }
    return result;
  }

  private getGateMatrix(gateType: GateType): QuantumGate {
    switch (gateType) {
      case 'I': return { matrix: [[this.C1, this.C0], [this.C0, this.C1]] };
      case 'X': return { matrix: [[this.C0, this.C1], [this.C1, this.C0]] };
      case 'Z': return { matrix: [[this.C1, this.C0], [this.C0, complex(-1)]] };
      case 'H': return { matrix: [[this.INV_SQRT2, this.INV_SQRT2], [this.INV_SQRT2, complex(-1 / Math.sqrt(2))]] };
      case 'CNOT': return { matrix: [] }; // Not used directly in the new approach
      default: throw new Error(`Unknown gate type: ${gateType}`);
    }
  }

  private applyGate(state: QuantumState, element: QuantumCircuitElement): QuantumState {
    const { amplitudes, numQubits } = state;
    const numStates = 1 << numQubits;
    const newAmplitudes: Complex[] = Array(numStates).fill(this.C0);

    if (element.value === 'CNOT') {
      const { controlLane, targetLane } = element;
      if (controlLane === undefined || targetLane === undefined) {
        throw new Error('CNOT gate requires control and target lanes.');
      }
      const controlBit = 1 << (numQubits - 1 - controlLane);
      const targetBit = 1 << (numQubits - 1 - targetLane);

      for (let i = 0; i < numStates; i++) {
        if ((i & controlBit) !== 0) { // If control bit is 1, flip target bit
          const flippedState = i ^ targetBit;
          newAmplitudes[flippedState] = amplitudes[i];
        } else { // If control bit is 0, keep state unchanged
          newAmplitudes[i] = amplitudes[i];
        }
      }
    } else { // Single-qubit gate
      const { targetLane } = element;
      const gate = this.getGateMatrix(element.value as GateType);
      const [[a, b], [c, d]] = gate.matrix;
      const targetBit = 1 << (numQubits - 1 - targetLane);

      for (let i = 0; i < numStates; i++) {
        const isTargetOne = (i & targetBit) !== 0;
        const basisStateWithoutTarget = i & ~targetBit;
        
        if (!isTargetOne) { // Target is |0⟩
          const state0 = basisStateWithoutTarget;
          const state1 = basisStateWithoutTarget | targetBit;
          newAmplitudes[state0] = add(newAmplitudes[state0], mul(a, amplitudes[i]));
          newAmplitudes[state1] = add(newAmplitudes[state1], mul(c, amplitudes[i]));
        } else { // Target is |1⟩
          const state0 = basisStateWithoutTarget;
          const state1 = basisStateWithoutTarget | targetBit;
          newAmplitudes[state0] = add(newAmplitudes[state0], mul(b, amplitudes[i]));
          newAmplitudes[state1] = add(newAmplitudes[state1], mul(d, amplitudes[i]));
        }
      }
    }
    return { ...state, amplitudes: newAmplitudes };
  }

  private performMeasurement(state: QuantumState, targetQubit: number, basis: MeasurementBasis): MeasurementResult {
    if (basis === '⟨+|' || basis === '⟨-|') {
      this.computationSteps.push(`Warning: Measurement in ${basis} basis is not fully implemented. Defaulting to Z-basis.`);
    }

    const { amplitudes, numQubits } = state;
    const numStates = 1 << numQubits;
    let prob0 = 0;
    const targetBit = 1 << (numQubits - 1 - targetQubit);

    for (let i = 0; i < numStates; i++) {
      if ((i & targetBit) === 0) {
        prob0 += amplitudes[i].real ** 2 + amplitudes[i].imaginary ** 2;
      }
    }

    const random = Math.random();
    const outcome = random < prob0 ? '0' : '1';
    const probability = outcome === '0' ? prob0 : 1 - prob0;

    const newAmplitudes = Array(numStates).fill(this.C0);
    const norm = Math.sqrt(probability);
    if (norm === 0) { // Should not happen in a valid state
        return { outcome, probability, finalState: { ...state, amplitudes: newAmplitudes } };
    }

    for (let i = 0; i < numStates; i++) {
      const isTargetOne = (i & targetBit) !== 0;
      if ((outcome === '0' && !isTargetOne) || (outcome === '1' && isTargetOne)) {
        newAmplitudes[i] = complex(amplitudes[i].real / norm, amplitudes[i].imaginary / norm);
      }
    }

    return { outcome, probability, finalState: { ...state, amplitudes: newAmplitudes } };
  }

  public executeQuantumComputation(context: QuantumComputationContext): QuantumComputationResult {
    const startTime = performance.now();
    this.computationSteps = [];

    try {
      this.computationSteps.push(`Starting quantum computation for ${context.circuit.numQubits} qubits.`);
      let currentState = context.circuit.initialState;
      this.computationSteps.push(`Initial state: |ψ⟩ = ${this.stateToString(currentState)}`);

      const elementsToMeasure = context.circuit.elements.filter(e => e.position < context.measurementPosition);

      for (const element of elementsToMeasure) {
        if (element.type === 'gate') {
          currentState = this.applyGate(currentState, element);
          const target = element.controlLane !== undefined ? `${element.controlLane},${element.targetLane}` : `${element.targetLane}`;
          this.computationSteps.push(`Applied ${element.value} on qubit(s) ${target}: |ψ⟩ = ${this.stateToString(currentState)}`);
        }
      }

      this.computationSteps.push(`Measuring qubit ${context.measurementLane} in ${context.measurementBasis} basis`);
      const measurementResult = this.performMeasurement(currentState, context.measurementLane, context.measurementBasis);
      
      this.computationSteps.push(`Measurement outcome: ${measurementResult.outcome} (probability: ${measurementResult.probability.toFixed(3)})`);

      const executionTime = performance.now() - startTime;

      return {
        measurementResult,
        computationSteps: [...this.computationSteps],
        executionTime
      };

    } catch (error) {
      const err = error as Error;
      this.computationSteps.push(`Error during computation: ${err.message}`);
      throw err;
    }
  }

  private stateToString(state: QuantumState): string {
    return state.amplitudes.map((amp, i) => {
      const mag = Math.sqrt(amp.real ** 2 + amp.imaginary ** 2);
      if (mag < 1e-9) return null;
      const basis = i.toString(2).padStart(state.numQubits, '0');
      return `${mag.toFixed(2)}|${basis}⟩`;
    }).filter(Boolean).join(' + ');
  }

  public getLastComputationSteps(): string[] {
    return [...this.computationSteps];
  }
}
