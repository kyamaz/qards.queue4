// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
export enum CardType {
  INITIAL_QUBIT = 'INITIAL_QUBIT',
  QUBIT = 'QUBIT',
  GATE = 'GATE',
  CONTROL = 'CONTROL',
  TARGET = 'TARGET',
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
  | '⟨0|'
  | '⟨1|'
  | '⟨+|'
  | '⟨-|'
  | 'C'
  | 'T';

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
  eliminated: boolean; // true if player has passed 4 times
}

export type GamePhase = 'initial_selection' | 'normal_play' | 'game_ended';

export interface InitialSelectionState {
  currentPlayerIndex: number; // Index of player currently placing initial cards
  playersCompleted: boolean[]; // Track which players have completed initial placement
  firstPlayerCandidates: string[]; // Players who placed |1⟩ cards
  phaseComplete: boolean;
}

export interface ControlTargetPlacement {
  controlCard: Card;
  controlLane: number;
  controlPosition: number;
  waitingForTarget: boolean;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  board: { lane: (Card | null)[][] }; // Represents multiple qubit lanes, each with a sequence of cards
  currentPlayerId: string;
  turn: number;
  measurementCount: number;
  turnDirection: 'forward' | 'backward';
  gamePhase: GamePhase;
  initialSelection?: InitialSelectionState;
  controlTargetPlacement?: ControlTargetPlacement;
  unitaryCardsPlayedThisTurn: { [playerId: string]: number }; // Track Unitary cards played per player per turn
  firstPlayerId?: string; // ID of the first player (who placed |1⟩ or fallback)
  // Add other game state properties as needed
}
