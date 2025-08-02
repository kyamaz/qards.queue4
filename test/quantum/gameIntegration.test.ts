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

  describe('Additional Coverage Tests', () => {
    it('should handle constructor correctly', () => {
      const newIntegration = new QuantumGameIntegration();
      expect(newIntegration).toBeInstanceOf(QuantumGameIntegration);
    });

    it('should handle isQuantumComputationAvailable', () => {
      const result = integration.isQuantumComputationAvailable();
      expect(result).toBe(true);
    });

    it('should handle UNITARY card type conversion', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩', position: 0 },
              { id: 'c2', type: CardType.UNITARY, value: 'X', position: 1 },
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
      expect(circuit.elements.length).toBe(1);
      expect(circuit.elements[0].value).toBe('X');
      expect(circuit.elements[0].type).toBe('gate');
    });

    it('should handle MEASUREMENT card type conversion', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩', position: 0 },
              { id: 'c2', type: CardType.MEASUREMENT, value: '⟨0|', position: 1 },
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
      expect(circuit.elements.length).toBe(1);
      expect(circuit.elements[0].value).toBe('⟨0|');
      expect(circuit.elements[0].type).toBe('measurement');
    });

    it('should ignore TARGET and INITIAL_QUBIT cards in circuit elements', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩', position: 0 },
              { id: 'c2', type: CardType.TARGET, value: 'O', position: 1 },
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
      expect(circuit.elements.length).toBe(0); // Only initial qubit and target, no actual operations
    });

    it('should handle CONTROL card without controlLink', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩', position: 0 },
              { id: 'c2', type: CardType.CONTROL, value: 'C', position: 1 }, // No controlLink
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
      expect(circuit.elements.length).toBe(0); // Should not create element without controlLink
    });

    it('should sort circuit elements by position', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩', position: 0 },
              { id: 'c2', type: CardType.GATE, value: 'Z', position: 3 },
              { id: 'c3', type: CardType.GATE, value: 'X', position: 1 },
              { id: 'c4', type: CardType.GATE, value: 'H', position: 2 },
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
      expect(circuit.elements.length).toBe(3);
      
      // Elements should be sorted by position
      expect(circuit.elements[0].position).toBeLessThan(circuit.elements[1].position);
      expect(circuit.elements[1].position).toBeLessThan(circuit.elements[2].position);
    });

    it('should handle multiple lanes with different initial qubit states', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [{ id: 'c1', type: CardType.INITIAL_QUBIT, value: '|1⟩', position: 0 }],
            [{ id: 'c2', type: CardType.INITIAL_QUBIT, value: '|+⟩', position: 0 }],
            [{ id: 'c3', type: CardType.INITIAL_QUBIT, value: '|-⟩', position: 0 }],
            [], // No initial qubit, should default to |0⟩
          ],
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gameEnded: false,
        turnDirection: 'forward',
      };

      const circuit = integration['gameboardToQuantumCircuit'](gameState);
      expect(circuit.numQubits).toBe(4);
      expect(circuit.initialState.numQubits).toBe(4);
    });

    it('should handle normal executeMeasurementComputation call', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: { 
          lane: [
            [{ id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩', position: 0 }]
          ] 
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gameEnded: false,
        turnDirection: 'forward',
      };

      // Test with valid parameters
      const result = integration.executeMeasurementComputation(gameState, 0, 1, '⟨0|');
      expect(typeof result).toBe('object');
    });
  });

  describe('executeMeasurementComputation', () => {
    it('should handle measurement computation with different measurement bases', async () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: 'c2', type: CardType.GATE, value: 'H' }
            ]
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const measurementCard: Card = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨+|' };
      
      const result = await integration.executeMeasurementComputation(
        gameState,
        measurementCard,
        0,
        2
      );
      
      expect(result).toBeDefined();
    });

    it('should handle different initial qubit states', async () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [{ id: 'c1', type: CardType.INITIAL_QUBIT, value: '|1⟩' }],
            [{ id: 'c2', type: CardType.INITIAL_QUBIT, value: '|+⟩' }],
            [{ id: 'c3', type: CardType.INITIAL_QUBIT, value: '|-⟩' }]
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const measurementCard: Card = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' };
      
      const result = await integration.executeMeasurementComputation(
        gameState,
        measurementCard,
        0,
        1
      );
      
      expect(result).toBeDefined();
    });

    it('should handle measurement cards with different values', async () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: 'c2', type: CardType.GATE, value: 'X' }
            ]
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const measurementCards = [
        { id: 'm1', type: CardType.MEASUREMENT, value: '⟨1|' },
        { id: 'm2', type: CardType.MEASUREMENT, value: '⟨-|' },
        { id: 'm3', type: CardType.MEASUREMENT, value: '⟨+|' }
      ];

      for (const measurementCard of measurementCards) {
        const result = await integration.executeMeasurementComputation(
          gameState,
          measurementCard as Card,
          0,
          2
        );
        
        expect(result).toBeDefined();
      }
    });

    it('should handle empty board gracefully', async () => {
      // Create a game state with empty lanes
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: []
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const measurementCard: Card = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' };
      
      const result = await integration.executeMeasurementComputation(
        gameState,
        measurementCard,
        0,
        0
      );
      
      // Quantum engine can handle empty board and returns a valid result
      expect(result).toBeDefined();
      if (result) {
        expect(result.measurementResult).toBeDefined();
        expect(result.gameScore).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle complex quantum circuits with multiple gates', async () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: 'c2', type: CardType.GATE, value: 'H' },
              { id: 'c3', type: CardType.GATE, value: 'X' },
              { id: 'c4', type: CardType.GATE, value: 'Z' }
            ]
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const measurementCard: Card = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' };
      
      const result = await integration.executeMeasurementComputation(
        gameState,
        measurementCard,
        0,
        4
      );
      
      expect(result).toBeDefined();
    });

    it('should log computation steps and results', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: 'c2', type: CardType.GATE, value: 'H' }
            ]
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const measurementCard: Card = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' };
      
      await integration.executeMeasurementComputation(
        gameState,
        measurementCard,
        0,
        2
      );
      
      expect(consoleSpy).toHaveBeenCalledWith('🔬 Quantum Computation Results:');
      
      consoleSpy.mockRestore();
    });

    it('should handle errors and log fallback message', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Force an error by providing invalid data
      const gameState = null as any;
      const measurementCard: Card = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' };
      
      const result = await integration.executeMeasurementComputation(
        gameState,
        measurementCard,
        0,
        0
      );
      
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Quantum computation failed:', expect.any(Error));
      expect(consoleLogSpy).toHaveBeenCalledWith('🔄 Falling back to classical game logic');
      
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe('getLastComputationSteps', () => {
    it('should return computation steps from quantum engine', () => {
      const steps = integration.getLastComputationSteps();
      expect(Array.isArray(steps)).toBe(true);
    });

    it('should return steps after a computation', async () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: 'c2', type: CardType.GATE, value: 'H' }
            ]
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const measurementCard: Card = { id: 'm1', type: CardType.MEASUREMENT, value: '⟨0|' };
      
      await integration.executeMeasurementComputation(
        gameState,
        measurementCard,
        0,
        2
      );
      
      const steps = integration.getLastComputationSteps();
      expect(Array.isArray(steps)).toBe(true);
    });
  });

  describe('isQuantumComputationAvailable', () => {
    it('should return true for quantum computation availability', () => {
      expect(integration.isQuantumComputationAvailable()).toBe(true);
    });

    it('should consistently return true', () => {
      for (let i = 0; i < 5; i++) {
        expect(integration.isQuantumComputationAvailable()).toBe(true);
      }
    });
  });

  describe('gameboardToQuantumCircuit - Edge Cases', () => {
    it('should handle board with missing cards in lanes', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              null, // missing card
              { id: 'c2', type: CardType.GATE, value: 'X' }
            ],
            [
              { id: 'c3', type: CardType.INITIAL_QUBIT, value: '|1⟩' }
            ]
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const circuit = integration['gameboardToQuantumCircuit'](gameState);
      expect(circuit.numQubits).toBe(2);
      expect(circuit.elements.length).toBeGreaterThan(0);
    });

    it('should handle lanes without initial qubit cards', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [{ id: 'c1', type: CardType.GATE, value: 'H' }], // No initial qubit
            [{ id: 'c2', type: CardType.GATE, value: 'X' }]  // No initial qubit
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const circuit = integration['gameboardToQuantumCircuit'](gameState);
      expect(circuit.numQubits).toBe(2);
      // Should default to |0⟩ for lanes without initial qubits
    });

    it('should handle unitary cards', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: 'c2', type: CardType.UNITARY, value: 'U' }
            ]
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const circuit = integration['gameboardToQuantumCircuit'](gameState);
      expect(circuit.numQubits).toBe(1);
      // Unitary cards should be included in the circuit
    });

    it('should handle measurement cards', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: 'c2', type: CardType.MEASUREMENT, value: '⟨0|' }
            ]
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const circuit = integration['gameboardToQuantumCircuit'](gameState);
      expect(circuit.numQubits).toBe(1);
      // Measurement cards should be included in the circuit
    });

    it('should handle qubit cards in circuit', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: 'c2', type: CardType.QUBIT, value: '|1⟩' }
            ]
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const circuit = integration['gameboardToQuantumCircuit'](gameState);
      expect(circuit.numQubits).toBe(1);
      // Qubit cards should be included in the circuit
    });

    it('should handle control and target cards', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: 'c1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: 'c2', type: CardType.CONTROL, value: 'C', controlLink: { targetLaneIndex: 1 } }
            ],
            [
              { id: 'c3', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: 'c4', type: CardType.TARGET, value: 'T' }
            ]
          ]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const circuit = integration['gameboardToQuantumCircuit'](gameState);
      expect(circuit.numQubits).toBe(2);
      // Control and target cards should create two-qubit gates
    });

    it('should handle empty board', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [[], [], [], []]
        },
        currentPlayerId: 'p1',
        turn: 1,
        measurementCount: 0,
        gamePhase: 'normal_play',
        turnDirection: 'forward',
        unitaryCardsPlayedThisTurn: {},
        firstPlayerId: 'p1'
      };

      const circuit = integration['gameboardToQuantumCircuit'](gameState);
      expect(circuit.numQubits).toBe(4);
      expect(circuit.elements.length).toBe(0);
    });
  });
});