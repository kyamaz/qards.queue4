// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Integration layer between quantum computation and game logic
 */

import { QuantumEngine } from './quantumEngine';
import { QuantumComputationContext, QuantumCircuit, QuantumCircuitElement, QubitState, MeasurementBasis } from './types';
import { GameState, Card, CardType } from '../game/types';

export class QuantumGameIntegration {
  private quantumEngine: QuantumEngine;

  constructor() {
    this.quantumEngine = new QuantumEngine();
  }

  /**
   * Convert game board to quantum circuit
   */
  private gameboardToQuantumCircuit(gameState: GameState): QuantumCircuit {
    const lanes: QuantumCircuitElement[][] = [];
    const initialStates = [];

    for (let laneIndex = 0; laneIndex < gameState.board.lane.length; laneIndex++) {
      const lane = gameState.board.lane[laneIndex];
      const circuitLane: QuantumCircuitElement[] = [];

      // Find initial state for this lane (first card should be initial qubit)
      let hasInitialState = false;
      
      for (let position = 0; position < lane.length; position++) {
        const card = lane[position];
        if (!card) continue;

        const element: QuantumCircuitElement = {
          type: this.cardTypeToCircuitType(card.type),
          value: card.value,
          position,
          laneIndex
        };

        circuitLane.push(element);

        // Set initial state if this is an initial qubit
        if (card.type === CardType.INITIAL_QUBIT && !hasInitialState) {
          const quantumState = this.quantumEngine['cardValueToQuantumState'](card.value as QubitState);
          initialStates[laneIndex] = quantumState;
          hasInitialState = true;
        }
      }

      // Default to |0⟩ if no initial state found
      if (!hasInitialState) {
        initialStates[laneIndex] = { 
          amplitude0: { real: 1, imaginary: 0 }, 
          amplitude1: { real: 0, imaginary: 0 } 
        };
      }

      lanes.push(circuitLane);
    }

    return { lanes, initialStates };
  }

  /**
   * Convert card type to circuit element type
   */
  private cardTypeToCircuitType(cardType: CardType): 'qubit' | 'gate' | 'measurement' {
    switch (cardType) {
      case CardType.QUBIT:
      case CardType.INITIAL_QUBIT:
        return 'qubit';
      case CardType.GATE:
      case CardType.UNITARY:
      case CardType.CONTROL:
        return 'gate';
      case CardType.MEASUREMENT:
        return 'measurement';
      default:
        return 'gate';
    }
  }

  /**
   * Execute quantum computation when measurement card is played
   */
  public async executeMeasurementComputation(
    gameState: GameState,
    measurementCard: Card,
    laneIndex: number,
    position: number
  ) {
    try {
      // Convert game board to quantum circuit
      const circuit = this.gameboardToQuantumCircuit(gameState);

      // Create computation context
      const context: QuantumComputationContext = {
        circuit,
        measurementLane: laneIndex,
        measurementPosition: position,
        measurementBasis: measurementCard.value as MeasurementBasis
      };

      // Execute quantum computation
      const result = this.quantumEngine.executeQuantumComputation(context);

      console.log('🔬 Quantum Computation Results:');
      console.log(`Lane ${laneIndex}, Position ${position}`);
      console.log(`Measurement: ${measurementCard.value}`);
      console.log(`Outcome: ${result.measurementResult.outcome}`);
      console.log(`Probability: ${result.measurementResult.probability.toFixed(3)}`);
      console.log(`Game Score: ${result.gameScore}`);
      console.log(`Execution Time: ${result.executionTime.toFixed(2)}ms`);
      console.log('Computation Steps:');
      result.computationSteps.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step}`);
      });

      return result;

    } catch (error) {
      console.error('❌ Quantum computation failed:', error);
      
      // Fallback to existing game logic
      console.log('🔄 Falling back to classical game logic');
      return null;
    }
  }

  /**
   * Get quantum computation debug information
   */
  public getLastComputationSteps(): string[] {
    return this.quantumEngine.getLastComputationSteps();
  }

  /**
   * Check if quantum computation is available for current game state
   */
  public isQuantumComputationAvailable(gameState: GameState, laneIndex: number): boolean {
    try {
      const lane = gameState.board.lane[laneIndex];
      if (!lane || lane.length === 0) return false;

      // Check if lane has proper quantum elements
      const hasQubit = lane.some(card => 
        card && (card.type === CardType.QUBIT || card.type === CardType.INITIAL_QUBIT)
      );
      
      return hasQubit;
    } catch (error) {
      console.warn('Failed to check quantum computation availability:', error);
      return false;
    }
  }
}