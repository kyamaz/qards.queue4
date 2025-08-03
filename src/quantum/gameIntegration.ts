// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Integration layer between quantum computation and game logic
 */

import { QuantumEngine } from './quantumEngine';
import { 
  QuantumComputationContext, 
  QuantumCircuit, 
  QuantumCircuitElement, 
  QubitState, 
  MeasurementBasis,
  GateType
} from './types';
import { GameState, Card, CardType } from '../game/types';

export class QuantumGameIntegration {
  private quantumEngine: QuantumEngine;

  constructor() {
    this.quantumEngine = new QuantumEngine();
  }

  /**
   * Convert game board to a quantum circuit representation.
   */
  private gameboardToQuantumCircuit(gameState: GameState): QuantumCircuit {
    const numQubits = gameState.board.lane.length;
    const initialQubitStates: QubitState[] = [];

    // Determine initial state for each lane (qubit)
    for (let i = 0; i < numQubits; i++) {
      const firstCard = gameState.board.lane[i]?.find(card => card?.type === CardType.INITIAL_QUBIT);
      initialQubitStates.push(firstCard ? (firstCard.value as QubitState) : '|0⟩');
    }

    const initialState = this.quantumEngine.createInitialState(initialQubitStates);
    const elements: QuantumCircuitElement[] = [];

    // Iterate through all positions on the board to collect circuit elements
    const maxPosition = Math.max(...gameState.board.lane.map(l => l.length));
    for (let pos = 0; pos < maxPosition; pos++) {
      for (let laneIdx = 0; laneIdx < numQubits; laneIdx++) {
        const card = gameState.board.lane[laneIdx]?.[pos];
        if (!card) continue;

        let element: QuantumCircuitElement | null = null;

        switch (card.type) {
          case CardType.GATE:
          case CardType.UNITARY: // Treat Unitary as a standard gate for now
            element = {
              type: 'gate',
              value: card.value as GateType,
              position: pos,
              targetLane: laneIdx,
            };
            break;
          
          case CardType.CONTROL:
            // CNOT gate links control and target lanes
            if (card.controlLink !== undefined) {
              element = {
                type: 'gate',
                value: 'CNOT',
                position: pos,
                controlLane: laneIdx,
                targetLane: card.controlLink.targetLaneIndex,
              };
            }
            break;

          case CardType.MEASUREMENT:
            element = {
                type: 'measurement',
                value: card.value as MeasurementBasis,
                position: pos,
                targetLane: laneIdx,
            };
            break;

          // INITIAL_QUBIT, TARGET, and other cards don't translate to operations
          case CardType.INITIAL_QUBIT:
          case CardType.TARGET:
            break;
        }
        
        if (element) {
          elements.push(element);
        }
      }
    }
    
    // Sort elements by position to ensure correct order of application
    elements.sort((a, b) => a.position - b.position);

    return { elements, initialState, numQubits };
  }

  /**
   * Execute quantum computation when a measurement card is played.
   */
  public async executeMeasurementComputation(
    gameState: GameState,
    measurementCard: Card,
    laneIndex: number,
    position: number
  ) {
    try {
      const circuit = this.gameboardToQuantumCircuit(gameState);

      const context: QuantumComputationContext = {
        circuit,
        measurementLane: laneIndex,
        measurementPosition: position,
        measurementBasis: measurementCard.value as MeasurementBasis,
      };

      const result = this.quantumEngine.executeQuantumComputation(context);

      console.log('🔬 Quantum Computation Results:');
      console.log(`Lane ${laneIndex}, Position ${position}`);
      console.log(`Measurement: ${measurementCard.value}`);
      console.log(`Outcome: ${result.measurementResult.outcome}`);
      console.log(`Probability: ${result.measurementResult.probability.toFixed(3)}`);
      console.log(`Execution Time: ${result.executionTime.toFixed(2)}ms`);
      console.log('Computation Steps:');
      result.computationSteps.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step}`);
      });

      return result;

    } catch (error) {
      console.error('❌ Quantum computation failed:', error);
      console.log('🔄 Falling back to classical game logic');
      return null;
    }
  }

  /**
   * Get quantum computation debug information.
   */
  public getLastComputationSteps(): string[] {
    return this.quantumEngine.getLastComputationSteps();
  }

  /**
   * Check if quantum computation is available. For now, this is always true.
   */
  public isQuantumComputationAvailable(): boolean {
    return true;
  }
}
