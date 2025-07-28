// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { Card, CardType, CardValue, GameState, Player } from './types';
import { initializeInitialSelection } from './initialSelection';
import { v4 as uuidv4 } from 'uuid'; // For unique card IDs

// Helper to generate a specific number of cards of a given type and value
const generateCards = (type: CardType, value: CardValue, count: number): Card[] => {
  return Array.from({ length: count }, () => ({
    id: uuidv4(),
    type,
    value,
  }));
};

// Create the initial deck - total 56 cards (will be 60 with INITIAL_QUBIT cards)
export const createDeck = (): Card[] => {
  let deck: Card[] = [];

  // Qubit Cards (7 total)
  deck = deck.concat(generateCards(CardType.QUBIT, '|+⟩', 2));
  deck = deck.concat(generateCards(CardType.QUBIT, '|-⟩', 2));
  deck = deck.concat(generateCards(CardType.QUBIT, '|0⟩', 2));
  deck = deck.concat(generateCards(CardType.QUBIT, '|1⟩', 1));

  // Gate Cards (8 each for I, X, Z, H, total 32)
  deck = deck.concat(generateCards(CardType.GATE, 'I', 8));
  deck = deck.concat(generateCards(CardType.GATE, 'X', 8));
  deck = deck.concat(generateCards(CardType.GATE, 'Z', 8));
  deck = deck.concat(generateCards(CardType.GATE, 'H', 8));

  // Unitary Cards (2 total)
  deck = deck.concat(generateCards(CardType.UNITARY, 'U', 2));

  // Control Cards (4 total)
  deck = deck.concat(generateCards(CardType.CONTROL, 'C' as CardValue, 4));

  // Note: TARGET cards are not added to the deck - they are automatically created when CONTROL cards are played

  // Measurement Cards (11 total)
  deck = deck.concat(generateCards(CardType.MEASUREMENT, '⟨0|', 4));
  deck = deck.concat(generateCards(CardType.MEASUREMENT, '⟨1|', 3));
  deck = deck.concat(generateCards(CardType.MEASUREMENT, '⟨+|', 2));
  deck = deck.concat(generateCards(CardType.MEASUREMENT, '⟨-|', 2));

  return deck;
};

// Shuffle the deck
export const shuffleDeck = (deck: Card[]): Card[] => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

/**
 * Check if a lane is "finalized" - meaning all UNITARY and TARGET cards are overridden
 * A lane is finalized when:
 * 1. It has a QUBIT or INITIAL_QUBIT card
 * 2. All UNITARY and TARGET cards in the lane have been overridden (replaced by other cards)
 */
const isLaneFinalized = (lane: (Card | null)[]): boolean => {
  
  // Check if there's at least one QUBIT or INITIAL_QUBIT card in the lane
  const hasQubitCard = lane.some(card => 
    card && (card.type === CardType.QUBIT || card.type === CardType.INITIAL_QUBIT)
  );
  
  if (!hasQubitCard) {
    return false;
  }
  
  // Check ALL UNITARY and TARGET cards in the entire lane to see if they are overridden
  // A UNITARY or TARGET card is considered "overridden" only if there is a card placed ON TOP of it (same position)
  // Cards in later positions do NOT override cards in earlier positions
  for (let i = 0; i < lane.length; i++) {
    const card = lane[i];
    if (card && (card.type === CardType.UNITARY || card.type === CardType.TARGET)) {
      // A UNITARY/TARGET card is NOT overridden if it's still visible in the lane
      // In this game, cards can only be overridden by placing another card on top (same position)
      // Since we're checking the visible cards in the lane, any UNITARY/TARGET card we see is NOT overridden
      return false; // This UNITARY or TARGET card is not overridden
    }
  }
  
  // Lane is finalized if:
  // 1. There's at least one QUBIT card, AND
  // 2. ALL UNITARY/TARGET cards in the lane are overridden (or there are none)
  return true;
};


// Validate if a card can be played at a specific position on the board
export const isValidPlay = (
  card: Card,
  targetLaneIndex: number,
  targetPosition: number, // Position within the lane (0-indexed)
  currentBoard: GameState['board'],
  allowUnfinalizedMeasurement?: boolean
): boolean => {
  // Rule: Position must be non-negative
  if (targetPosition < 0) {
    return false;
  }

  // Rule: Lane index must be valid
  if (targetLaneIndex < 0 || targetLaneIndex >= currentBoard.lane.length) {
    return false;
  }

  const lane = currentBoard.lane[targetLaneIndex];

  if (!lane) {
    return false; // Lane does not exist
  }

  const existingCard = lane[targetPosition] || null;
  const previousCard = targetPosition > 0 ? lane[targetPosition - 1] : null;

  // Rule: Cannot place beyond the current end of the lane, unless placing on an existing card.
  if (targetPosition > lane.length) {
    return false;
  }

  // If placing at the end of the lane (appending)
  if (targetPosition === lane.length) {
    switch (card.type) {
      case CardType.INITIAL_QUBIT:
        // Initial Qubit Cards: Can be placed after a Measurement card or initial I gate.
        if (previousCard) {
          if (previousCard.type === CardType.MEASUREMENT) {
            return true;
          }
          if (previousCard.value === 'I' && lane.length === 1) {
              return true;
          }
          return false; // Cannot place after other types of cards
        }
        return false; // Should not happen if I gate is always present

      case CardType.QUBIT:
        // Qubit Cards: Can ONLY be placed after Measurement cards.
        if (previousCard) {
          if (previousCard.type === CardType.MEASUREMENT) {
            return true;
          }
          return false; // Cannot place after any other card types
        }
        return false; // Cannot place if no previous card

    case CardType.GATE:
      // Gate Cards (I, X, Z, H):
      // - Cannot be placed after a Measurement card.
      if (previousCard && previousCard.type === CardType.MEASUREMENT) {
        return false;
      }
      return true;

    case CardType.UNITARY:
      // Unitary Cards (U):
      // - Cannot be placed after a Measurement card.
      if (previousCard && previousCard.type === CardType.MEASUREMENT) {
        return false;
      }
      // - Cannot place U on top of another U.
      if (previousCard && previousCard.type === CardType.UNITARY) {
        return false;
      }
      return true;

    case CardType.MEASUREMENT:
      // Measurement Cards:
      // - Can be placed after any card except other Measurement cards.
      if (previousCard) {
        if (previousCard.type === CardType.MEASUREMENT) {
          return false; // Cannot place after another Measurement card
        }
        
        if (!allowUnfinalizedMeasurement) {
          // Check if lane has any qubit card first
          const hasQubitCard = lane.some(card => 
            card && (card.type === CardType.QUBIT || card.type === CardType.INITIAL_QUBIT)
          );
          
          if (hasQubitCard) {
            // Check if the ENTIRE lane is finalized (no unoverridden UNITARY/TARGET anywhere)
            const laneFinalized = isLaneFinalized(lane);
            
            if (!laneFinalized) {
              return false; // Cannot place measurement card in unfinalized lane that has qubit cards
            }
          } else {
            return false; // Cannot place measurement card in lane without qubit cards
          }
        }
        
        return true; // Can place after any other card type
      }
      return false; // Cannot place if no previous card

    case CardType.CONTROL:
      // This is handled by isValidControlCardPlay, so return false here.
      return false;

    case CardType.TARGET:
      // TARGET cards cannot be manually placed - they are auto-generated
      return false;

    default:
      return false; // Unknown card type
    }
  } else { // If placing on an existing card or in an empty slot mid-lane
    if (!existingCard) {
      // Placing in an empty slot mid-lane.
      // For now, we allow any non-control, non-target card to be placed here.
      return card.type !== CardType.CONTROL && card.type !== CardType.TARGET;
    }

    // Placing ON TOP of an existing card.
    switch (card.type) {
      case CardType.GATE:
        // Gate Cards: Can be placed on a Unitary card or Target card.
        return existingCard.type === CardType.UNITARY || existingCard.type === CardType.TARGET;

      // Other card types cannot be placed on top of existing cards by default.
      default:
        return false;
    }
  }
};

export const isValidControlCardPlay = (
  controlLaneIndex: number,
  targetLaneIndex: number,
  position: number, // The column index where the control card is being placed
  board: GameState['board']
): boolean => {
  // Rule: Target lane must be adjacent to control lane
  if (Math.abs(controlLaneIndex - targetLaneIndex) !== 1) {
    console.error("Validation Fail: Target lane must be adjacent.");
    return false;
  }

  const controlLane = board.lane[controlLaneIndex];
  const targetLane = board.lane[targetLaneIndex];

  // Rule: Both lanes must exist
  if (!controlLane || !targetLane) {
    console.error("Validation Fail: Control or target lane does not exist.");
    return false;
  }

  // Rule: The position must be valid for the control lane.
  // It can be an empty slot or at the very end.
  if (position > controlLane.length) {
      console.error("Validation Fail: Position is outside the bounds of the control lane.");
      return false;
  }

  // Rule: The slot in the control lane must be empty.
  if (controlLane[position]) {
      console.error("Validation Fail: The slot in the control lane is already occupied.");
      return false;
  }

  // Rule: The target lane must have a card at the same position to be the target.
  if (position >= targetLane.length) {
    console.error("Validation Fail: No card to target in the target lane at the specified position.");
    return false;
  }

  const targetCard = targetLane[position];

  // Rule: Target card must exist and be of a valid type.
  if (!targetCard) {
    console.error("Validation Fail: Target slot is empty.");
    return false;
  }

  // Rule: Target card must be a GATE or another CONTROL card.
  if (targetCard.type !== CardType.GATE && targetCard.type !== CardType.CONTROL) {
    console.error(`Validation Fail: Target card type is invalid (${targetCard.type}).`);
    return false;
  }

  // Rule: H (Hadamard gate) cannot be a target.
  if (targetCard.value === 'H') {
    console.error("Validation Fail: Hadamard (H) gate cannot be a target.");
    return false;
  }

  // All checks passed
  return true;
};


// Initialize the game state
// Calculate measurement score based on qubit and measurement card compatibility
export const calculateMeasurementScore = (quantumBitValue: string, measurementValue: string): number => {
  // New scoring system based on measurement outcomes:
  // Measurement result '1' = +5 points, measurement result '0' = +3 points
  
  // Determine measurement outcome based on quantum state and measurement basis
  const measurementOutcome = determineMeasurementOutcome(quantumBitValue, measurementValue);
  
  return measurementOutcome === '1' ? 5 : 3;
};

/**
 * Determine the most likely measurement outcome for a given quantum state and measurement basis
 */
const determineMeasurementOutcome = (quantumBitValue: string, measurementValue: string): string => {
  // Based on quantum mechanics, determine the most likely outcome
  switch (quantumBitValue) {
    case '|0⟩':
      // |0⟩ always measures as 0 in computational basis
      if (measurementValue === '⟨0|' || measurementValue === '⟨1|') return '0';
      // |0⟩ has 50% probability for both outcomes in +/- basis, return '0' as default
      return '0';
    
    case '|1⟩':
      // |1⟩ always measures as 1 in computational basis
      if (measurementValue === '⟨0|' || measurementValue === '⟨1|') return '1';
      // |1⟩ has 50% probability for both outcomes in +/- basis, return '1' as default
      return '1';
    
    case '|+⟩':
      // |+⟩ has equal probability for both outcomes in computational basis, return '0' as default
      if (measurementValue === '⟨0|' || measurementValue === '⟨1|') return '0';
      // |+⟩ always measures as + (outcome 0) in +/- basis when measuring ⟨+|
      // |+⟩ always measures as + (outcome 0) in +/- basis when measuring ⟨-|
      return '0';
    
    case '|-⟩':
      // |-⟩ has equal probability for both outcomes in computational basis, return '0' as default  
      if (measurementValue === '⟨0|' || measurementValue === '⟨1|') return '0';
      // |-⟩ always measures as - (outcome 1) in +/- basis when measuring ⟨+|
      // |-⟩ always measures as - (outcome 1) in +/- basis when measuring ⟨-|
      return '1';
    
    default:
      return '0';
  }
};

// Find the qubit card that precedes a measurement card in a lane
export const findPrecedingQubit = (lane: (Card | null)[], measurementPosition: number): Card | null => {
  // Look backwards from the measurement position to find the most recent qubit
  for (let i = measurementPosition - 1; i >= 0; i--) {
    const card = lane[i];
    if (card && (card.type === CardType.QUBIT || card.type === CardType.INITIAL_QUBIT)) {
      return card;
    }
  }
  return null;
};

export const initializeGame = (playerNames: string[]): GameState => {
  if (playerNames.length < 3 || playerNames.length > 6) {
    throw new Error('Player count must be between 3 and 6.');
  }

  // 1. Create Players
  const players: Player[] = playerNames.map(name => ({
    id: uuidv4(),
    name,
    hand: [],
    score: 0,
    passes: 0,
  }));

  // 2. Create complete deck including INITIAL_QUBIT cards
  let completeDeck = createDeck();
  
  // Add INITIAL_QUBIT cards to the deck
  const initialCards: Card[] = [
    ...generateCards(CardType.INITIAL_QUBIT, '|0⟩', 3),
    ...generateCards(CardType.INITIAL_QUBIT, '|1⟩', 1),
  ];
  
  completeDeck = [...completeDeck, ...initialCards];
  completeDeck = shuffleDeck(completeDeck);

  // 3. Distribute all cards randomly among players
  let cardIndex = 0;
  while (cardIndex < completeDeck.length) {
    for (const player of players) {
      if (completeDeck[cardIndex]) {
        player.hand.push(completeDeck[cardIndex]);
        cardIndex++;
      } else {
        break;
      }
    }
  }
  
  // 4. Prepare the empty board (no I gates initially)
  const board: { lane: (Card | null)[][] } = { lane: [] };
  const numLanes = 4;
  for (let i = 0; i < numLanes; i++) {
    board.lane.push([]); // Start with empty lanes
  }

  // 5. Initialize initial selection state
  const initialSelectionState = initializeInitialSelection(players);

  return {
    players,
    deck: [], // All cards are already distributed
    board,
    currentPlayerId: players[initialSelectionState.currentPlayerIndex].id, // Set to initial selection player
    turn: 1,
    measurementCount: 0,
    turnDirection: 'forward',
    gamePhase: 'initial_selection',
    initialSelection: initialSelectionState,
    unitaryCardsPlayedThisTurn: {},
    firstPlayerId: undefined, // Will be set after initial selection
  };
};

// Validate if a control card can be placed at the specified position
export const isValidControlPlacement = (
  gameState: GameState,
  controlLane: number,
  controlPosition: number
): boolean => {
  // Control position must be empty
  if (gameState.board.lane[controlLane]?.[controlPosition]) {
    return false;
  }

  // Control lane must have cards in all preceding positions (no gaps allowed)
  const controlLaneCards = gameState.board.lane[controlLane];
  for (let i = 0; i < controlPosition; i++) {
    if (i >= controlLaneCards.length || controlLaneCards[i] === null) {
      return false;
    }
  }

  return true;
};

// Start the CONTROL-TARGET placement process
export const startControlTargetPlacement = (
  gameState: GameState,
  controlCard: Card,
  controlLane: number,
  controlPosition: number
): GameState => {
  // Validate control placement before starting
  if (!isValidControlPlacement(gameState, controlLane, controlPosition)) {
    throw new Error('Invalid control card placement: gaps detected in preceding positions');
  }

  return {
    ...gameState,
    controlTargetPlacement: {
      controlCard,
      controlLane,
      controlPosition,
      waitingForTarget: true,
    },
  };
};

// Complete the CONTROL-TARGET placement by placing both cards
export const completeControlTargetPlacement = (
  gameState: GameState,
  targetLane: number
): GameState => {
  if (!gameState.controlTargetPlacement || !gameState.controlTargetPlacement.waitingForTarget) {
    throw new Error('No pending control-target placement');
  }

  // Validate target lane placement
  if (!isValidTargetLane(gameState, targetLane)) {
    throw new Error('Invalid target lane for control-target placement');
  }

  const { controlCard, controlLane, controlPosition } = gameState.controlTargetPlacement;

  // Create TARGET card
  const targetCard: Card = {
    id: uuidv4(),
    type: CardType.TARGET,
    value: 'T' as CardValue,
    controlLink: {
      targetLaneIndex: controlLane, // TARGET points back to CONTROL
    },
  };

  // Update CONTROL card with target link
  const updatedControlCard: Card = {
    ...controlCard,
    controlLink: {
      targetLaneIndex: targetLane,
    },
  };

  // Create new board with both cards placed
  const newBoard = { ...gameState.board };
  
  // Ensure lanes exist and have enough positions
  while (newBoard.lane.length <= Math.max(controlLane, targetLane)) {
    newBoard.lane.push([]);
  }
  
  while (newBoard.lane[controlLane].length <= controlPosition) {
    newBoard.lane[controlLane].push(null);
  }
  
  while (newBoard.lane[targetLane].length <= controlPosition) {
    newBoard.lane[targetLane].push(null);
  }

  // Place the cards
  newBoard.lane[controlLane][controlPosition] = updatedControlCard;
  newBoard.lane[targetLane][controlPosition] = targetCard;

  // Remove card from current player's hand
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  if (!currentPlayer) {
    throw new Error('Current player not found');
  }

  const updatedPlayers = gameState.players.map(player => {
    if (player.id === gameState.currentPlayerId) {
      return {
        ...player,
        hand: player.hand.filter(card => card.id !== controlCard.id),
      };
    }
    return player;
  });

  return {
    ...gameState,
    board: newBoard,
    players: updatedPlayers,
    controlTargetPlacement: undefined, // Clear the pending placement
  };
};

// Cancel the CONTROL-TARGET placement
export const cancelControlTargetPlacement = (gameState: GameState): GameState => {
  return {
    ...gameState,
    controlTargetPlacement: undefined,
  };
};

// Validate if a target lane is valid for control placement
export const isValidTargetLane = (
  gameState: GameState,
  targetLane: number
): boolean => {
  if (!gameState.controlTargetPlacement || !gameState.controlTargetPlacement.waitingForTarget) {
    return false;
  }

  const { controlLane, controlPosition } = gameState.controlTargetPlacement;

  // Target lane must be adjacent to control lane
  if (Math.abs(controlLane - targetLane) !== 1) {
    return false;
  }

  // Target lane must exist
  if (targetLane < 0 || targetLane >= gameState.board.lane.length) {
    return false;
  }

  // Target position must be empty or not exist yet (will be created)
  if (gameState.board.lane[targetLane].length > controlPosition) {
    if (gameState.board.lane[targetLane][controlPosition] !== null) {
      return false;
    }
  }

  // Both lanes must have cards in all preceding positions (no gaps allowed)
  const controlLaneCards = gameState.board.lane[controlLane];
  const targetLaneCards = gameState.board.lane[targetLane];

  // Check control lane: all positions before controlPosition must be filled
  for (let i = 0; i < controlPosition; i++) {
    if (i >= controlLaneCards.length || controlLaneCards[i] === null) {
      return false;
    }
  }

  // Check target lane: all positions before controlPosition must be filled
  for (let i = 0; i < controlPosition; i++) {
    if (i >= targetLaneCards.length || targetLaneCards[i] === null) {
      return false;
    }
  }

  // Check if TARGET card can be placed: preceding card must not be a Measurement card
  if (controlPosition > 0 && targetLaneCards.length > controlPosition - 1) {
    const precedingCard = targetLaneCards[controlPosition - 1];
    if (precedingCard && precedingCard.type === CardType.MEASUREMENT) {
      return false; // Cannot place TARGET after a Measurement card
    }
  }

  return true;
};


// Calculate final scores and determine winner
export const calculateFinalScores = (gameState: GameState): { player: Player; finalScore: number }[] => {
  return gameState.players.map(player => {
    const measurementScore = player.score; // Points earned from measurements
    const handPenalty = player.hand.length; // 1 point deduction per remaining card
    const finalScore = measurementScore - handPenalty;
    
    return {
      player,
      finalScore
    };
  });
};

// Determine the winner based on final scores
export const determineWinner = (gameState: GameState): { winner: Player; finalScores: { player: Player; finalScore: number }[] } => {
  const finalScores = calculateFinalScores(gameState);
  
  // Sort by final score (highest first)
  const sortedScores = finalScores.sort((a, b) => b.finalScore - a.finalScore);
  
  const winner = sortedScores[0].player;
  
  return {
    winner,
    finalScores: sortedScores
  };
};

// Check if a player can play a Unitary card (limit: one per turn)
export const canPlayUnitaryCard = (gameState: GameState, playerId: string): boolean => {
  const unitaryCardsPlayed = gameState.unitaryCardsPlayedThisTurn[playerId] || 0;
  return unitaryCardsPlayed < 1;
};

// Reset Unitary card counters when advancing to the next turn (full round completed)
export const resetUnitaryCardCounters = (gameState: GameState): GameState => {
  return {
    ...gameState,
    unitaryCardsPlayedThisTurn: {}
  };
};

// Increment Unitary card counter for a player
export const incrementUnitaryCardCounter = (gameState: GameState, playerId: string): GameState => {
  const currentCount = gameState.unitaryCardsPlayedThisTurn[playerId] || 0;
  return {
    ...gameState,
    unitaryCardsPlayedThisTurn: {
      ...gameState.unitaryCardsPlayedThisTurn,
      [playerId]: currentCount + 1
    }
  };
};

// Distribute main deck cards after initial selection is complete
export const distributeMainDeck = (gameState: GameState): GameState => {
  if (gameState.gamePhase !== 'normal_play') {
    throw new Error('Main deck can only be distributed after initial selection is complete');
  }

  let deck = [...gameState.deck];
  
  // Shuffle the deck before distribution
  deck = shuffleDeck(deck);
  
  // Deep copy players with their hands
  const players = gameState.players.map(player => ({
    ...player,
    hand: [...player.hand]
  }));
  
  // Distribute cards evenly among players
  let cardIndex = 0;
  while (cardIndex < deck.length) {
    for (const player of players) {
      if (deck[cardIndex]) {
        player.hand.push(deck[cardIndex]);
        cardIndex++;
      } else {
        break;
      }
    }
  }

  return {
    ...gameState,
    players,
    deck: [] // Deck is now empty as all cards are distributed
  };
};
