// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import {
  initializeInitialSelection,
  hasInitialQubitCards,
  placeInitialQubitCards,
  skipPlayerInitialSelection,
  advanceInitialSelectionPlayer,
  isInitialSelectionComplete,
  completeInitialSelection,
  determineFirstPlayer,
  shouldPlaceInitialCards,
  getInitialQubitCards
} from '../../src/game/initialSelection';
import { CardType, GameState, Player } from '../../src/game/types';

describe('Initial Selection Coverage Tests', () => {
  const createMockGameState = (overrides = {}): GameState => ({
    players: [
      {
        id: 'player-0',
        name: 'Player 1',
        hand: [
          { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
          { id: 'g1', type: CardType.GATE, value: 'X' }
        ],
        score: 0,
        passes: 0,
        isEliminated: false
      },
      {
        id: 'player-1', 
        name: 'Player 2',
        hand: [
          { id: 'iq2', type: CardType.INITIAL_QUBIT, value: '|1⟩' }
        ],
        score: 0,
        passes: 0,
        isEliminated: false
      },
      {
        id: 'player-2',
        name: 'Player 3',
        hand: [
          { id: 'g2', type: CardType.GATE, value: 'H' }
        ],
        score: 0,
        passes: 0,
        isEliminated: false
      }
    ],
    board: {
      lane: [[], [], [], []]
    },
    currentPlayerId: 'player-0',
    currentPlayer: 0,
    turn: 1,
    measurementCount: 0,
    gameEnded: false,
    winner: null,
    isInitialSelection: true,
    initialSelectionPlayer: 0,
    isReverseOrder: false,
    controlTargetState: null,
    unitaryCardCounters: {},
    gameEndReason: null,
    gamePhase: 'initial_selection' as const,
    ...overrides
  });

  describe('Error handling for placeInitialQubitCards', () => {
    it('should throw error when player not found - line 60', () => {
      const gameState = createMockGameState();
      const cards = [{ id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' }];
      
      expect(() => {
        placeInitialQubitCards(gameState, 'invalid-player', cards);
      }).toThrow('Player invalid-player not found');
    });

    it('should throw error when no available lanes - line 83', () => {
      const gameState = createMockGameState({
        board: {
          lane: [
            [{ id: 'existing1', type: CardType.GATE, value: 'I' }],
            [{ id: 'existing2', type: CardType.GATE, value: 'I' }],
            [{ id: 'existing3', type: CardType.GATE, value: 'I' }],
            [{ id: 'existing4', type: CardType.GATE, value: 'I' }]
          ]
        }
      });
      
      const cards = [
        { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        { id: 'iq2', type: CardType.INITIAL_QUBIT, value: '|1⟩' },
        { id: 'iq3', type: CardType.INITIAL_QUBIT, value: '|+⟩' },
        { id: 'iq4', type: CardType.INITIAL_QUBIT, value: '|-⟩' },
        { id: 'iq5', type: CardType.INITIAL_QUBIT, value: '|0⟩' } // This should fail
      ];
      
      expect(() => {
        placeInitialQubitCards(gameState, 'player-0', cards);
      }).toThrow('No available lanes for INITIAL_QUBIT placement');
    });

    it('should skip lanes that already have cards - line 79', () => {
      const gameState = createMockGameState({
        board: {
          lane: [
            [{ id: 'existing1', type: CardType.GATE, value: 'I' }], // Skip this
            [], // Use this
            [{ id: 'existing2', type: CardType.GATE, value: 'I' }], // Skip this
            []  // Use this
          ]
        }
      });
      
      const cards = [
        { id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        { id: 'iq2', type: CardType.INITIAL_QUBIT, value: '|1⟩' }
      ];
      
      const result = placeInitialQubitCards(gameState, 'player-0', cards);
      
      // Cards should be placed in lanes 1 and 3 (indices)
      expect(result.board.lane[1][0]).toEqual(cards[0]);
      expect(result.board.lane[3][0]).toEqual(cards[1]);
    });
  });

  describe('Error handling for skipPlayerInitialSelection', () => {
    it('should throw error when player not found - line 135', () => {
      const gameState = createMockGameState({
        initialSelection: {
          currentPlayerIndex: 0,
          candidates: [],
          playersCompleted: [false, false, false],
          phaseComplete: false,
          firstPlayerCandidates: []
        }
      });
      
      expect(() => {
        skipPlayerInitialSelection(gameState, 'invalid-player');
      }).toThrow('Player invalid-player not found');
    });
  });

  describe('Error handling for advanceInitialSelectionPlayer', () => {
    it('should throw error when initial selection not initialized - line 158', () => {
      const gameState = createMockGameState({
        initialSelection: undefined
      });
      
      expect(() => {
        advanceInitialSelectionPlayer(gameState);
      }).toThrow('Initial selection state not initialized');
    });
  });

  describe('Edge cases for isInitialSelectionComplete', () => {
    it('should handle missing initialSelection state - line 189', () => {
      const gameState = createMockGameState({
        initialSelection: undefined
      });
      
      const result = isInitialSelectionComplete(gameState);
      expect(result).toBe(false);
    });
  });

  describe('Error handling for completeInitialSelection', () => {
    it('should throw error when initial selection not initialized - line 210', () => {
      const gameState = createMockGameState({
        initialSelection: undefined
      });
      
      expect(() => {
        completeInitialSelection(gameState);
      }).toThrow('Initial selection state not initialized');
    });
  });

  describe('Additional coverage tests', () => {
    it('should test shouldPlaceInitialCards function', () => {
      const gameState = createMockGameState({
        isInitialSelection: true,
        initialSelection: {
          currentPlayerIndex: 0,
          candidates: [],
          playersCompleted: [false, false, false],
          phaseComplete: false,
          firstPlayerCandidates: []
        }
      });
      
      const result = shouldPlaceInitialCards(gameState);
      expect(typeof result).toBe('boolean');
    });

    it('should test getInitialQubitCards function', () => {
      const player = createMockGameState().players[0];
      
      const cards = getInitialQubitCards(player);
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.every(card => card.type === CardType.INITIAL_QUBIT)).toBe(true);
    });
  });

  describe('Complex initial selection scenarios', () => {
    it('should handle initial selection with all players having |1⟩ cards', () => {
      const gameState = createMockGameState({
        players: [
          {
            id: 'player-0',
            name: 'Player 1',
            hand: [{ id: 'iq1', type: CardType.INITIAL_QUBIT, value: '|1⟩' }],
            score: 0,
            passes: 0,
            isEliminated: false
          },
          {
            id: 'player-1',
            name: 'Player 2',
            hand: [{ id: 'iq2', type: CardType.INITIAL_QUBIT, value: '|1⟩' }],
            score: 0,
            passes: 0,
            isEliminated: false
          },
          {
            id: 'player-2',
            name: 'Player 3',
            hand: [{ id: 'iq3', type: CardType.INITIAL_QUBIT, value: '|1⟩' }],
            score: 0,
            passes: 0,
            isEliminated: false
          }
        ],
        initialSelection: {
          currentPlayerIndex: 0,
          candidates: [],
          playersCompleted: [false, false, false],
          phaseComplete: false,
          firstPlayerCandidates: []
        }
      });
      
      // Place |1⟩ cards for each player
      let state = gameState;
      state = placeInitialQubitCards(state, 'player-0', [state.players[0].hand[0]]);
      state = placeInitialQubitCards(state, 'player-1', [state.players[1].hand[0]]);
      state = placeInitialQubitCards(state, 'player-2', [state.players[2].hand[0]]);
      
      // All players should be in firstPlayerCandidates
      expect(state.initialSelection?.firstPlayerCandidates).toContain('player-0');
      expect(state.initialSelection?.firstPlayerCandidates).toContain('player-1');
      expect(state.initialSelection?.firstPlayerCandidates).toContain('player-2');
    });

    it('should handle advancing through all players when some are already completed', () => {
      const gameState = createMockGameState({
        initialSelection: {
          currentPlayerIndex: 0,
          candidates: [],
          playersCompleted: [true, false, true], // Player 0 and 2 already completed
          phaseComplete: false,
          firstPlayerCandidates: []
        }
      });
      
      const result = advanceInitialSelectionPlayer(gameState);
      
      // Should advance to player 1 (index 1) since it's the only one not completed
      expect(result.initialSelection?.currentPlayerIndex).toBe(1);
      expect(result.currentPlayerId).toBe('player-1');
    });

    it('should handle initial selection with mixed card types', () => {
      const gameState = createMockGameState();
      const player = gameState.players[0];
      
      // Filter to get only INITIAL_QUBIT cards
      const initialQubitCards = player.hand.filter(card => card.type === CardType.INITIAL_QUBIT);
      
      expect(hasInitialQubitCards(player)).toBe(true);
      expect(initialQubitCards.length).toBeGreaterThan(0);
    });
  });
});