// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Initial player selection logic for qards4
 * Handles the pre-game phase where players place INITIAL_QUBIT cards
 */

import { GameState, Player, Card, CardType, InitialSelectionState } from './types';

/**
 * Initialize the initial selection phase
 */
export const initializeInitialSelection = (players: Player[]): InitialSelectionState => {
  return {
    currentPlayerIndex: 0,
    playersCompleted: new Array(players.length).fill(false),
    firstPlayerCandidates: [],
    phaseComplete: false
  };
};

/**
 * Check if a player has INITIAL_QUBIT cards in their hand
 */
export const hasInitialQubitCards = (player: Player): boolean => {
  return player.hand.some(card => card.type === CardType.INITIAL_QUBIT);
};

/**
 * Get all INITIAL_QUBIT cards from a player's hand
 */
export const getInitialQubitCards = (player: Player): Card[] => {
  return player.hand.filter(card => card.type === CardType.INITIAL_QUBIT);
};

/**
 * Place INITIAL_QUBIT cards on the board
 */
export const placeInitialQubitCards = (
  gameState: GameState,
  playerId: string,
  cardsToPlace: Card[]
): GameState => {
  const newGameState = { ...gameState };
  const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error(`Player ${playerId} not found`);
  }

  // Create new board with placed cards
  const newBoard = {
    lane: gameState.board.lane.map(lane => [...lane])
  };

  // Place each INITIAL_QUBIT card in the leftmost position of each lane
  let laneIndex = 0;
  const firstPlayerCandidates = [...(gameState.initialSelection?.firstPlayerCandidates || [])];

  for (const card of cardsToPlace) {
    if (card.type !== CardType.INITIAL_QUBIT) {
      throw new Error(`Card ${card.id} is not an INITIAL_QUBIT card`);
    }

    // Find the next available lane
    while (laneIndex < newBoard.lane.length && newBoard.lane[laneIndex].length > 0) {
      laneIndex++;
    }

    if (laneIndex >= newBoard.lane.length) {
      throw new Error('No available lanes for INITIAL_QUBIT placement');
    }

    // Place the card at position 0 of the lane
    newBoard.lane[laneIndex] = [card];

    // Check if this is a |1⟩ card for first player determination
    if (card.value === '|1⟩' && !firstPlayerCandidates.includes(playerId)) {
      firstPlayerCandidates.push(playerId);
    }

    laneIndex++;
  }

  // Remove cards from player's hand
  const newPlayers = newGameState.players.map(player => {
    if (player.id === playerId) {
      const cardIds = cardsToPlace.map(c => c.id);
      return {
        ...player,
        hand: player.hand.filter(card => !cardIds.includes(card.id))
      };
    }
    return player;
  });

  // Update initial selection state
  const newPlayersCompleted = [...(gameState.initialSelection?.playersCompleted || [])];
  newPlayersCompleted[playerIndex] = true;

  const allPlayersCompleted = newPlayersCompleted.every(completed => completed);

  return {
    ...newGameState,
    players: newPlayers,
    board: newBoard,
    initialSelection: {
      currentPlayerIndex: gameState.initialSelection?.currentPlayerIndex || 0,
      playersCompleted: newPlayersCompleted,
      firstPlayerCandidates,
      phaseComplete: allPlayersCompleted
    }
  };
};

/**
 * Skip a player's turn if they have no INITIAL_QUBIT cards
 */
export const skipPlayerInitialSelection = (gameState: GameState, playerId: string): GameState => {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error(`Player ${playerId} not found`);
  }

  const newPlayersCompleted = [...(gameState.initialSelection?.playersCompleted || [])];
  newPlayersCompleted[playerIndex] = true;

  const allPlayersCompleted = newPlayersCompleted.every(completed => completed);

  return {
    ...gameState,
    initialSelection: {
      ...gameState.initialSelection!,
      playersCompleted: newPlayersCompleted,
      phaseComplete: allPlayersCompleted
    }
  };
};

/**
 * Advance to the next player in initial selection
 */
export const advanceInitialSelectionPlayer = (gameState: GameState): GameState => {
  if (!gameState.initialSelection) {
    throw new Error('Initial selection state not initialized');
  }

  const currentIndex = gameState.initialSelection.currentPlayerIndex;
  const nextIndex = (currentIndex + 1) % gameState.players.length;
  const nextPlayer = gameState.players[nextIndex];

  return {
    ...gameState,
    currentPlayerId: nextPlayer.id, // Update currentPlayerId to match initial selection
    initialSelection: {
      ...gameState.initialSelection,
      currentPlayerIndex: nextIndex
    }
  };
};

/**
 * Determine the first player based on placed INITIAL_QUBIT cards
 */
export const determineFirstPlayer = (gameState: GameState): string => {
  if (!gameState.initialSelection) {
    throw new Error('Initial selection state not initialized');
  }

  const { firstPlayerCandidates } = gameState.initialSelection;

  // If someone placed a |1⟩ card, they go first
  if (firstPlayerCandidates.length > 0) {
    // If multiple players have |1⟩ cards, use player order (first in list wins)
    return firstPlayerCandidates[0];
  }

  // If no one has |1⟩, use the first player in the player list as fallback
  return gameState.players[0].id;
};

/**
 * Complete the initial selection phase and transition to normal play
 * Note: Main deck distribution should be handled by the caller after this function
 */
export const completeInitialSelection = (gameState: GameState): GameState => {
  if (!gameState.initialSelection?.phaseComplete) {
    throw new Error('Initial selection phase not complete');
  }

  const firstPlayerId = determineFirstPlayer(gameState);

  return {
    ...gameState,
    gamePhase: 'normal_play' as const,
    currentPlayerId: firstPlayerId,
    firstPlayerId, // Store the first player ID for turn counting
    initialSelection: undefined // Clear initial selection state
  };
};

/**
 * Check if current player needs to place INITIAL_QUBIT cards
 */
export const shouldPlaceInitialCards = (gameState: GameState): boolean => {
  if (gameState.gamePhase !== 'initial_selection' || !gameState.initialSelection) {
    return false;
  }

  const currentPlayerIndex = gameState.initialSelection.currentPlayerIndex;
  const currentPlayer = gameState.players[currentPlayerIndex];
  
  return hasInitialQubitCards(currentPlayer) && 
         !gameState.initialSelection.playersCompleted[currentPlayerIndex];
};

/**
 * Check if all players have completed initial selection
 */
export const isInitialSelectionComplete = (gameState: GameState): boolean => {
  return gameState.initialSelection?.phaseComplete || false;
};