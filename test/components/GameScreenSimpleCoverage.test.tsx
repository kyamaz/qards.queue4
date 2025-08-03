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

describe('GameScreen Simple Coverage Tests', () => {
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
  });

  it('should render and initialize properly', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    expect(mockGameLogic.initializeGame).toHaveBeenCalled();
  });

  it('should handle basic card selection', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
    });

    const card = screen.getByTestId('hand-card-gate-id1');
    fireEvent.click(card);

    // Card should be marked as selected (check for visual selection indicator)
    expect(card).toHaveClass('ring-4');
  });

  it('should handle card deselection', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
    });

    const card = screen.getByTestId('hand-card-gate-id1');
    
    // Select
    fireEvent.click(card);
    expect(card).toHaveClass('ring-4');
    
    // Deselect
    fireEvent.click(card);
    expect(card).not.toHaveClass('ring-4');
  });

  it('should handle pass button click', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('pass-button')).toBeInTheDocument();
    });

    const passButton = screen.getByTestId('pass-button');
    fireEvent.click(passButton);

    expect(mockGameLogic.getNextActivePlayer).toHaveBeenCalled();
  });

  it('should handle menu toggle', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('menu-button')).toBeInTheDocument();
    });

    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('should handle board slot click without selected card', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('empty-slot-lane2-pos0')).toBeInTheDocument();
    });

    const emptySlot = screen.getByTestId('empty-slot-lane2-pos0');
    fireEvent.click(emptySlot);

    // Should not crash without selected card
  });

  it('should handle board slot click with selected card', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
    });

    // Select card first
    const card = screen.getByTestId('hand-card-gate-id1');
    fireEvent.click(card);

    // Then click empty slot
    const emptySlot = screen.getByTestId('empty-slot-lane2-pos0');
    fireEvent.click(emptySlot);

    expect(mockGameLogic.isValidPlay).toHaveBeenCalled();
  });

  it('should handle hints disabled', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      showHints: false,
      difficulty: 'normal',
      playerCount: 4,
      allowUnfinalizedMeasurement: false,
      controlledHadamard: false
    }));

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
    });

    const card = screen.getByTestId('hand-card-gate-id1');
    fireEvent.click(card);

    // Hints should be disabled but card should still be selectable
    expect(card).toHaveClass('ring-4');
  });

  it('should handle game ended state', async () => {
    mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
      gamePhase: 'game_ended'
    }));

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-ended-banner')).toBeInTheDocument();
    });
  });

  it('should handle initial selection phase', async () => {
    mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
      gamePhase: 'initial_selection',
      initialSelection: {
        currentPlayerIndex: 0,
        playersCompleted: [false, false],
        firstPlayerCandidates: [],
        phaseComplete: false
      }
    }));

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('initial-phase-indicator')).toBeInTheDocument();
    });
  });

  it('should handle control-target placement state', async () => {
    mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
      controlTargetPlacement: {
        controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
        controlLane: 0,
        controlPosition: 1,
        waitingForTarget: true
      }
    }));

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    // Try to select a card while in control-target mode
    const card = screen.getByTestId('hand-card-gate-id1');
    fireEvent.click(card);

    // Should not select card during control-target placement
  });

  it('should handle measurement card with quantum computation', async () => {
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-measurement-id3')).toBeInTheDocument();
    });

    const measurementCard = screen.getByTestId('hand-card-measurement-id3');
    fireEvent.click(measurementCard);

    const emptySlot = screen.getByTestId('empty-slot-lane0-pos1');
    fireEvent.click(emptySlot);

    await waitFor(() => {
      expect(mockQuantumIntegration.executeMeasurementComputation).toHaveBeenCalled();
    });
  });

  it('should handle measurement card with quantum computation disabled', async () => {
    mockQuantumIntegration.isQuantumComputationAvailable.mockReturnValue(false);

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-measurement-id3')).toBeInTheDocument();
    });

    const measurementCard = screen.getByTestId('hand-card-measurement-id3');
    fireEvent.click(measurementCard);

    const emptySlot = screen.getByTestId('empty-slot-lane0-pos1');
    fireEvent.click(emptySlot);

    // Should fall back to getMeasurementOutcome and calculateMeasurementScoreFromOutcome
    expect(mockGameLogic.getMeasurementOutcome).toHaveBeenCalled();
    expect(mockGameLogic.calculateMeasurementScoreFromOutcome).toHaveBeenCalled();
  });

  it('should handle turn advancement', async () => {
    mockGameLogic.getNextActivePlayer.mockReturnValue('1');

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('pass-button')).toBeInTheDocument();
    });

    const passButton = screen.getByTestId('pass-button');
    fireEvent.click(passButton);

    expect(mockGameLogic.getNextActivePlayer).toHaveBeenCalledWith(
      expect.any(Object),
      '0'
    );
  });

  it('should handle turn advancement to first player', async () => {
    const gameStateWithFirstPlayer = createMockGameState({
      firstPlayerId: '0',
      currentPlayerId: '1'
    });
    mockGameLogic.initializeGame.mockReturnValue(gameStateWithFirstPlayer);
    mockGameLogic.getNextActivePlayer.mockReturnValue('0'); // Return to first player

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('pass-button')).toBeInTheDocument();
    });

    const passButton = screen.getByTestId('pass-button');
    fireEvent.click(passButton);

    // Should call getNextActivePlayer
    expect(mockGameLogic.getNextActivePlayer).toHaveBeenCalled();
  });

  it('should handle player elimination', async () => {
    mockGameLogic.shouldEliminatePlayer.mockReturnValue(true);
    mockGameLogic.eliminatePlayer.mockReturnValue(createMockGameState());

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('pass-button')).toBeInTheDocument();
    });

    const passButton = screen.getByTestId('pass-button');
    fireEvent.click(passButton);

    expect(mockGameLogic.shouldEliminatePlayer).toHaveBeenCalled();
    expect(mockGameLogic.eliminatePlayer).toHaveBeenCalled();
  });

  it('should handle game end conditions', async () => {
    mockGameLogic.checkGameEndConditions.mockReturnValue(true);

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('pass-button')).toBeInTheDocument();
    });

    const passButton = screen.getByTestId('pass-button');
    fireEvent.click(passButton);

    expect(mockGameLogic.checkGameEndConditions).toHaveBeenCalled();
    expect(mockGameLogic.determineWinner).toHaveBeenCalled();
  });

  it('should handle unitary card placement', async () => {
    // Mock the incrementUnitaryCardCounter to return a proper game state
    mockGameLogic.incrementUnitaryCardCounter.mockReturnValue(createMockGameState());
    
    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-unitary-id4')).toBeInTheDocument();
    });

    const unitaryCard = screen.getByTestId('hand-card-unitary-id4');
    fireEvent.click(unitaryCard);

    const emptySlot = screen.getByTestId('empty-slot-lane0-pos1');
    fireEvent.click(emptySlot);

    expect(mockGameLogic.incrementUnitaryCardCounter).toHaveBeenCalled();
  });

  it('should handle unitary card restriction', async () => {
    mockGameLogic.canPlayUnitaryCard.mockReturnValue(false);

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-unitary-id4')).toBeInTheDocument();
    });

    const unitaryCard = screen.getByTestId('hand-card-unitary-id4');
    fireEvent.click(unitaryCard);

    expect(mockGameLogic.canPlayUnitaryCard).toHaveBeenCalled();
  });

  it('should handle control card placement', async () => {
    mockGameLogic.startControlTargetPlacement.mockReturnValue(createMockGameState({
      controlTargetPlacement: {
        controlCard: { id: '5', type: CardType.CONTROL, value: 'C' },
        controlLane: 0,
        controlPosition: 1,
        waitingForTarget: true
      }
    }));

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-control-id5')).toBeInTheDocument();
    });

    const controlCard = screen.getByTestId('hand-card-control-id5');
    fireEvent.click(controlCard);

    const emptySlot = screen.getByTestId('empty-slot-lane0-pos1');
    fireEvent.click(emptySlot);

    expect(mockGameLogic.startControlTargetPlacement).toHaveBeenCalled();
  });

  it('should handle target lane selection', async () => {
    mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
      controlTargetPlacement: {
        controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
        controlLane: 0,
        controlPosition: 1,
        waitingForTarget: true
      }
    }));

    mockGameLogic.completeControlTargetPlacement.mockReturnValue(createMockGameState());

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    // Click on target lane
    const targetSlot = screen.getByTestId('empty-slot-lane1-pos1');
    fireEvent.click(targetSlot);

    expect(mockGameLogic.completeControlTargetPlacement).toHaveBeenCalled();
  });

  it('should handle invalid card placement', async () => {
    mockGameLogic.isValidPlay.mockReturnValue(false);

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
    });

    const card = screen.getByTestId('hand-card-gate-id1');
    fireEvent.click(card);

    const emptySlot = screen.getByTestId('empty-slot-lane0-pos1');
    fireEvent.click(emptySlot);

    expect(mockGameLogic.isValidPlay).toHaveBeenCalled();
  });

  it('should handle viewing different player hands in ended game', async () => {
    mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
      gamePhase: 'game_ended'
    }));

    renderWithI18n(<GameScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('player-info-1')).toBeInTheDocument();
    });

    const playerInfo = screen.getByTestId('player-info-1');
    fireEvent.click(playerInfo);

    // Should change viewed player
  });
});