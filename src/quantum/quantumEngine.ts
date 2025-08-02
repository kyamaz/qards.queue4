// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Quantum computation engine for qards4
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

  /**
   * Creates the initial state vector from individual qubit states.
   * @param initialQubits An array of initial states for each qubit.
   */
  public createInitialState(initialQubits: QubitState[]): QuantumState {
    const numQubits = initialQubits.length;
    let amplitudes = [this.C1]; // Start with a |⟩ state for tensor product

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

  /**
   * Get quantum gate matrix
   */
  private getGateMatrix(gateType: GateType): QuantumGate {
    switch (gateType) {
      case 'I':
        return { matrix: [[this.C1, this.C0], [this.C0, this.C1]] };
      case 'X':
        return { matrix: [[this.C0, this.C1], [this.C1, this.C0]] };
      case 'Z':
        return { matrix: [[this.C1, this.C0], [this.C0, complex(-1)]] };
      case 'H':
        return { matrix: [[this.INV_SQRT2, this.INV_SQRT2], [this.INV_SQRT2, complex(-1 / Math.sqrt(2))]] };
      case 'CNOT':
        return {
          matrix: [
            [this.C1, this.C0, this.C0, this.C0],
            [this.C0, this.C1, this.C0, this.C0],
            [this.C0, this.C0, this.C0, this.C1],
            [this.C0, this.C0, this.C1, this.C0],
          ],
        };
      default:
        throw new Error(`Unknown gate type: ${gateType}`);
    }
  }

  /**
   * Apply a quantum gate to the system's state vector.
   */
  private applyGate(state: QuantumState, element: QuantumCircuitElement): QuantumState {
    const { numQubits } = state;
    const gate = this.getGateMatrix(element.value as GateType);
    let operator: Complex[][];

    if (element.controlLane !== undefined) { // Two-qubit gate
      operator = this.createTwoQubitGateOperator(gate, element.controlLane, element.targetLane, numQubits);
    } else { // Single-qubit gate
      operator = this.createSingleQubitGateOperator(gate, element.targetLane, numQubits);
    }
    
    const newAmplitudes = this.applyMatrix(operator, state.amplitudes);
    return { ...state, amplitudes: newAmplitudes };
  }

  private applyMatrix(matrix: Complex[][], vector: Complex[]): Complex[] {
    const newVector: Complex[] = Array(vector.length).fill(this.C0);
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < vector.length; j++) {
        newVector[i] = add(newVector[i], mul(matrix[i][j], vector[j]));
      }
    }
    return newVector;
  }

  private createSingleQubitGateOperator(gate: QuantumGate, target: number, numQubits: number): Complex[][] {
    let operator = gate.matrix;
    const I = this.getGateMatrix('I').matrix;

    for (let i = numQubits - 1; i >= 0; i--) {
      if (i === target) continue;
      const currentGate = (i < target) ? operator : I;
      const nextGate = (i < target) ? I : operator;
      operator = this.tensorProductMatrix(currentGate, nextGate);
    }
    return operator;
  }
  
  private createTwoQubitGateOperator(gate: QuantumGate, control: number, target: number, numQubits: number): Complex[][] {
    // This is a simplified placeholder. A full implementation requires handling permutations
    // for arbitrary control/target pairs, which is significantly more complex.
    // This version assumes control=0, target=1 for a 2-qubit system.
    if (numQubits !== 2 || control !== 0 || target !== 1) {
        this.computationSteps.push(`Warning: CNOT is only implemented for control=0, target=1 on a 2-qubit system. Ignoring gate.`);
        return this.getGateMatrix('I').matrix; // Return identity for non-supported cases
    }
    return gate.matrix;
  }

  private tensorProductMatrix(A: Complex[][], B: Complex[][]): Complex[][] {
    const result: Complex[][] = [];
    for (let i = 0; i < A.length * B.length; i++) {
      result[i] = [];
    }

    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A[i].length; j++) {
        for (let k = 0; k < B.length; k++) {
          for (let l = 0; l < B[k].length; l++) {
            result[i * B.length + k][j * B[k].length + l] = mul(A[i][j], B[k][l]);
          }
        }
      }
    }
    return result;
  }

  /**
   * Perform measurement on a specific qubit in a specified basis.
   */
  private performMeasurement(state: QuantumState, targetQubit: number, basis: MeasurementBasis): MeasurementResult {
    // For now, we only support measurement in the Z-basis ('⟨0|' or '⟨1|').
    // A full implementation would apply a basis change unitary for other bases.
    if (basis === '⟨+|' || basis === '⟨-|') {
        this.computationSteps.push(`Warning: Measurement in ${basis} basis is not fully implemented. Defaulting to Z-basis.`);
    }

    const { amplitudes, numQubits } = state;
    const numStates = 1 << numQubits;
    let prob0 = 0;

    // Calculate the probability of measuring the targetQubit as '0'
    for (let i = 0; i < numStates; i++) {
      // Check if the targetQubit is 0 in the current basis state `i`
      if (((i >> (numQubits - 1 - targetQubit)) & 1) === 0) {
        prob0 += amplitudes[i].real ** 2 + amplitudes[i].imaginary ** 2;
      }
    }
    const prob1 = 1 - prob0;

    const random = Math.random();
    const outcome = random < prob0 ? '0' : '1';
    const probability = outcome === '0' ? prob0 : prob1;

    // Collapse the state
    const newAmplitudes = Array(numStates).fill(this.C0);
    const norm = Math.sqrt(probability);
    for (let i = 0; i < numStates; i++) {
        if (((i >> (numQubits - 1 - targetQubit)) & 1) === (outcome === '0' ? 0 : 1)) {
            newAmplitudes[i] = complex(amplitudes[i].real / norm, amplitudes[i].imaginary / norm);
        }
    }

    const finalState: QuantumState = { amplitudes: newAmplitudes, numQubits };
    return { outcome, probability, finalState };
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
          this.computationSteps.push(`Applied ${element.value} on target ${element.targetLane}: |ψ⟩ = ${this.stateToString(currentState)}`);
        }
      }

      this.computationSteps.push(`Measuring qubit ${context.measurementLane} in ${context.measurementBasis} basis`);
      const measurementResult = this.performMeasurement(currentState, context.measurementLane, context.measurementBasis);
      
      this.computationSteps.push(`Measurement outcome: ${measurementResult.outcome} (probability: ${measurementResult.probability.toFixed(3)})`);

      const gameScore = measurementResult.outcome === '1' ? 5 : 3;
      const executionTime = performance.now() - startTime;

      return {
        measurementResult,
        gameScore,
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
