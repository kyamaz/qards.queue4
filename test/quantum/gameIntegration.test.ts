// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { QuantumGameIntegration } from '../../src/quantum/gameIntegration';
import { GameState, CardType, Card } from '../../src/game/types';

describe('QuantumGameIntegration (Multi-Qubit)', () => {
  let integration: QuantumGameIntegration;

  beforeEach(() => {
    integration = new QuantumGameIntegration();
  });

  describe('gameboardToQuantumCircuit', () => {
    it('should correctly convert a board with a CNOT gate', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            // Lane 0 (Control)
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|1⟩' },
              { id: 'c2', type: CardType.GATE, value: 'H', position: 1 },
              { id: 'c3', type: CardType.CONTROL, value: 'C', position: 2, controlLink: { targetLaneIndex: 1 } },
            ],
            // Lane 1 (Target)
            [
              { id: 'c4', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              null,
              { id: 'c5', type: CardType.TARGET, value: 'O', position: 2 },
            ],
          ],
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gameEnded: false,
        turnDirection: 'forward',
      };

      const circuit = integration['gameboardToQuantumCircuit'](gameState);

      expect(circuit.numQubits).toBe(2);
      
      // Check initial state creation
      // |1⟩ ⊗ |0⟩ = |10⟩, which is index 2
      expect(circuit.initialState.amplitudes[2].real).toBe(1);
      expect(circuit.initialState.amplitudes.filter(a => a.real !== 0).length).toBe(1);

      // Check circuit elements
      expect(circuit.elements.length).toBe(2); // H gate and CNOT gate
      
      // H gate on lane 0
      const hGate = circuit.elements.find(e => e.value === 'H');
      expect(hGate).toBeDefined();
      expect(hGate.targetLane).toBe(0);
      expect(hGate.position).toBe(1);

      // CNOT gate from lane 0 to 1
      const cnotGate = circuit.elements.find(e => e.value === 'CNOT');
      expect(cnotGate).toBeDefined();
      expect(cnotGate.controlLane).toBe(0);
      expect(cnotGate.targetLane).toBe(1);
      expect(cnotGate.position).toBe(2);
    });
  });

  describe('Measurement Computation with Entanglement', () => {
    it('should execute a circuit that creates a Bell state', async () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            // Lane 0
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩', position: 0 },
              { id: 'c2', type: CardType.GATE, value: 'H', position: 1 },
              { id: 'c3', type: CardType.CONTROL, value: 'C', position: 2, controlLink: { targetLaneIndex: 1 } },
            ],
            // Lane 1
            [
              { id: 'c4', type: CardType.INITIAL_QUBIT, value: '|0⟩', position: 0 },
              null,
              { id: 'c5', type: CardType.TARGET, value: 'O', position: 2 },
            ],
          ],
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gameEnded: false,
        turnDirection: 'forward',
      };
      const measurementCard: Card = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' };

      // This circuit creates the Bell state (1/√2)(|00⟩ + |11⟩)
      // Measuring either qubit should yield '0' or '1' with 50% probability.
      const result = await integration.executeMeasurementComputation(gameState, measurementCard, 0, 3);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.measurementResult.probability).toBeCloseTo(0.5);
        // Score should be 3 for '0' or 5 for '1'
        expect([3, 5]).toContain(result.gameScore);
      }
    });
  });
});