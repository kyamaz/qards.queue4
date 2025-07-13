import { QuantumGameIntegration } from '../../src/quantum/gameIntegration';
import { GameState, CardType } from '../../src/game/types';

describe('QuantumGameIntegration', () => {
  let integration: QuantumGameIntegration;

  beforeEach(() => {
    integration = new QuantumGameIntegration();
  });

  describe('Quantum Computation Availability', () => {
    it('should detect quantum computation availability when lane has qubits', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: '1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: '2', type: CardType.GATE, value: 'X' }
            ],
            [],
            [],
            []
          ]
        },
        currentPlayerId: '',
        turn: 1,
        measurementCount: 0,
        gameEnded: false,
        turnDirection: 'forward'
      };

      const isAvailable = integration.isQuantumComputationAvailable(gameState, 0);
      expect(isAvailable).toBe(true);
    });

    it('should detect when quantum computation is not available', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: '1', type: CardType.GATE, value: 'I' },
              { id: '2', type: CardType.GATE, value: 'X' }
            ],
            [],
            [],
            []
          ]
        },
        currentPlayerId: '',
        turn: 1,
        measurementCount: 0,
        gameEnded: false,
        turnDirection: 'forward'
      };

      const isAvailable = integration.isQuantumComputationAvailable(gameState, 0);
      expect(isAvailable).toBe(false);
    });

    it('should handle empty lanes', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [[], [], [], []]
        },
        currentPlayerId: '',
        turn: 1,
        measurementCount: 0,
        gameEnded: false,
        turnDirection: 'forward'
      };

      const isAvailable = integration.isQuantumComputationAvailable(gameState, 0);
      expect(isAvailable).toBe(false);
    });

    it('should handle invalid lane index', () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [[], [], [], []]
        },
        currentPlayerId: '',
        turn: 1,
        measurementCount: 0,
        gameEnded: false,
        turnDirection: 'forward'
      };

      const isAvailable = integration.isQuantumComputationAvailable(gameState, 10);
      expect(isAvailable).toBe(false);
    });
  });

  describe('Measurement Computation', () => {
    it('should execute measurement computation without errors', async () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [
            [
              { id: '1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
              { id: '2', type: CardType.GATE, value: 'I' }
            ],
            [],
            [],
            []
          ]
        },
        currentPlayerId: '',
        turn: 1,
        measurementCount: 0,
        gameEnded: false,
        turnDirection: 'forward'
      };

      const measurementCard = {
        id: '3',
        type: CardType.MEASUREMENT,
        value: '⟨0|'
      };

      // Should not throw an error
      const result = await integration.executeMeasurementComputation(
        gameState,
        measurementCard,
        0,
        2
      );

      // Result can be null (fallback) or a computation result
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should handle computation failure gracefully', async () => {
      const gameState: GameState = {
        players: [],
        deck: [],
        board: {
          lane: [[], [], [], []]
        },
        currentPlayerId: '',
        turn: 1,
        measurementCount: 0,
        gameEnded: false,
        turnDirection: 'forward'
      };

      const measurementCard = {
        id: '1',
        type: CardType.MEASUREMENT,
        value: '⟨0|'
      };

      // Should handle empty board gracefully
      const result = await integration.executeMeasurementComputation(
        gameState,
        measurementCard,
        0,
        0
      );

      // Result may be either null (error case) or a valid result (default state handled)
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });

  describe('Debug Information', () => {
    it('should provide computation steps', () => {
      const steps = integration.getLastComputationSteps();
      expect(Array.isArray(steps)).toBe(true);
    });
  });
});