import { Card, CardType, CardValue, GameState, Player } from './types';
import { v4 as uuidv4 } from 'uuid'; // For unique card IDs

// Helper to generate a specific number of cards of a given type and value
const generateCards = (type: CardType, value: CardValue, count: number): Card[] => {
  return Array.from({ length: count }, () => ({
    id: uuidv4(),
    type,
    value,
  }));
};

// Create the initial deck of 60 cards
export const createDeck = (): Card[] => {
  let deck: Card[] = [];

  // Quantum Bit Cards
  deck = deck.concat(generateCards(CardType.QUANTUM_BIT, '|+⟩', 4));
  deck = deck.concat(generateCards(CardType.QUANTUM_BIT, '|-⟩', 4));

  // Gate Cards (7 each for I, X, Z, H, total 28)
  deck = deck.concat(generateCards(CardType.GATE, 'I', 7));
  deck = deck.concat(generateCards(CardType.GATE, 'X', 7));
  deck = deck.concat(generateCards(CardType.GATE, 'Z', 7));
  deck = deck.concat(generateCards(CardType.GATE, 'H', 7));

  // Unitary Cards (8 total)
  deck = deck.concat(generateCards(CardType.UNITARY, 'U', 8));

  // Control Cards (8 total)
  // For simplicity, we'll use a generic 'C' value for Control cards for now.
  // This might need refinement if different control card types are introduced.
  deck = deck.concat(generateCards(CardType.CONTROL, 'C' as CardValue, 8)); // 'C' is a placeholder value

  // Measurement Cards (2 each, total 8)
  deck = deck.concat(generateCards(CardType.MEASUREMENT, '<0|', 2));
  deck = deck.concat(generateCards(CardType.MEASUREMENT, '<1|', 2));
  deck = deck.concat(generateCards(CardType.MEASUREMENT, '<+|', 2));
  deck = deck.concat(generateCards(CardType.MEASUREMENT, '<-|', 2));


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

// Validate if a card can be played at a specific position on the board
export const isValidPlay = (
  card: Card,
  targetLaneIndex: number,
  targetPosition: number, // Position within the lane (0-indexed)
  currentBoard: GameState['board']
): boolean => {
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
      case CardType.INITIAL_QUANTUM_BIT: // Fall-through
      case CardType.QUANTUM_BIT:
        // Quantum Bit Cards: Can be placed after a Measurement card or initial I gate.
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
      // - Implied: Can be placed after a Quantum Bit card.
      if (previousCard && previousCard.type === CardType.QUANTUM_BIT) {
        return true;
      }
      return false; // Cannot place after other types or if no previous card

    case CardType.CONTROL:
      // This is handled by isValidControlCardPlay, so return false here.
      return false;

    default:
      return false; // Unknown card type
    }
  } else { // If placing on an existing card or in an empty slot mid-lane
    if (!existingCard) {
      // Placing in an empty slot mid-lane.
      // For now, we allow any non-control card to be placed here.
      return card.type !== CardType.CONTROL;
    }

    // Placing ON TOP of an existing card.
    switch (card.type) {
      case CardType.GATE:
        // Gate Cards: Can be placed on a Unitary card.
        return existingCard.type === CardType.UNITARY;

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
export const initializeGame = (playerNames: string[]): GameState => {
  if (playerNames.length < 3 || playerNames.length > 5) {
    throw new Error('Player count must be between 3 and 5.');
  }

  // 1. Create Players
  const players: Player[] = playerNames.map(name => ({
    id: uuidv4(),
    name,
    hand: [],
    score: 0,
    passes: 0,
  }));

  // 2. Create and distribute Initial State Cards
  let initialCards: Card[] = [
    ...generateCards(CardType.INITIAL_QUANTUM_BIT, '|0⟩', 3),
    ...generateCards(CardType.INITIAL_QUANTUM_BIT, '|1⟩', 1),
  ];
  initialCards = shuffleDeck(initialCards);

  let startPlayerId = '';
  players.forEach((player, index) => {
    const card = initialCards.pop();
    if (card) {
      player.hand.push(card);
      if (card.value === '|1⟩') {
        startPlayerId = player.id;
      }
    }
  });
  
  // Fallback if the |1> card was not distributed (e.g., more than 4 players)
  if (!startPlayerId) {
    startPlayerId = players[0].id;
  }

  // 3. Prepare the main deck
  let mainDeck = createDeck();
  
  // 4. Prepare the board with I gates
  const iCards = mainDeck.filter(card => card.value === 'I');
  mainDeck = mainDeck.filter(card => card.value !== 'I');
  
  const board: { lane: (Card | null)[][] } = { lane: [] };
  const numLanes = 4;
  for (let i = 0; i < numLanes; i++) {
    board.lane.push([iCards.pop() || null]);
  }

  // 5. Distribute the rest of the main deck
  mainDeck = shuffleDeck(mainDeck);
  let cardIndex = 0;
  while (cardIndex < mainDeck.length) {
    for (const player of players) {
      if (mainDeck[cardIndex]) {
        player.hand.push(mainDeck[cardIndex]);
        cardIndex++;
      } else {
        break;
      }
    }
  }

  return {
    players,
    deck: mainDeck,
    board,
    currentPlayerId: startPlayerId,
    turn: 1,
    measurementCount: 0,
    gameEnded: false,
    turnDirection: 'forward',
  };
};