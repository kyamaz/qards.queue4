// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Quantum computation engine for qards4
 * Handles quantum state evolution and measurement calculations
 */

import { 
  QuantumState, 
  QuantumGate, 
  QuantumComputationContext,
  QuantumComputationResult,
  MeasurementResult,
  MeasurementBasis,
  QubitState,
  GateType
} from './types';

export class QuantumEngine {
  private computationSteps: string[] = [];

  /**
   * Convert card value to quantum state
   */
  public cardValueToQuantumState(value: QubitState): QuantumState {
    switch (value) {
      case '|0⟩':
        return { amplitude0: { real: 1, imaginary: 0 }, amplitude1: { real: 0, imaginary: 0 } };
      case '|1⟩':
        return { amplitude0: { real: 0, imaginary: 0 }, amplitude1: { real: 1, imaginary: 0 } };
      case '|+⟩':
        return { 
          amplitude0: { real: 1/Math.sqrt(2), imaginary: 0 }, 
          amplitude1: { real: 1/Math.sqrt(2), imaginary: 0 } 
        };
      case '|-⟩':
        return { 
          amplitude0: { real: 1/Math.sqrt(2), imaginary: 0 }, 
          amplitude1: { real: -1/Math.sqrt(2), imaginary: 0 } 
        };
      default:
        throw new Error(`Unknown qubit state: ${value}`);
    }
  }

  /**
   * Get quantum gate matrix
   */
  private getGateMatrix(gateType: GateType): QuantumGate {
    switch (gateType) {
      case 'I': // Identity
        return {
          matrix: {
            a: { real: 1, imaginary: 0 }, b: { real: 0, imaginary: 0 },
            c: { real: 0, imaginary: 0 }, d: { real: 1, imaginary: 0 }
          }
        };
      case 'X': // Pauli-X (NOT gate)
        return {
          matrix: {
            a: { real: 0, imaginary: 0 }, b: { real: 1, imaginary: 0 },
            c: { real: 1, imaginary: 0 }, d: { real: 0, imaginary: 0 }
          }
        };
      case 'Z': // Pauli-Z
        return {
          matrix: {
            a: { real: 1, imaginary: 0 }, b: { real: 0, imaginary: 0 },
            c: { real: 0, imaginary: 0 }, d: { real: -1, imaginary: 0 }
          }
        };
      case 'H': // Hadamard
        const inv_sqrt2 = 1/Math.sqrt(2);
        return {
          matrix: {
            a: { real: inv_sqrt2, imaginary: 0 }, b: { real: inv_sqrt2, imaginary: 0 },
            c: { real: inv_sqrt2, imaginary: 0 }, d: { real: -inv_sqrt2, imaginary: 0 }
          }
        };
      default:
        throw new Error(`Unknown gate type: ${gateType}`);
    }
  }

  /**
   * Apply quantum gate to state
   */
  private applyGate(state: QuantumState, gate: QuantumGate): QuantumState {
    const { a, b, c, d } = gate.matrix;
    const { amplitude0, amplitude1 } = state;

    // Matrix multiplication: [a b] [α]
    //                        [c d] [β]
    const newAmplitude0 = {
      real: a.real * amplitude0.real - a.imaginary * amplitude0.imaginary + 
            b.real * amplitude1.real - b.imaginary * amplitude1.imaginary,
      imaginary: a.real * amplitude0.imaginary + a.imaginary * amplitude0.real +
                 b.real * amplitude1.imaginary + b.imaginary * amplitude1.real
    };

    const newAmplitude1 = {
      real: c.real * amplitude0.real - c.imaginary * amplitude0.imaginary + 
            d.real * amplitude1.real - d.imaginary * amplitude1.imaginary,
      imaginary: c.real * amplitude0.imaginary + c.imaginary * amplitude0.real +
                 d.real * amplitude1.imaginary + d.imaginary * amplitude1.real
    };

    return { amplitude0: newAmplitude0, amplitude1: newAmplitude1 };
  }

  /**
   * Perform measurement in specified basis
   */
  private performMeasurement(state: QuantumState, basis: MeasurementBasis): MeasurementResult {
    let prob0: number, prob1: number;

    switch (basis) {
      case '⟨0|': // Computational basis measurement
      case '⟨1|':
        prob0 = state.amplitude0.real ** 2 + state.amplitude0.imaginary ** 2;
        prob1 = state.amplitude1.real ** 2 + state.amplitude1.imaginary ** 2;
        break;
      
      case '⟨+|': // Hadamard basis measurement
      case '⟨-|':
        // Transform to +/- basis
        const plusProb = 0.5 * ((state.amplitude0.real + state.amplitude1.real) ** 2 + 
                                (state.amplitude0.imaginary + state.amplitude1.imaginary) ** 2);
        const minusProb = 0.5 * ((state.amplitude0.real - state.amplitude1.real) ** 2 + 
                                 (state.amplitude0.imaginary - state.amplitude1.imaginary) ** 2);
        
        if (basis === '⟨+|') {
          prob0 = plusProb;
          prob1 = minusProb;
        } else {
          prob0 = minusProb;
          prob1 = plusProb;
        }
        break;
    }

    // Simulate measurement outcome (for now, deterministic based on higher probability)
    const outcome = prob0 >= prob1 ? '0' : '1';
    const probability = outcome === '0' ? prob0 : prob1;

    // Collapse state after measurement
    const finalState = outcome === '0' 
      ? { amplitude0: { real: 1, imaginary: 0 }, amplitude1: { real: 0, imaginary: 0 } }
      : { amplitude0: { real: 0, imaginary: 0 }, amplitude1: { real: 1, imaginary: 0 } };

    return { outcome, probability, finalState };
  }

  /**
   * Execute quantum computation for a measurement context
   */
  public executeQuantumComputation(context: QuantumComputationContext): QuantumComputationResult {
    const startTime = performance.now();
    this.computationSteps = [];

    try {
      this.computationSteps.push(`Starting quantum computation for lane ${context.measurementLane}`);
      
      // Get the lane being measured
      const lane = context.circuit.lanes[context.measurementLane];
      const initialState = context.circuit.initialStates[context.measurementLane];
      
      this.computationSteps.push(`Initial state: |ψ⟩ = ${this.stateToString(initialState)}`);

      // Evolve state through gates up to measurement position
      let currentState = initialState;
      
      for (let i = 0; i < context.measurementPosition; i++) {
        const element = lane[i];
        if (element && element.type === 'gate') {
          const gate = this.getGateMatrix(element.value as GateType);
          currentState = this.applyGate(currentState, gate);
          this.computationSteps.push(`Applied ${element.value} gate: |ψ⟩ = ${this.stateToString(currentState)}`);
        }
      }

      // Perform measurement
      this.computationSteps.push(`Measuring in ${context.measurementBasis} basis`);
      const measurementResult = this.performMeasurement(currentState, context.measurementBasis);
      
      this.computationSteps.push(`Measurement outcome: ${measurementResult.outcome} (probability: ${measurementResult.probability.toFixed(3)})`);

      // Calculate game score based on compatibility (existing logic)
      const gameScore = this.calculateCompatibilityScore(currentState, context.measurementBasis);
      
      const executionTime = performance.now() - startTime;

      return {
        measurementResult,
        gameScore,
        computationSteps: [...this.computationSteps],
        executionTime
      };

    } catch (error) {
      this.computationSteps.push(`Error during computation: ${error}`);
      throw error;
    }
  }

  /**
   * Calculate compatibility score for game mechanics
   */
  private calculateCompatibilityScore(state: QuantumState, basis: MeasurementBasis): number {
    const measurementResult = this.performMeasurement(state, basis);
    
    // New scoring system: outcome '1' = +5 points, outcome '0' = +3 points
    return measurementResult.outcome === '1' ? 5 : 3;
  }

  /**
   * Convert quantum state to readable string
   */
  private stateToString(state: QuantumState): string {
    const { amplitude0, amplitude1 } = state;
    
    const a0_mag = Math.sqrt(amplitude0.real ** 2 + amplitude0.imaginary ** 2);
    const a1_mag = Math.sqrt(amplitude1.real ** 2 + amplitude1.imaginary ** 2);
    
    if (a0_mag < 1e-10) return '|1⟩';
    if (a1_mag < 1e-10) return '|0⟩';
    
    return `${a0_mag.toFixed(3)}|0⟩ + ${a1_mag.toFixed(3)}|1⟩`;
  }

  /**
   * Get computation steps for debugging
   */
  public getLastComputationSteps(): string[] {
    return [...this.computationSteps];
  }
}