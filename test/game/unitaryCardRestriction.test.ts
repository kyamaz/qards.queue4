// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { 
  initializeGame, 
  canPlayUnitaryCard, 
  incrementUnitaryCardCounter, 
  resetUnitaryCardCounters 
} from '../../src/game/gameLogic';
import { CardType, GameState } from '../../src/game/types';

// Mock uuidv4 to provide different IDs for different entities
let idCounter = 0;
jest.mock('uuid', () => ({
  v4: jest.fn(() => `mock-uuid-${++idCounter}`),
}));

describe('Unitary Card Restriction System', () => {
  let gameState: GameState;
  let playerId: string;

  beforeEach(() => {
    // Reset the counter before each test
    idCounter = 0;
    gameState = initializeGame(['Player A', 'Player B', 'Player C']);
    playerId = gameState.players[0].id;
  });

  describe('canPlayUnitaryCard', () => {
    it('should allow Unitary card when none have been played this turn', () => {
      expect(canPlayUnitaryCard(gameState, playerId)).toBe(true);
    });

    it('should not allow second Unitary card in the same turn', () => {
      const updatedGameState = incrementUnitaryCardCounter(gameState, playerId);
      expect(canPlayUnitaryCard(updatedGameState, playerId)).toBe(false);
    });

    it('should allow different players to play Unitary cards in the same turn', () => {
      const player1Id = gameState.players[0].id;
      const player2Id = gameState.players[1].id;
      
      let updatedGameState = incrementUnitaryCardCounter(gameState, player1Id);
      
      expect(canPlayUnitaryCard(updatedGameState, player1Id)).toBe(false);
      expect(canPlayUnitaryCard(updatedGameState, player2Id)).toBe(true);
    });
  });

  describe('incrementUnitaryCardCounter', () => {
    it('should increment counter from 0 to 1', () => {
      const updatedGameState = incrementUnitaryCardCounter(gameState, playerId);
      expect(updatedGameState.unitaryCardsPlayedThisTurn[playerId]).toBe(1);
    });

    it('should increment counter from 1 to 2', () => {
      let updatedGameState = incrementUnitaryCardCounter(gameState, playerId);
      updatedGameState = incrementUnitaryCardCounter(updatedGameState, playerId);
      expect(updatedGameState.unitaryCardsPlayedThisTurn[playerId]).toBe(2);
    });

    it('should maintain separate counters for different players', () => {
      const player1Id = gameState.players[0].id;
      const player2Id = gameState.players[1].id;
      
      let updatedGameState = incrementUnitaryCardCounter(gameState, player1Id);
      updatedGameState = incrementUnitaryCardCounter(updatedGameState, player2Id);
      
      expect(updatedGameState.unitaryCardsPlayedThisTurn[player1Id]).toBe(1);
      expect(updatedGameState.unitaryCardsPlayedThisTurn[player2Id]).toBe(1);
    });
  });

  describe('resetUnitaryCardCounters', () => {
    it('should reset all counters to empty object', () => {
      let updatedGameState = incrementUnitaryCardCounter(gameState, gameState.players[0].id);
      updatedGameState = incrementUnitaryCardCounter(updatedGameState, gameState.players[1].id);
      
      const resetGameState = resetUnitaryCardCounters(updatedGameState);
      expect(resetGameState.unitaryCardsPlayedThisTurn).toEqual({});
    });

    it('should allow all players to play Unitary cards after reset', () => {
      let updatedGameState = incrementUnitaryCardCounter(gameState, gameState.players[0].id);
      updatedGameState = incrementUnitaryCardCounter(updatedGameState, gameState.players[1].id);
      
      const resetGameState = resetUnitaryCardCounters(updatedGameState);
      
      gameState.players.forEach(player => {
        expect(canPlayUnitaryCard(resetGameState, player.id)).toBe(true);
      });
    });
  });

  describe('Full turn cycle behavior', () => {
    it('should reset counters when a new turn begins', () => {
      // Simulate players playing Unitary cards
      let updatedGameState = incrementUnitaryCardCounter(gameState, gameState.players[0].id);
      updatedGameState = incrementUnitaryCardCounter(updatedGameState, gameState.players[1].id);
      
      // Verify they cannot play more Unitary cards
      expect(canPlayUnitaryCard(updatedGameState, gameState.players[0].id)).toBe(false);
      expect(canPlayUnitaryCard(updatedGameState, gameState.players[1].id)).toBe(false);
      
      // Reset for new turn
      const newTurnGameState = resetUnitaryCardCounters(updatedGameState);
      
      // Verify they can play Unitary cards again
      expect(canPlayUnitaryCard(newTurnGameState, gameState.players[0].id)).toBe(true);
      expect(canPlayUnitaryCard(newTurnGameState, gameState.players[1].id)).toBe(true);
    });
  });

  describe('Game state consistency', () => {
    it('should initialize with empty Unitary card counters', () => {
      expect(gameState.unitaryCardsPlayedThisTurn).toEqual({});
    });

    it('should maintain other game state properties when updating counters', () => {
      const updatedGameState = incrementUnitaryCardCounter(gameState, playerId);
      
      expect(updatedGameState.players).toEqual(gameState.players);
      expect(updatedGameState.board).toEqual(gameState.board);
      expect(updatedGameState.currentPlayerId).toBe(gameState.currentPlayerId);
      expect(updatedGameState.turn).toBe(gameState.turn);
      expect(updatedGameState.gameEnded).toBe(gameState.gameEnded);
    });
  });
});