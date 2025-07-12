export enum CardType {
  INITIAL_QUANTUM_BIT = 'INITIAL_QUANTUM_BIT',
  QUANTUM_BIT = 'QUANTUM_BIT',
  GATE = 'GATE',
  CONTROL = 'CONTROL',
  UNITARY = 'UNITARY',
  MEASUREMENT = 'MEASUREMENT',
}

export type CardValue =
  | '|0⟩'
  | '|1⟩'
  | '|+⟩'
  | '|-⟩'
  | 'I'
  | 'X'
  | 'Z'
  | 'H'
  | 'U'
  | '<0|'
  | '<1|'
  | '<+|'
  | '<-|'
  | 'C';

export interface Card {
  id: string; // Unique identifier for each card instance
  type: CardType;
  value: CardValue;
  // For Control cards, this indicates the connection
  controlLink?: {
    targetLaneIndex: number;
  };
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  passes: number;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  board: { lane: (Card | null)[][] }; // Represents multiple quantum bit lanes, each with a sequence of cards
  currentPlayerId: string;
  turn: number;
  measurementCount: number;
  gameEnded: boolean;
  turnDirection: 'forward' | 'backward';
  // Add other game state properties as needed
}
