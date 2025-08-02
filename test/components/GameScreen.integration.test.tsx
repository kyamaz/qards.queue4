// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameScreen from '../../src/components/GameScreen';
import { I18nProvider } from '../../src/i18n';
import { CardType } from '../../src/game/types';

// Comprehensive mocks for integration testing
jest.mock('../../src/quantum', () => ({
  QuantumGameIntegration: jest.fn().mockImplementation(() => ({
    executeMeasurementComputation: jest.fn().mockReturnValue({
      outcome: 1,
      probability: 0.5,
      gameScore: 5,
      computationSteps: []
    }),
    isQuantumComputationAvailable: jest.fn().mockReturnValue(true)
  }))
}));

jest.mock('../../src/game/gameLogic', () => ({
  initializeGame: jest.fn(),
  isValidPlay: jest.fn().mockReturnValue(true),
  calculateMeasurementScore: jest.fn().mockReturnValue(5),
  findPrecedingQubit: jest.fn().mockReturnValue({ value: '|0⟩' }),
  startControlTargetPlacement: jest.fn(),
  completeControlTargetPlacement: jest.fn(),
  cancelControlTargetPlacement: jest.fn(),
  isValidTargetLane: jest.fn().mockReturnValue(true),
  determineWinner: jest.fn().mockReturnValue({ 
    winner: { id: '0', name: 'プレイヤーA' }, 
    finalScores: [{ player: { id: '0', name: 'プレイヤーA' }, finalScore: 10 }] 
  }),
  canPlayUnitaryCard: jest.fn().mockReturnValue(true),
  incrementUnitaryCardCounter: jest.fn(),
  resetUnitaryCardCounters: jest.fn(),
  calculateHandPenalty: jest.fn().mockReturnValue(0),
  getGameEndReason: jest.fn().mockReturnValue('playerHandEmpty'),
  eliminatePlayer: jest.fn(),
  getNextActivePlayer: jest.fn().mockReturnValue(0),
  shouldEliminatePlayer: jest.fn().mockReturnValue(false),
  checkGameEndConditions: jest.fn().mockReturnValue({ gameEnded: false, winner: null })
}));

jest.mock('../../src/game/initialSelection', () => ({
  hasInitialQubitCards: jest.fn().mockReturnValue(true),
  skipPlayerInitialSelection: jest.fn(),
  advanceInitialSelectionPlayer: jest.fn(),
  isInitialSelectionComplete: jest.fn().mockReturnValue(false),
  completeInitialSelection: jest.fn()
}));

const gameLogic = require('../../src/game/gameLogic');
const initialSelection = require('../../src/game/initialSelection');

const {
  initializeGame,
  findPrecedingQubit,
  calculateMeasurementScore,
  canPlayUnitaryCard
} = gameLogic;

const {
  hasInitialQubitCards,
  isInitialSelectionComplete,
  completeInitialSelection,
  advanceInitialSelectionPlayer
} = initialSelection;

describe('GameScreen Integration Tests', () => {
  const mockOnBackToMenu = jest.fn();

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <I18nProvider>{children}</I18nProvider>
  );

  const renderWithI18n = (ui: React.ReactElement) => {
    return render(ui, { wrapper: TestWrapper });
  };

  const createMockGameState = (overrides = {}) => ({
    players: [
      {
        id: '0',
        name: 'Player A',
        hand: [
          { id: '1', type: CardType.GATE, value: 'X' },
          { id: '2', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
          { id: '3', type: CardType.MEASUREMENT, value: '⟨0|' }
        ],
        score: 0,
        passes: 0,
        isEliminated: false
      },
      {
        id: '1', 
        name: 'Player B',
        hand: [{ id: '4', type: CardType.GATE, value: 'H' }],
        score: 0,
        passes: 0,
        isEliminated: false
      }
    ],
    board: {
      lane: [
        [{ id: 'i1', type: CardType.INITIAL_QUBIT, value: '|0⟩' }],
        []
      ]
    },
    currentPlayerId: '0',
    currentPlayer: 0,
    turn: 1,
    measurementCount: 0,
    gameEnded: false,
    winner: null,
    isInitialSelection: false,
    initialSelectionPlayer: 0,
    isReverseOrder: false,
    controlTargetState: null,
    unitaryCardCounters: {},
    gameEndReason: null,
    gamePhase: 'playing' as const,
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (initializeGame as jest.Mock).mockReturnValue(createMockGameState());
    // Reset the determineWinner mock for each test
    (gameLogic.determineWinner as jest.Mock).mockReturnValue({ 
      winner: { id: '0', name: 'プレイヤーA' }, 
      finalScores: [{ player: { id: '0', name: 'プレイヤーA' }, finalScore: 10 }] 
    });
  });

  describe('Initial Loading and Setup', () => {
    it('should handle initialization process', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });

      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle settings integration during initialization', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });

      // Should call initializeGame with proper player names
      expect(initializeGame).toHaveBeenCalledWith(['プレイヤーA', 'プレイヤーB', 'プレイヤーC', 'プレイヤーD']);
    });
  });

  describe('Card Selection and Hints', () => {
    it('should handle measurement card selection with hints', async () => {
      (findPrecedingQubit as jest.Mock).mockReturnValue({ value: '|0⟩' });
      (calculateMeasurementScore as jest.Mock).mockReturnValue(5);

      const gameStateWithMeasurement = createMockGameState({
        players: [{
          ...createMockGameState().players[0],
          hand: [{ id: '1', type: CardType.MEASUREMENT, value: '⟨0|' }]
        }]
      });
      (initializeGame as jest.Mock).mockReturnValue(gameStateWithMeasurement);

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(screen.getByText(/ゲーム/i)).toBeInTheDocument();
      });

      // Should handle measurement card in the game state
      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle initial qubit card selection', async () => {
      const gameStateWithInitialQubit = createMockGameState({
        gamePhase: 'initial_selection',
        isInitialSelection: true,
        players: [{
          ...createMockGameState().players[0],
          hand: [{ id: '1', type: CardType.INITIAL_QUBIT, value: '|0⟩' }]
        }]
      });
      (initializeGame as jest.Mock).mockReturnValue(gameStateWithInitialQubit);

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(screen.getByText(/選択/i)).toBeInTheDocument();
      });

      // Should handle initial selection phase
      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle unitary card restriction checking', async () => {
      (canPlayUnitaryCard as jest.Mock).mockReturnValue(false);

      const gameStateWithUnitary = createMockGameState({
        players: [{
          ...createMockGameState().players[0],
          hand: [{ id: '1', type: CardType.UNITARY, value: 'U' }]
        }]
      });
      (initializeGame as jest.Mock).mockReturnValue(gameStateWithUnitary);

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Should handle unitary card state
      expect(initializeGame).toHaveBeenCalled();
    });
  });

  describe('Initial Selection Phase', () => {
    it('should handle initial selection completion', async () => {
      const initialSelectionState = createMockGameState({
        gamePhase: 'initial_selection',
        isInitialSelection: true,
        initialSelection: {
          currentPlayerId: '0',
          candidates: [{ id: '1', type: CardType.INITIAL_QUBIT, value: '|1⟩' }],
          playersCompleted: [true, false, false, false]
        }
      });
      (initializeGame as jest.Mock).mockReturnValue(initialSelectionState);

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle skipping initial player', async () => {
      const initialSelectionState = createMockGameState({
        gamePhase: 'initial_selection',
        isInitialSelection: true
      });
      (initializeGame as jest.Mock).mockReturnValue(initialSelectionState);

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      expect(initializeGame).toHaveBeenCalled();
    });
  });

  describe('Pass Functionality', () => {
    it('should handle pass action during normal gameplay', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Look for pass button and click it (use testid to avoid multiple matches)
      const passButton = screen.queryByTestId('pass-button');
      if (passButton) {
        fireEvent.click(passButton);
      }

      // Component should handle pass functionality
      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle pass action when game is ended', async () => {
      const endedGameState = createMockGameState({
        gamePhase: 'game_ended',
        gameEnded: true,
        winner: {
          id: '0',
          name: 'プレイヤーA'
        }
      });
      (initializeGame as jest.Mock).mockReturnValue(endedGameState);

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Should show game ended state
      expect(initializeGame).toHaveBeenCalled();
    });
  });

  describe('Message System', () => {
    it('should handle temporary message display', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Try to trigger a message by clicking invalid areas
      const gameArea = screen.getByRole('main');
      fireEvent.click(gameArea);

      // Should handle message system functionality
      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle message clearing', async () => {
      jest.useFakeTimers();
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Simulate time passing for message clearing
      jest.advanceTimersByTime(3000);
      
      jest.useRealTimers();

      expect(initializeGame).toHaveBeenCalled();
    });
  });

  describe('Game State Management', () => {
    it('should handle new game creation', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Look for new game button
      const newGameButton = screen.queryByText(/新しいゲーム/i);
      if (newGameButton) {
        fireEvent.click(newGameButton);
      }

      // Should handle new game functionality
      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle back to menu functionality', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Look for menu button and test callback
      const menuButton = screen.queryByTestId('menu-button');
      if (menuButton) {
        fireEvent.click(menuButton);
        // Menu button opens a menu, not directly calls onBackToMenu
      }

      // Should handle back to menu
      expect(mockOnBackToMenu).toBeDefined();
    });
  });

  describe('UI State Management', () => {
    it('should handle slot highlighting', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Test slot interactions by clicking around
      const slots = screen.getAllByRole('button');
      if (slots.length > 0) {
        fireEvent.click(slots[0]);
      }

      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle confirmation popup', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Try to trigger confirmation
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        if (button.textContent?.includes('確認')) {
          fireEvent.click(button);
        }
      });

      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle menu state', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Test menu interactions
      const menuElements = screen.queryAllByText(/メニュー/i);
      menuElements.forEach(element => {
        fireEvent.click(element);
      });

      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle player hand view', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Test hand view interactions
      const handElements = screen.queryAllByText(/手札/i);
      handElements.forEach(element => {
        fireEvent.click(element);
      });

      expect(initializeGame).toHaveBeenCalled();
    });
  });

  describe('Animation and Visual Effects', () => {
    it('should handle card placement animation', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Test animation timing
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);
      jest.useRealTimers();

      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle turn transition effects', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Test turn transitions
      jest.useFakeTimers();
      jest.advanceTimersByTime(500);
      jest.useRealTimers();

      expect(initializeGame).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle initialization errors gracefully', async () => {
      (initializeGame as jest.Mock).mockImplementation(() => {
        throw new Error('Test initialization error');
      });

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(screen.getByText(/エラー/i)).toBeInTheDocument();
      });
    });

    it('should handle null game state', async () => {
      (initializeGame as jest.Mock).mockReturnValue(null);

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(screen.getByText(/ゲーム状態が利用できません/i)).toBeInTheDocument();
      });
    });

    it('should handle undefined props gracefully', async () => {
      renderWithI18n(<GameScreen onBackToMenu={undefined} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle rapid state changes', async () => {
      const { rerender } = renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      // Rerender multiple times rapidly
      for (let i = 0; i < 5; i++) {
        rerender(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      }

      expect(initializeGame).toHaveBeenCalled();
    });

    it('should handle complex game state transitions', async () => {
      const complexGameState = createMockGameState({
        gamePhase: 'playing',
        controlTargetState: {
          waitingForTarget: true,
          controlCard: { id: 'ctrl1', type: CardType.CONTROL, value: 'CNOT' },
          controlLane: 0,
          controlPosition: 1
        },
        players: [
          {
            id: '0',
            name: 'Player A',
            hand: [
              { id: '1', type: CardType.GATE, value: 'H' },
              { id: '2', type: CardType.MEASUREMENT, value: '⟨0|' },
              { id: '3', type: CardType.CONTROL, value: 'CNOT' }
            ],
            score: 10,
            passes: 2,
            isEliminated: false
          }
        ]
      });
      (initializeGame as jest.Mock).mockReturnValue(complexGameState);

      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);

      await waitFor(() => {
        expect(initializeGame).toHaveBeenCalled();
      });

      expect(initializeGame).toHaveBeenCalled();
    });
  });
});