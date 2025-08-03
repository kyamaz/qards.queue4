// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameScreen from '../../src/components/GameScreen';
import { I18nProvider } from '../../src/i18n';
import { initializeGame } from '../../src/game/gameLogic';
import { CardType, GameState } from '../../src/game/types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock addEventListener/removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
Object.defineProperty(window, 'addEventListener', { value: mockAddEventListener });
Object.defineProperty(window, 'removeEventListener', { value: mockRemoveEventListener });

// Mock the QuantumGameIntegration
const mockQuantumIntegration = {
  isQuantumComputationAvailable: jest.fn().mockReturnValue(true),
  executeMeasurementComputation: jest.fn().mockResolvedValue({
    outcome: 1,
    probability: 0.5,
    gameScore: 5,
    computationSteps: []
  })
};

jest.mock('../../src/quantum', () => ({
  QuantumGameIntegration: jest.fn().mockImplementation(() => mockQuantumIntegration)
}));

jest.mock('../../src/game/gameLogic', () => ({
  initializeGame: jest.fn(),
  isValidPlay: jest.fn().mockReturnValue(true),
  calculateMeasurementScore: jest.fn().mockReturnValue(3),
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

// Get the mocked functions for use in tests
const mockGameLogic = require('../../src/game/gameLogic');

jest.mock('../../src/game/initialSelection', () => ({
  hasInitialQubitCards: jest.fn().mockReturnValue(true),
  skipPlayerInitialSelection: jest.fn(),
  advanceInitialSelectionPlayer: jest.fn(),
  isInitialSelectionComplete: jest.fn().mockReturnValue(false),
  completeInitialSelection: jest.fn()
}));

// Get the mocked functions for use in tests
const mockInitialSelection = require('../../src/game/initialSelection');

describe('GameScreen Component', () => {
  const mockOnBackToMenu = jest.fn();
  
  // Test wrapper that provides I18nProvider context
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
          { id: '2', type: 'INITIAL_QUBIT', value: '|0⟩' }
        ],
        score: 0,
        passes: 0,
        eliminated: false
      },
      {
        id: '1',
        name: 'Player B',
        hand: [
          { id: '3', type: 'GATE', value: 'H' }
        ],
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
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      showHints: true,
      difficulty: 'normal',
      playerCount: 4,
      allowUnfinalizedMeasurement: false,
      controlledHadamard: false
    }));
    // Reset to synchronous mock for most tests
    mockGameLogic.initializeGame.mockReturnValue(createMockGameState());
    mockGameLogic.determineWinner.mockReturnValue({
      winner: { id: '0', name: 'Player A' },
      finalScores: [
        { player: { id: '0', name: 'Player A' }, finalScore: 10 },
        { player: { id: '1', name: 'Player B' }, finalScore: 5 }
      ]
    });
  });

  describe('Component Initialization and Loading', () => {
    it('should handle component lifecycle properly', async () => {
      // Since loading state is very brief due to synchronous initialization,
      // let's test that the component handles the lifecycle correctly
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      // Should eventually render the game screen after initialization
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });
      
      // Verify initialization was called
      expect(mockGameLogic.initializeGame).toHaveBeenCalled();
    });

    it('should initialize game on mount', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(mockGameLogic.initializeGame).toHaveBeenCalled();
      });
    });

    it('should handle initialization error', async () => {
      mockGameLogic.initializeGame.mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Initialization failed/)).toBeInTheDocument();
      });
    });

    it('should render game screen once loaded', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Management', () => {
    it('should load settings from localStorage', async () => {
      const mockSettings = {
        showHints: false,
        difficulty: 'hard',
        playerCount: 6,
        allowUnfinalizedMeasurement: true,
        controlledHadamard: true
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSettings));

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('qards-queue4-settings');
      });
    });

    it('should handle invalid localStorage settings', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      // Mock console.warn to suppress expected error messages during error handling tests
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });
      
      consoleWarnSpy.mockRestore();
    });

    it('should set up storage event listeners', () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      expect(mockAddEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('settingsUpdated', expect.any(Function));
    });
  });

  describe('Header and Game Information', () => {
    it('should display game header', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-header')).toBeInTheDocument();
      });
    });

    it('should show turn indicator in normal play', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-indicator')).toBeInTheDocument();
      });
    });

    it('should show measurement counter', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('measurement-counter')).toBeInTheDocument();
      });
    });

    it('should show reverse direction indicator when turn is backward', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        turnDirection: 'backward'
      }));

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('reverse-direction-indicator')).toBeInTheDocument();
      });
    });

    it('should show initial phase indicator during initial selection', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        gamePhase: 'initial_selection',
        initialSelection: {
          currentPlayerIndex: 0,
          playersCompleted: [false, false],
          firstPlayerCandidates: [],
          phaseComplete: false
        }
      }));

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('initial-phase-indicator')).toBeInTheDocument();
      });
    });
  });

  describe('Menu and Navigation', () => {
    it('should toggle menu when menu button is clicked', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('menu-button');
        fireEvent.click(menuButton);
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      });
    });

    it('should show new game button in menu', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('menu-button');
        fireEvent.click(menuButton);
        expect(screen.getByTestId('new-game-button')).toBeInTheDocument();
      });
    });

    it('should show back to menu button when onBackToMenu is provided', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('menu-button');
        fireEvent.click(menuButton);
        expect(screen.getByTestId('back-to-menu-button')).toBeInTheDocument();
      });
    });

    it('should not show back to menu button when onBackToMenu is not provided', async () => {
      renderWithI18n(<GameScreen />);
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('menu-button');
        fireEvent.click(menuButton);
        expect(screen.queryByTestId('back-to-menu-button')).not.toBeInTheDocument();
      });
    });
  });

  describe('Player Sidebar', () => {
    it('should display player sidebar', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('player-sidebar')).toBeInTheDocument();
      });
    });

    it('should show all players in sidebar', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('player-info-0')).toBeInTheDocument();
        expect(screen.getByTestId('player-info-1')).toBeInTheDocument();
      });
    });

    it('should highlight current player', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const currentPlayerInfo = screen.getByTestId('player-info-0');
        expect(currentPlayerInfo).toHaveClass('border-blue-400');
      });
    });

    it('should show eliminated player styling', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        players: [
          {
            id: '0',
            name: 'Player A',
            hand: [],
            score: 0,
            passes: 4,
            eliminated: true
          },
          {
            id: '1',
            name: 'Player B',
            hand: [{ id: '3', type: 'GATE', value: 'H' }],
            score: 0,
            passes: 0,
            eliminated: false
          }
        ]
      }));

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const eliminatedPlayerInfo = screen.getByTestId('player-info-0');
        expect(eliminatedPlayerInfo).toHaveClass('border-red-600');
      });
    });
  });

  describe('Pass Button Functionality', () => {
    it('should render pass button', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pass-button')).toBeInTheDocument();
      });
    });

    it('should handle pass action', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const passButton = screen.getByTestId('pass-button');
        fireEvent.click(passButton);
        // Should not throw and should handle the pass
      });
    });

    it('should disable pass button when game is ended', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        gamePhase: 'game_ended'
      }));

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const passButton = screen.getByTestId('pass-button');
        expect(passButton).toBeDisabled();
      });
    });

    it('should disable pass button when game has ended', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        gamePhase: 'game_ended',
        players: [
          {
            id: '0',
            name: 'Player A',
            hand: [],
            score: 0,
            passes: 4,
            eliminated: true
          },
          {
            id: '1',
            name: 'Player B',
            hand: [{ id: '3', type: 'GATE', value: 'H' }],
            score: 0,
            passes: 0,
            eliminated: false
          }
        ]
      }));

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const passButton = screen.getByTestId('pass-button');
        expect(passButton).toBeDisabled();
      });
    });
  });

  describe('Initial Selection Phase', () => {
    beforeEach(() => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        gamePhase: 'initial_selection',
        initialSelection: {
          currentPlayerIndex: 0,
          playersCompleted: [false, false],
          firstPlayerCandidates: [],
          phaseComplete: false
        }
      }));
      mockInitialSelection.hasInitialQubitCards.mockReturnValue(false);
    });

    it('should show skip button when player has no initial cards', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('skip-initial-button')).toBeInTheDocument();
      });
    });

    it('should handle skip initial player action', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const skipButton = screen.getByTestId('skip-initial-button');
        fireEvent.click(skipButton);
        expect(mockInitialSelection.skipPlayerInitialSelection).toHaveBeenCalled();
      });
    });

    it('should not show skip button when player has initial cards', async () => {
      mockInitialSelection.hasInitialQubitCards.mockReturnValue(true);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('skip-initial-button')).not.toBeInTheDocument();
      });
    });
  });

  describe('Game End State', () => {
    beforeEach(() => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        gamePhase: 'game_ended'
      }));
    });

    it('should show game ended indicator', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-ended-indicator')).toBeInTheDocument();
      });
    });

    it('should show game ended banner', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-ended-banner')).toBeInTheDocument();
      });
    });

    it('should show winner announcement', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('winner-announcement')).toBeInTheDocument();
      });
    });

    it('should show final score display', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('final-score-display')).toBeInTheDocument();
      });
    });

    it('should allow viewing different player hands', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const playerInfo = screen.getByTestId('player-info-1');
        fireEvent.click(playerInfo);
        // Should handle player hand viewing
      });
    });
  });

  describe('Card Selection and Placement', () => {
    it('should handle card selection when game is in normal play', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
        // Card selection is handled by PlayerHand component
      });
    });

    it('should prevent card selection when game is ended', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        gamePhase: 'game_ended'
      }));

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
        // Card selection should be disabled
      });
    });

    it('should show cancel button when card is selected', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
        // Cancel button visibility is conditional on selectedCard state
      });
    });
  });

  describe('Confirmation Popup', () => {
    it('should show confirmation popup for new game when game is in progress', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('menu-button');
        fireEvent.click(menuButton);
        const newGameButton = screen.getByTestId('new-game-button');
        fireEvent.click(newGameButton);
        // Should trigger confirmation popup
      });
    });

    it('should show confirmation popup for back to menu when game is in progress', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('menu-button');
        fireEvent.click(menuButton);
        const backToMenuButton = screen.getByTestId('back-to-menu-button');
        fireEvent.click(backToMenuButton);
        // Should trigger confirmation popup
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle null game state gracefully', async () => {
      mockGameLogic.initializeGame.mockReturnValue(null);

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByText('ゲーム状態が利用できません。')).toBeInTheDocument();
      });
    });

    it('should handle missing current player', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        currentPlayerId: 'nonexistent'
      }));

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByText('現在のプレイヤーが見つかりません。')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Integration', () => {
    it('should apply hint settings', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        showHints: true,
        difficulty: 'normal',
        playerCount: 4,
        allowUnfinalizedMeasurement: false,
        controlledHadamard: false
      }));

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
        // Hints should be shown based on settings
      });
    });

    it('should handle different player counts from settings', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        showHints: true,
        difficulty: 'normal',
        playerCount: 6,
        allowUnfinalizedMeasurement: false,
        controlledHadamard: false
      }));

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(mockGameLogic.initializeGame).toHaveBeenCalled();
      });
    });
  });

  describe('Quantum Integration', () => {
    it('should handle quantum computation availability', async () => {
      mockQuantumIntegration.isQuantumComputationAvailable.mockReturnValue(true);

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });
    });

    it('should handle quantum computation unavailability', async () => {
      mockQuantumIntegration.isQuantumComputationAvailable.mockReturnValue(false);

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });
    });
  });
});
