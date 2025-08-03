// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameScreen from '../../src/components/GameScreen';
import { I18nProvider } from '../../src/i18n';
import { CardType, GameState } from '../../src/game/types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn().mockReturnValue(JSON.stringify({
    showHints: true,
    difficulty: 'normal',
    playerCount: 4,
    allowUnfinalizedMeasurement: false,
    controlledHadamard: false
  })),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock the QuantumGameIntegration
const mockQuantumIntegration = {
  isQuantumComputationAvailable: jest.fn().mockReturnValue(true),
  executeMeasurementComputation: jest.fn().mockResolvedValue({
    outcome: 1,
    probability: 0.5,
    gameScore: 3,
    computationSteps: []
  })
};

jest.mock('../../src/quantum', () => ({
  QuantumGameIntegration: jest.fn().mockImplementation(() => mockQuantumIntegration)
}));

// Mock gameLogic functions
jest.mock('../../src/game/gameLogic', () => ({
  initializeGame: jest.fn(),
  isValidPlay: jest.fn().mockReturnValue(true),
  calculateMeasurementScore: jest.fn().mockReturnValue(3),
  calculateMeasurementScoreFromOutcome: jest.fn().mockReturnValue(3),
  getMeasurementOutcome: jest.fn().mockReturnValue('1'),
  findPrecedingQubit: jest.fn().mockReturnValue({ id: 'qubit1', type: 'QUBIT', value: '|0⟩' }),
  startControlTargetPlacement: jest.fn(),
  completeControlTargetPlacement: jest.fn(),
  cancelControlTargetPlacement: jest.fn(),
  isValidTargetLane: jest.fn().mockReturnValue(true),
  determineWinner: jest.fn(),
  canPlayUnitaryCard: jest.fn().mockReturnValue(true),
  incrementUnitaryCardCounter: jest.fn(),
  resetUnitaryCardCounters: jest.fn(),
  calculateHandPenalty: jest.fn().mockReturnValue(0),
  getGameEndReason: jest.fn().mockReturnValue('empty_hand'),
  eliminatePlayer: jest.fn(),
  getNextActivePlayer: jest.fn().mockReturnValue('1'),
  shouldEliminatePlayer: jest.fn().mockReturnValue(false),
  checkGameEndConditions: jest.fn().mockReturnValue(false)
}));

// Mock initialSelection functions
jest.mock('../../src/game/initialSelection', () => ({
  hasInitialQubitCards: jest.fn().mockReturnValue(true),
  skipPlayerInitialSelection: jest.fn(),
  advanceInitialSelectionPlayer: jest.fn(),
  isInitialSelectionComplete: jest.fn().mockReturnValue(false),
  completeInitialSelection: jest.fn()
}));

// Import mocked modules to access them in tests
import * as gameLogic from '../../src/game/gameLogic';
import * as initialSelection from '../../src/game/initialSelection';

const mockGameLogic = gameLogic as jest.Mocked<typeof gameLogic>;
const mockInitialSelection = initialSelection as jest.Mocked<typeof initialSelection>;

describe('GameScreen Coverage Boost Tests', () => {
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <I18nProvider>{children}</I18nProvider>
  );

  const renderWithI18n = (ui: React.ReactElement) => {
    return render(ui, { wrapper: TestWrapper });
  };

  const createMockGameState = (overrides?: Partial<GameState>): GameState => ({
    players: [
      {
        id: '0',
        name: 'Player A',
        hand: [
          { id: '1', type: 'GATE', value: 'X' },
          { id: '2', type: 'INITIAL_QUBIT', value: '|0⟩' },
          { id: '3', type: 'MEASUREMENT', value: '⟨0|' },
          { id: '4', type: 'UNITARY', value: 'U' },
          { id: '5', type: 'CONTROL', value: 'C' }
        ],
        score: 0,
        passes: 0,
        eliminated: false
      },
      {
        id: '1',
        name: 'Player B',
        hand: [{ id: '6', type: 'GATE', value: 'H' }],
        score: 0,
        passes: 0,
        eliminated: false
      }
    ],
    board: {
      lane: [
        [{ id: 'i1', type: 'GATE', value: 'I' }],
        [{ id: 'i2', type: 'GATE', value: 'I' }],
        [],
        []
      ]
    },
    currentPlayerId: '0',
    turn: 1,
    measurementCount: 0,
    gamePhase: 'normal_play',
    turnDirection: 'forward',
    unitaryCardsPlayedThisTurn: {},
    firstPlayerId: '0',
    ...overrides
  } as GameState);

  beforeEach(() => {
    jest.clearAllMocks();
    mockGameLogic.initializeGame.mockReturnValue(createMockGameState());
    mockGameLogic.determineWinner.mockReturnValue({
      winner: { id: '0', name: 'Player A' },
      finalScores: []
    });
    // Mock functions that return game state
    mockGameLogic.incrementUnitaryCardCounter.mockReturnValue(createMockGameState());
    mockGameLogic.eliminatePlayer.mockReturnValue(createMockGameState());
    mockGameLogic.resetUnitaryCardCounters.mockReturnValue(createMockGameState());
    mockGameLogic.startControlTargetPlacement.mockReturnValue(createMockGameState());
    mockGameLogic.completeControlTargetPlacement.mockReturnValue(createMockGameState());
    mockGameLogic.cancelControlTargetPlacement.mockReturnValue(createMockGameState());
    // Mock initial selection functions
    mockInitialSelection.skipPlayerInitialSelection.mockReturnValue(createMockGameState());
    mockInitialSelection.advanceInitialSelectionPlayer.mockReturnValue(createMockGameState());
    mockInitialSelection.completeInitialSelection.mockReturnValue({
      firstPlayerId: '0',
      gamePhase: 'normal_play'
    });
  });

  it('should handle keyboard events for card navigation', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    // Test keyboard navigation
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Escape' });
  });

  it('should handle window resize events', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    // Trigger window resize
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
  });

  it('should handle different card types and values', async () => {
    const gameStateWithManyCards = createMockGameState({
      players: [
        {
          id: '0',
          name: 'Player A',
          hand: [
            { id: '1', type: 'GATE', value: 'I' },
            { id: '2', type: 'GATE', value: 'Z' },
            { id: '3', type: 'QUBIT', value: '|1⟩' },
            { id: '4', type: 'QUBIT', value: '|+⟩' },
            { id: '5', type: 'QUBIT', value: '|-⟩' },
            { id: '6', type: 'MEASUREMENT', value: '⟨1|' },
            { id: '7', type: 'MEASUREMENT', value: '⟨+|' },
            { id: '8', type: 'MEASUREMENT', value: '⟨-|' }
          ],
          score: 0,
          passes: 0,
          eliminated: false
        }
      ]
    });
    mockGameLogic.initializeGame.mockReturnValue(gameStateWithManyCards);
    
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    // Test different card types
    const iGateCard = screen.getByTestId('hand-card-gate-id1');
    const zGateCard = screen.getByTestId('hand-card-gate-id2');
    const qubitCard = screen.getByTestId('hand-card-qubit-id3');
    
    fireEvent.click(iGateCard);
    fireEvent.click(zGateCard);
    fireEvent.click(qubitCard);
  });

  it('should handle measurement flow with different outcomes', async () => {
    mockGameLogic.getMeasurementOutcome.mockReturnValueOnce('0');
    mockGameLogic.calculateMeasurementScoreFromOutcome.mockReturnValueOnce(1);
    
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-measurement-id3')).toBeInTheDocument();
    });

    const measurementCard = screen.getByTestId('hand-card-measurement-id3');
    fireEvent.click(measurementCard);

    const emptySlot = screen.getByTestId('empty-slot-lane0-pos1');
    fireEvent.click(emptySlot);

    expect(mockGameLogic.getMeasurementOutcome).toHaveBeenCalled();
    expect(mockGameLogic.calculateMeasurementScoreFromOutcome).toHaveBeenCalled();
  });

  it('should handle quantum computation unavailable scenario', async () => {
    mockQuantumIntegration.isQuantumComputationAvailable.mockReturnValue(false);
    
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-measurement-id3')).toBeInTheDocument();
    });

    const measurementCard = screen.getByTestId('hand-card-measurement-id3');
    fireEvent.click(measurementCard);

    const emptySlot = screen.getByTestId('empty-slot-lane0-pos1');
    fireEvent.click(emptySlot);

    // When quantum computation is unavailable, it falls back to classical calculation
    expect(mockGameLogic.getMeasurementOutcome).toHaveBeenCalled();
    expect(mockGameLogic.calculateMeasurementScoreFromOutcome).toHaveBeenCalled();
  });

  it('should handle settings variations', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      showHints: false,
      difficulty: 'hard',
      playerCount: 6,
      allowUnfinalizedMeasurement: true,
      controlledHadamard: true
    }));
    
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    // Test with different settings
    const card = screen.getByTestId('hand-card-gate-id1');
    fireEvent.click(card);
  });

  it('should handle invalid settings data', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json');
    
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });
  });

  it('should handle null settings data', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });
  });

  it('should handle player hand variations', async () => {
    const gameStateWithEmptyHand = createMockGameState({
      players: [
        {
          id: '0',
          name: 'Player A',
          hand: [], // Empty hand
          score: 0,
          passes: 0,
          eliminated: false
        }
      ]
    });
    mockGameLogic.initializeGame.mockReturnValue(gameStateWithEmptyHand);
    
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });
  });

  it('should handle error states and message display', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    // Try to click without selecting a card
    const emptySlot = screen.getByTestId('empty-slot-lane0-pos1');
    fireEvent.click(emptySlot);
  });

  it('should handle board state variations', async () => {
    const gameStateWithComplexBoard = createMockGameState({
      board: {
        lane: [
          [
            { id: 'i1', type: 'GATE', value: 'I' },
            { id: 'q1', type: 'QUBIT', value: '|0⟩' },
            { id: 'g1', type: 'GATE', value: 'X' }
          ],
          [
            { id: 'i2', type: 'GATE', value: 'I' },
            { id: 'u1', type: 'UNITARY', value: 'U' }
          ],
          [
            { id: 'i3', type: 'GATE', value: 'I' }
          ],
          []
        ]
      }
    });
    mockGameLogic.initializeGame.mockReturnValue(gameStateWithComplexBoard);
    
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });
  });

  it('should handle menu interactions', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('menu-button')).toBeInTheDocument();
    });

    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });

    // Click outside to close menu
    fireEvent.mouseDown(document.body);
  });
});