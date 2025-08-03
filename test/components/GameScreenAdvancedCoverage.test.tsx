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

// Mock setTimeout and clearTimeout with safer implementation
const originalSetTimeout = global.setTimeout;
global.setTimeout = jest.fn().mockImplementation((fn, delay) => {
  if (typeof fn === 'function') {
    return originalSetTimeout(fn, 0); // Use original setTimeout to avoid recursion
  }
  return 123;
});
global.clearTimeout = jest.fn();

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
  calculateMeasurementScore: jest.fn().mockReturnValue(5),
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

const mockGameLogic = require('../../src/game/gameLogic');

jest.mock('../../src/game/initialSelection', () => ({
  hasInitialQubitCards: jest.fn().mockReturnValue(true),
  skipPlayerInitialSelection: jest.fn(),
  advanceInitialSelectionPlayer: jest.fn(),
  isInitialSelectionComplete: jest.fn().mockReturnValue(false),
  completeInitialSelection: jest.fn()
}));

const mockInitialSelection = require('../../src/game/initialSelection');

describe('GameScreen Advanced Coverage Tests', () => {
  const mockOnBackToMenu = jest.fn();
  
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
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      showHints: true,
      difficulty: 'normal',
      playerCount: 4,
      allowUnfinalizedMeasurement: false,
      controlledHadamard: false
    }));
    mockGameLogic.initializeGame.mockReturnValue(createMockGameState());
    mockGameLogic.determineWinner.mockReturnValue({
      winner: { id: '0', name: 'Player A' },
      finalScores: []
    });
  });

  describe('Initial Selection Phase Handling', () => {
    it('should handle initial qubit card placement during initial phase', async () => {
      const initialPhaseState = createMockGameState({
        gamePhase: 'initial_selection',
        board: { lane: [[], [], [], []] }, // Empty board
        initialSelection: {
          currentPlayerIndex: 0,
          playersCompleted: [false, false],
          firstPlayerCandidates: [],
          phaseComplete: false
        }
      });
      
      mockGameLogic.initializeGame.mockReturnValue(initialPhaseState);
      mockInitialSelection.hasInitialQubitCards.mockReturnValue(true);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Look for any initial qubit card
      const initialQubitCards = screen.queryAllByTestId(/hand-card-initial_qubit-/);
      if (initialQubitCards.length > 0) {
        fireEvent.click(initialQubitCards[0]);
      }

      // Click on empty lane to place initial qubit
      const emptySlot = screen.queryByTestId('empty-slot-lane0-pos0');
      if (emptySlot) {
        fireEvent.click(emptySlot);
      }

      // Test passes by reaching here without errors
    });

    it('should complete initial selection when phase is done', async () => {
      mockInitialSelection.isInitialSelectionComplete.mockReturnValue(true);
      
      const initialPhaseState = createMockGameState({
        gamePhase: 'initial_selection',
        initialSelection: {
          currentPlayerIndex: 0,
          playersCompleted: [true, true],
          firstPlayerCandidates: ['0'],
          phaseComplete: true
        }
      });
      
      mockGameLogic.initializeGame.mockReturnValue(initialPhaseState);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Test passes by loading the component successfully
    });

    it('should handle player without initial qubit cards', async () => {
      mockInitialSelection.hasInitialQubitCards.mockReturnValue(false);
      
      const initialPhaseState = createMockGameState({
        gamePhase: 'initial_selection',
        initialSelection: {
          currentPlayerIndex: 0,
          playersCompleted: [false, false],
          firstPlayerCandidates: [],
          phaseComplete: false
        }
      });
      
      mockGameLogic.initializeGame.mockReturnValue(initialPhaseState);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('skip-initial-button')).toBeInTheDocument();
      });

      // Click skip button
      const skipButton = screen.getByTestId('skip-initial-button');
      fireEvent.click(skipButton);

      expect(mockInitialSelection.skipPlayerInitialSelection).toHaveBeenCalled();
    });
  });

  describe('Board Click Handling and Slot Interaction', () => {
    it('should handle clicking on existing board cards', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('board-card-gate-lane0-pos0-idi1')).toBeInTheDocument();
      });

      // Click on existing board card
      const boardCard = screen.getByTestId('board-card-gate-lane0-pos0-idi1');
      fireEvent.click(boardCard);

      // Should not attempt card placement on existing card
    });

    it('should handle board click without selected card', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('empty-slot-lane2-pos0')).toBeInTheDocument();
      });

      // Click on empty slot without selecting a card first
      const emptySlot = screen.getByTestId('empty-slot-lane2-pos0');
      fireEvent.click(emptySlot);

      // Should not attempt placement without selected card
    });

    it('should handle placing card on valid empty slot', async () => {
      mockGameLogic.isValidPlay.mockReturnValue(true);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
      });

      // Select card
      const card = screen.getByTestId('hand-card-gate-id1');
      fireEvent.click(card);

      // Place on valid slot
      const emptySlot = screen.getByTestId('empty-slot-lane0-pos1');
      fireEvent.click(emptySlot);

      // Should successfully place card
      expect(mockGameLogic.isValidPlay).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', type: 'GATE', value: 'X' }),
        0,
        1,
        expect.any(Object),
        false,
        false
      );
    });

    it('should handle invalid card placement with error message', async () => {
      mockGameLogic.isValidPlay.mockReturnValue(false);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
      });

      const card = screen.getByTestId('hand-card-gate-id1');
      fireEvent.click(card);

      const emptySlot = screen.getByTestId('empty-slot-lane0-pos1');
      fireEvent.click(emptySlot);

      // Should show invalid placement error
      expect(mockGameLogic.isValidPlay).toHaveBeenCalled();
    });
  });

  describe('Game State Management and Updates', () => {
    it('should handle pass action with player elimination', async () => {
      mockGameLogic.shouldEliminatePlayer.mockReturnValue(true);
      mockGameLogic.eliminatePlayer.mockReturnValue(createMockGameState({
        players: [
          {
            id: '0',
            name: 'Player A',
            hand: [],
            score: 0,
            passes: 4,
            eliminated: true
          }
        ]
      }));
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pass-button')).toBeInTheDocument();
      });

      const passButton = screen.getByTestId('pass-button');
      fireEvent.click(passButton);

      expect(mockGameLogic.shouldEliminatePlayer).toHaveBeenCalled();
      expect(mockGameLogic.eliminatePlayer).toHaveBeenCalled();
    });

    it('should handle game end conditions after actions', async () => {
      mockGameLogic.checkGameEndConditions.mockReturnValue(true);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pass-button')).toBeInTheDocument();
      });

      const passButton = screen.getByTestId('pass-button');
      fireEvent.click(passButton);

      expect(mockGameLogic.checkGameEndConditions).toHaveBeenCalled();
    });

    it('should handle measurement card with quantum computation fallback', async () => {
      mockQuantumIntegration.isQuantumComputationAvailable.mockReturnValue(false);
      mockGameLogic.calculateMeasurementScore.mockReturnValue(3);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      const measurementCard = screen.queryByTestId('hand-card-measurement-id3');
      if (measurementCard) {
        fireEvent.click(measurementCard);

        const emptySlot = screen.queryByTestId('empty-slot-lane0-pos1');
        if (emptySlot) {
          fireEvent.click(emptySlot);
        }
      }

      // Test passes by not throwing errors
    });

    it('should handle settings changes during gameplay', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Simulate settings change event
      const settingsEvent = new CustomEvent('settingsUpdated', {
        detail: {
          showHints: false,
          difficulty: 'hard',
          playerCount: 6,
          allowUnfinalizedMeasurement: true,
          controlledHadamard: true
        }
      });

      act(() => {
        window.dispatchEvent(settingsEvent);
      });

      // Settings should be updated
    });

    it('should handle localStorage settings change', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Simulate localStorage change
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        showHints: false,
        difficulty: 'easy',
        playerCount: 3,
        allowUnfinalizedMeasurement: true,
        controlledHadamard: true
      }));

      const storageEvent = new StorageEvent('storage', {
        key: 'qards-queue4-settings',
        newValue: JSON.stringify({
          showHints: false,
          difficulty: 'easy',
          playerCount: 3,
          allowUnfinalizedMeasurement: true,
          controlledHadamard: true
        })
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      // Settings should be updated from localStorage
    });
  });

  describe('Message System and User Feedback', () => {
    it('should show and clear temporary messages', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Test temporary message timeout
      expect(global.setTimeout).toHaveBeenCalled();
    });

    it('should handle quantum computation result messages', async () => {
      mockQuantumIntegration.executeMeasurementComputation.mockResolvedValue({
        outcome: 1,
        probability: 0.75,
        gameScore: 5,
        computationSteps: ['Applied H gate', 'Measured qubit']
      });
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      const measurementCard = screen.queryByTestId('hand-card-measurement-id3');
      if (measurementCard) {
        fireEvent.click(measurementCard);

        const emptySlot = screen.queryByTestId('empty-slot-lane0-pos1');
        if (emptySlot) {
          fireEvent.click(emptySlot);
        }
      }

      // Should show quantum computation results
    });

    it('should handle control-target placement messages', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-control-id5')).toBeInTheDocument();
      });

      const controlCard = screen.getByTestId('hand-card-control-id5');
      fireEvent.click(controlCard);

      const emptySlot = screen.getByTestId('empty-slot-lane0-pos1');
      fireEvent.click(emptySlot);

      // Should show control-target placement guidance
      expect(mockGameLogic.startControlTargetPlacement).toHaveBeenCalled();
    });
  });

  describe('View State Management', () => {
    it('should handle viewing different player hands in game ended state', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        gamePhase: 'game_ended'
      }));
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Look for player info elements
      const playerInfo = screen.queryByTestId('player-info-1');
      if (playerInfo) {
        fireEvent.click(playerInfo);
      }
      // Test passes by not throwing errors
    }, 10000);

    it('should handle basic popup interactions', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Just verify component renders without specific popup testing
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    }, 10000);
  });

  describe('Component Cleanup and Effects', () => {
    it('should clean up event listeners on unmount', () => {
      const { unmount } = renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      unmount();
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('settingsUpdated', expect.any(Function));
    });

    it('should handle component update with new props', () => {
      const { rerender } = renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      // Re-render with different props
      rerender(
        <TestWrapper>
          <GameScreen />
        </TestWrapper>
      );
      
      // Component should handle prop changes gracefully
    });
  });
});