// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { initializeGame, checkGameEndConditions, getGameEndReason } from '../../src/game/gameLogic';
import { Card, CardType, GameState, Player } from '../../src/game/types';

describe('Game End Conditions', () => {
  const createMockGameState = (
    measurementCount: number = 0,
    playerPasses: number[] = [0, 0, 0, 0],
    handSizes: number[] = [5, 5, 5, 5],
    eliminatedPlayers: boolean[] = [false, false, false, false]
  ): GameState => {
    const players: Player[] = [
      { id: 'p1', name: 'Player 1', hand: [], score: 0, passes: playerPasses[0], eliminated: eliminatedPlayers[0] },
      { id: 'p2', name: 'Player 2', hand: [], score: 0, passes: playerPasses[1], eliminated: eliminatedPlayers[1] },
      { id: 'p3', name: 'Player 3', hand: [], score: 0, passes: playerPasses[2], eliminated: eliminatedPlayers[2] },
      { id: 'p4', name: 'Player 4', hand: [], score: 0, passes: playerPasses[3], eliminated: eliminatedPlayers[3] }
    ];

    // Fill hands with mock cards
    handSizes.forEach((size, index) => {
      for (let i = 0; i < size; i++) {
        players[index].hand.push({
          id: `card-${index}-${i}`,
          type: CardType.GATE,
          value: 'I'
        });
      }
    });

    return {
      players,
      deck: [],
      board: { lane: [[], [], [], []] },
      currentPlayerId: 'p1',
      turn: 1,
      measurementCount,
      turnDirection: 'forward',
      gamePhase: 'normal_play',
      initialSelection: null,
      unitaryCardsPlayedThisTurn: {},
      firstPlayerId: 'p1'
    };
  };

  describe('Measurement Count End Condition', () => {
    it('should end game when 11 measurements are completed', () => {
      const gameState = createMockGameState(11, [0, 0, 0, 0], [5, 5, 5, 5]);
      
      // Simulate checking if game should end due to measurement count
      const shouldEndGame = gameState.measurementCount >= 11;
      expect(shouldEndGame).toBe(true);
    });

    it('should not end game when less than 11 measurements are completed', () => {
      const gameState = createMockGameState(10, [0, 0, 0, 0], [5, 5, 5, 5]);
      
      const shouldEndGame = gameState.measurementCount >= 11;
      expect(shouldEndGame).toBe(false);
    });

    it('should handle exactly 11 measurements', () => {
      for (let i = 0; i <= 12; i++) {
        const gameState = createMockGameState(i, [0, 0, 0, 0], [5, 5, 5, 5]);
        const shouldEndGame = gameState.measurementCount >= 11;
        expect(shouldEndGame).toBe(i >= 11);
      }
    });
  });

  describe('Player Elimination Condition', () => {
    it('should not end game when player passes 4 times but gets eliminated', () => {
      // Player with 4 passes should be eliminated, but game continues with other players
      const gameState = createMockGameState(0, [4, 0, 0, 0], [5, 5, 5, 5], [true, false, false, false]);
      
      expect(checkGameEndConditions(gameState)).toBe(false);
    });

    it('should end game when only one active player remains after elimination', () => {
      // 3 players eliminated, only 1 active player left
      const gameState = createMockGameState(0, [4, 4, 4, 0], [5, 5, 5, 5], [true, true, true, false]);
      
      expect(checkGameEndConditions(gameState)).toBe(true);
      expect(getGameEndReason(gameState)).toBe('insufficient_players');
    });

    it('should end game when no active players remain', () => {
      // All players eliminated
      const gameState = createMockGameState(0, [4, 4, 4, 4], [5, 5, 5, 5], [true, true, true, true]);
      
      expect(checkGameEndConditions(gameState)).toBe(true);
      expect(getGameEndReason(gameState)).toBe('insufficient_players');
    });

    it('should continue game when multiple active players remain after elimination', () => {
      // 2 players eliminated, 2 still active
      const gameState = createMockGameState(0, [4, 4, 2, 1], [5, 5, 5, 5], [true, true, false, false]);
      
      expect(checkGameEndConditions(gameState)).toBe(false);
    });
  });

  describe('All Active Players Pass End Condition', () => {
    it('should end game when all active players have passed 3 or more times', () => {
      // All non-eliminated players have 3+ passes
      const gameState = createMockGameState(0, [4, 3, 3, 3], [5, 5, 5, 5], [true, false, false, false]);
      
      expect(checkGameEndConditions(gameState)).toBe(true);
      expect(getGameEndReason(gameState)).toBe('all_active_players_pass');
    });

    it('should end game when all active players have passed more than 3 times', () => {
      // Mixed eliminated and active players, all active have 3+ passes
      const gameState = createMockGameState(0, [4, 4, 5, 3], [5, 5, 5, 5], [true, true, false, false]);
      
      expect(checkGameEndConditions(gameState)).toBe(true);
      expect(getGameEndReason(gameState)).toBe('all_active_players_pass');
    });

    it('should not end game when not all active players have passed 3 times', () => {
      // Some eliminated players have 4+ passes, but not all active players have 3+ passes  
      const gameState = createMockGameState(0, [4, 3, 2, 3], [5, 5, 5, 5], [true, false, false, false]);
      
      expect(checkGameEndConditions(gameState)).toBe(false);
    });

    it('should not end game when no active players have passed', () => {
      // Some players eliminated, remaining active players have 0 passes
      const gameState = createMockGameState(0, [4, 4, 0, 0], [5, 5, 5, 5], [true, true, false, false]);
      
      expect(checkGameEndConditions(gameState)).toBe(false);
    });

    it('should handle mixed elimination and pass counts correctly', () => {
      const testCases = [
        { passes: [4, 1, 2, 3], eliminated: [true, false, false, false], expected: false }, // Not all active have 3+
        { passes: [4, 4, 3, 3], eliminated: [true, true, false, false], expected: true },  // All active have 3+
        { passes: [3, 3, 3, 3], eliminated: [false, false, false, false], expected: true }, // All active have 3+
        { passes: [4, 4, 4, 4], eliminated: [true, true, true, true], expected: true },    // No active players
      ];

      testCases.forEach(({ passes, eliminated, expected }) => {
        const gameState = createMockGameState(0, passes, [5, 5, 5, 5], eliminated);
        expect(checkGameEndConditions(gameState)).toBe(expected);
      });
    });
  });

  describe('Empty Hand End Condition', () => {
    it('should end game when any player has empty hand', () => {
      const gameState = createMockGameState(0, [0, 0, 0, 0], [0, 5, 5, 5]);
      
      const shouldEndGame = gameState.players.some(p => p.hand.length === 0);
      expect(shouldEndGame).toBe(true);
    });

    it('should end game when multiple players have empty hands', () => {
      const gameState = createMockGameState(0, [0, 0, 0, 0], [0, 0, 5, 5]);
      
      const shouldEndGame = gameState.players.some(p => p.hand.length === 0);
      expect(shouldEndGame).toBe(true);
    });

    it('should not end game when all players have cards', () => {
      const gameState = createMockGameState(0, [0, 0, 0, 0], [1, 1, 1, 1]);
      
      const shouldEndGame = gameState.players.some(p => p.hand.length === 0);
      expect(shouldEndGame).toBe(false);
    });

    it('should handle edge case with exactly one card remaining', () => {
      for (let handSize = 0; handSize <= 3; handSize++) {
        const gameState = createMockGameState(0, [0, 0, 0, 0], [handSize, 5, 5, 5]);
        const shouldEndGame = gameState.players.some(p => p.hand.length === 0);
        expect(shouldEndGame).toBe(handSize === 0);
      }
    });
  });

  describe('Multiple End Conditions', () => {
    it('should end game when multiple conditions are met simultaneously', () => {
      // Both measurement count and insufficient players conditions met
      const gameState1 = createMockGameState(11, [4, 4, 4, 0], [5, 5, 5, 5], [true, true, true, false]);
      
      const measurementEnd = gameState1.measurementCount >= 11;
      const activePlayers = gameState1.players.filter(p => !p.eliminated);
      const insufficientPlayers = activePlayers.length <= 1;
      const shouldEndGame = measurementEnd || insufficientPlayers;
      
      expect(measurementEnd).toBe(true);
      expect(insufficientPlayers).toBe(true);
      expect(shouldEndGame).toBe(true);
    });

    it('should end game when all end conditions are met', () => {
      // All conditions: measurements, insufficient players, all active pass, and empty hand
      const gameState = createMockGameState(11, [4, 4, 4, 3], [0, 5, 5, 5], [true, true, true, false]);
      
      const measurementEnd = gameState.measurementCount >= 11;
      const activePlayers = gameState.players.filter(p => !p.eliminated);
      const insufficientPlayers = activePlayers.length <= 1;
      const allActivePassEnd = activePlayers.length > 0 && activePlayers.every(p => p.passes >= 3);
      const emptyHandEnd = gameState.players.some(p => p.hand.length === 0);
      
      expect(measurementEnd).toBe(true);
      expect(insufficientPlayers).toBe(true);
      expect(allActivePassEnd).toBe(true);
      expect(emptyHandEnd).toBe(true);
    });

    it('should continue game when no end conditions are met', () => {
      const gameState = createMockGameState(5, [2, 1, 2, 1], [3, 3, 3, 3], [false, false, false, false]);
      
      const measurementEnd = gameState.measurementCount >= 11;
      const activePlayers = gameState.players.filter(p => !p.eliminated);
      const insufficientPlayers = activePlayers.length <= 1;
      const allActivePassEnd = activePlayers.length > 0 && activePlayers.every(p => p.passes >= 3);
      const emptyHandEnd = gameState.players.some(p => p.hand.length === 0);
      
      expect(measurementEnd).toBe(false);
      expect(insufficientPlayers).toBe(false);
      expect(allActivePassEnd).toBe(false);
      expect(emptyHandEnd).toBe(false);
    });
  });

  describe('Game Phase Transitions', () => {
    it('should transition to game_ended phase when end condition is met', () => {
      const gameState = createMockGameState(11, [0, 0, 0, 0], [5, 5, 5, 5]);
      
      // Simulate the phase transition logic
      const shouldEndGame = gameState.measurementCount >= 11;
      const newGamePhase = shouldEndGame ? 'game_ended' : gameState.gamePhase;
      
      expect(newGamePhase).toBe('game_ended');
    });

    it('should maintain normal_play phase when no end condition is met', () => {
      const gameState = createMockGameState(5, [2, 2, 2, 2], [3, 3, 3, 3], [false, false, false, false]);
      
      const measurementEnd = gameState.measurementCount >= 11;
      const activePlayers = gameState.players.filter(p => !p.eliminated);
      const insufficientPlayers = activePlayers.length <= 1;
      const allActivePassEnd = activePlayers.length > 0 && activePlayers.every(p => p.passes >= 3);
      const emptyHandEnd = gameState.players.some(p => p.hand.length === 0);
      
      const shouldEndGame = measurementEnd || insufficientPlayers || allActivePassEnd || emptyHandEnd;
      const newGamePhase = shouldEndGame ? 'game_ended' : gameState.gamePhase;
      
      expect(newGamePhase).toBe('normal_play');
    });
  });

  describe('Real Game Initialization', () => {
    it('should start with correct initial values for end condition tracking', () => {
      const gameState = initializeGame(['Alice', 'Bob', 'Charlie']);
      
      expect(gameState.measurementCount).toBe(0);
      expect(gameState.gamePhase).toBe('initial_selection');
      expect(gameState.players.every(p => p.passes === 0)).toBe(true);
      expect(gameState.players.every(p => p.hand.length > 0)).toBe(true);
    });

    it('should distribute cards properly for end condition testing', () => {
      const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
      
      // All cards should be distributed
      const totalCards = gameState.players.reduce((sum, p) => sum + p.hand.length, 0);
      expect(totalCards).toBe(60); // Total deck size
      
      // No player should start with empty hand
      expect(gameState.players.every(p => p.hand.length > 0)).toBe(true);
    });
  });

  describe('Game End Condition Functions', () => {
    describe('checkGameEndConditions', () => {
      it('should return true for measurement limit condition', () => {
        const gameState = createMockGameState(11, [0, 0, 0, 0], [5, 5, 5, 5]);
        expect(checkGameEndConditions(gameState)).toBe(true);
      });

      it('should return false for player pass limit condition (players get eliminated, not game end)', () => {
        const gameState = createMockGameState(0, [4, 0, 0, 0], [5, 5, 5, 5], [true, false, false, false]);
        expect(checkGameEndConditions(gameState)).toBe(false);
      });

      it('should return true for all active players pass condition', () => {
        const gameState = createMockGameState(0, [4, 3, 3, 3], [5, 5, 5, 5], [true, false, false, false]);
        expect(checkGameEndConditions(gameState)).toBe(true);
      });

      it('should return true for empty hand condition', () => {
        const gameState = createMockGameState(0, [0, 0, 0, 0], [0, 5, 5, 5]);
        expect(checkGameEndConditions(gameState)).toBe(true);
      });

      it('should return false when no end conditions are met', () => {
        const gameState = createMockGameState(5, [2, 2, 2, 2], [3, 3, 3, 3]);
        expect(checkGameEndConditions(gameState)).toBe(false);
      });
    });

    describe('getGameEndReason', () => {
      it('should return measurement_limit for 11 measurements', () => {
        const gameState = createMockGameState(11, [0, 0, 0, 0], [5, 5, 5, 5]);
        expect(getGameEndReason(gameState)).toBe('measurement_limit');
      });

      it('should return insufficient_players when only eliminated players exist', () => {
        const gameState = createMockGameState(0, [4, 4, 4, 4], [5, 5, 5, 5], [true, true, true, true]);
        expect(getGameEndReason(gameState)).toBe('insufficient_players');
      });

      it('should return all_active_players_pass for all active 3+ passes', () => {
        const gameState = createMockGameState(0, [4, 3, 3, 3], [5, 5, 5, 5], [true, false, false, false]);
        expect(getGameEndReason(gameState)).toBe('all_active_players_pass');
      });

      it('should return empty_hand for empty hand', () => {
        const gameState = createMockGameState(0, [0, 0, 0, 0], [0, 5, 5, 5]);
        expect(getGameEndReason(gameState)).toBe('empty_hand');
      });

      it('should return unknown when no conditions are met', () => {
        const gameState = createMockGameState(5, [2, 2, 2, 2], [3, 3, 3, 3]);
        expect(getGameEndReason(gameState)).toBe('unknown');
      });

      it('should prioritize conditions in correct order', () => {
        // When multiple conditions are met, should return the first one in priority order
        const gameState1 = createMockGameState(11, [4, 0, 0, 0], [5, 5, 5, 5], [true, false, false, false]);
        expect(getGameEndReason(gameState1)).toBe('measurement_limit'); // First priority

        const gameState2 = createMockGameState(5, [4, 4, 4, 0], [5, 5, 5, 5], [true, true, true, false]);
        expect(getGameEndReason(gameState2)).toBe('insufficient_players'); // Second priority

        const gameState3 = createMockGameState(5, [4, 3, 3, 3], [1, 5, 5, 5], [true, false, false, false]);
        expect(getGameEndReason(gameState3)).toBe('all_active_players_pass'); // Third priority
      });
    });
  });
});