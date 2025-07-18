// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import {
  initializeInitialSelection,
  hasInitialQubitCards,
  getInitialQubitCards,
  placeInitialQubitCards,
  skipPlayerInitialSelection,
  advanceInitialSelectionPlayer,
  shouldPlaceInitialCards,
  isInitialSelectionComplete,
  completeInitialSelection,
  determineFirstPlayer
} from '../../src/game/initialSelection';
import { GameState, Player, Card, CardType } from '../../src/game/types';

describe('Initial Selection Logic', () => {
  const createMockPlayers = (): Player[] => [
    {
      id: 'player1',
      name: 'Player 1',
      hand: [
        { id: 'card1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
        { id: 'card2', type: CardType.GATE, value: 'X' }
      ],
      score: 0,
      passes: 0
    },
    {
      id: 'player2',
      name: 'Player 2',
      hand: [
        { id: 'card3', type: CardType.INITIAL_QUBIT, value: '|1⟩' },
        { id: 'card4', type: CardType.GATE, value: 'H' }
      ],
      score: 0,
      passes: 0
    },
    {
      id: 'player3',
      name: 'Player 3',
      hand: [
        { id: 'card5', type: CardType.GATE, value: 'Z' }
      ],
      score: 0,
      passes: 0
    }
  ];

  const createMockGameState = (players: Player[]): GameState => ({
    players,
    deck: [],
    board: { lane: [[], [], [], []] },
    currentPlayerId: players[0].id,
    turn: 1,
    measurementCount: 0,
    gameEnded: false,
    turnDirection: 'forward',
    gamePhase: 'initial_selection',
    initialSelection: initializeInitialSelection(players)
  });

  describe('initializeInitialSelection', () => {
    it('should initialize with correct default values', () => {
      const players = createMockPlayers();
      const initialState = initializeInitialSelection(players);

      expect(initialState.currentPlayerIndex).toBe(0);
      expect(initialState.playersCompleted).toEqual([false, false, false]);
      expect(initialState.firstPlayerCandidates).toEqual([]);
      expect(initialState.phaseComplete).toBe(false);
    });
  });

  describe('hasInitialQubitCards', () => {
    it('should return true for players with INITIAL_QUBIT cards', () => {
      const players = createMockPlayers();
      
      expect(hasInitialQubitCards(players[0])).toBe(true);
      expect(hasInitialQubitCards(players[1])).toBe(true);
      expect(hasInitialQubitCards(players[2])).toBe(false);
    });
  });

  describe('getInitialQubitCards', () => {
    it('should return only INITIAL_QUBIT cards', () => {
      const players = createMockPlayers();
      
      const player1Cards = getInitialQubitCards(players[0]);
      expect(player1Cards).toHaveLength(1);
      expect(player1Cards[0].type).toBe(CardType.INITIAL_QUBIT);
      expect(player1Cards[0].value).toBe('|0⟩');

      const player2Cards = getInitialQubitCards(players[1]);
      expect(player2Cards).toHaveLength(1);
      expect(player2Cards[0].type).toBe(CardType.INITIAL_QUBIT);
      expect(player2Cards[0].value).toBe('|1⟩');

      const player3Cards = getInitialQubitCards(players[2]);
      expect(player3Cards).toHaveLength(0);
    });
  });

  describe('placeInitialQubitCards', () => {
    it('should place INITIAL_QUBIT cards on the board', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);
      const cardsToPlace = getInitialQubitCards(players[0]);

      const newState = placeInitialQubitCards(gameState, players[0].id, cardsToPlace);

      // Check that card was placed on board
      expect(newState.board.lane[0]).toHaveLength(1);
      expect(newState.board.lane[0][0]).toEqual(cardsToPlace[0]);

      // Check that card was removed from player's hand
      const updatedPlayer = newState.players.find(p => p.id === players[0].id);
      expect(updatedPlayer?.hand).toHaveLength(1);
      expect(updatedPlayer?.hand[0].type).toBe(CardType.GATE);

      // Check that player is marked as completed
      expect(newState.initialSelection?.playersCompleted[0]).toBe(true);
    });

    it('should add |1⟩ players to first player candidates', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);
      const cardsToPlace = getInitialQubitCards(players[1]); // Player 2 has |1⟩

      const newState = placeInitialQubitCards(gameState, players[1].id, cardsToPlace);

      expect(newState.initialSelection?.firstPlayerCandidates).toContain(players[1].id);
    });

    it('should throw error for non-INITIAL_QUBIT cards', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);
      const invalidCard = { id: 'invalid', type: CardType.GATE, value: 'X' };

      expect(() => {
        placeInitialQubitCards(gameState, players[0].id, [invalidCard]);
      }).toThrow('Card invalid is not an INITIAL_QUBIT card');
    });
  });

  describe('skipPlayerInitialSelection', () => {
    it('should mark player as completed without placing cards', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);

      const newState = skipPlayerInitialSelection(gameState, players[2].id);

      expect(newState.initialSelection?.playersCompleted[2]).toBe(true);
      expect(newState.board.lane.every(lane => lane.length === 0)).toBe(true);
    });
  });

  describe('advanceInitialSelectionPlayer', () => {
    it('should advance to next player', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);

      const newState = advanceInitialSelectionPlayer(gameState);

      expect(newState.initialSelection?.currentPlayerIndex).toBe(1);
    });

    it('should wrap around to first player', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);
      gameState.initialSelection!.currentPlayerIndex = 2;

      const newState = advanceInitialSelectionPlayer(gameState);

      expect(newState.initialSelection?.currentPlayerIndex).toBe(0);
    });
  });

  describe('shouldPlaceInitialCards', () => {
    it('should return true for current player with INITIAL_QUBIT cards', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);

      expect(shouldPlaceInitialCards(gameState)).toBe(true);
    });

    it('should return false for current player without INITIAL_QUBIT cards', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);
      gameState.initialSelection!.currentPlayerIndex = 2; // Player 3 has no INITIAL_QUBIT

      expect(shouldPlaceInitialCards(gameState)).toBe(false);
    });

    it('should return false if not in initial_selection phase', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);
      gameState.gamePhase = 'normal_play';

      expect(shouldPlaceInitialCards(gameState)).toBe(false);
    });
  });

  describe('isInitialSelectionComplete', () => {
    it('should return true when all players completed', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);
      gameState.initialSelection!.playersCompleted = [true, true, true];
      gameState.initialSelection!.phaseComplete = true;

      expect(isInitialSelectionComplete(gameState)).toBe(true);
    });

    it('should return false when not all players completed', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);

      expect(isInitialSelectionComplete(gameState)).toBe(false);
    });
  });

  describe('determineFirstPlayer', () => {
    it('should return player who placed |1⟩ card', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);
      gameState.initialSelection!.firstPlayerCandidates = [players[1].id];

      const firstPlayer = determineFirstPlayer(gameState);

      expect(firstPlayer).toBe(players[1].id);
    });

    it('should return first candidate if multiple |1⟩ players', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);
      gameState.initialSelection!.firstPlayerCandidates = [players[0].id, players[1].id];

      const firstPlayer = determineFirstPlayer(gameState);

      expect(firstPlayer).toBe(players[0].id);
    });

    it('should fallback to first player if no |1⟩ cards', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);
      gameState.initialSelection!.firstPlayerCandidates = [];

      const firstPlayer = determineFirstPlayer(gameState);

      expect(firstPlayer).toBe(players[0].id);
    });
  });

  describe('completeInitialSelection', () => {
    it('should transition to normal play without adding I gates', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);
      
      // Set up completed state
      gameState.initialSelection!.phaseComplete = true;
      gameState.initialSelection!.firstPlayerCandidates = [players[1].id];
      
      // Place some INITIAL_QUBIT cards on board
      gameState.board.lane[0] = [{ id: 'initial1', type: CardType.INITIAL_QUBIT, value: '|0⟩' }];
      gameState.board.lane[1] = [{ id: 'initial2', type: CardType.INITIAL_QUBIT, value: '|1⟩' }];

      const newState = completeInitialSelection(gameState);

      expect(newState.gamePhase).toBe('normal_play');
      expect(newState.currentPlayerId).toBe(players[1].id); // Player with |1⟩
      expect(newState.initialSelection).toBeUndefined();

      // Check that only INITIAL_QUBIT cards remain (no automatic I gates)
      expect(newState.board.lane[0]).toHaveLength(1);
      expect(newState.board.lane[0][0].type).toBe(CardType.INITIAL_QUBIT);

      expect(newState.board.lane[1]).toHaveLength(1);
      expect(newState.board.lane[1][0].type).toBe(CardType.INITIAL_QUBIT);

      // Empty lanes should remain empty
      expect(newState.board.lane[2]).toHaveLength(0);
      expect(newState.board.lane[3]).toHaveLength(0);
    });

    it('should throw error if phase not complete', () => {
      const players = createMockPlayers();
      const gameState = createMockGameState(players);

      expect(() => {
        completeInitialSelection(gameState);
      }).toThrow('Initial selection phase not complete');
    });
  });
});