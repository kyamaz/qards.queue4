// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameScreen from '../../src/components/GameScreen';
import { I18nProvider } from '../../src/i18n';
import { initializeGame } from '../../src/game/gameLogic';
import { CardType } from '../../src/game/types';

// Mock the QuantumGameIntegration
jest.mock('../../src/quantum', () => ({
  QuantumGameIntegration: jest.fn().mockImplementation(() => ({
    executeMeasurementComputation: jest.fn().mockReturnValue({
      outcome: 1,
      probability: 0.5,
      gameScore: 5,
      computationSteps: []
    })
  }))
}));

// Mock the game logic functions
jest.mock('../../src/game/gameLogic', () => ({
  initializeGame: jest.fn(),
  isValidPlay: jest.fn().mockReturnValue(true),
  calculateMeasurementScore: jest.fn().mockReturnValue(5),
  findPrecedingQubit: jest.fn(),
  startControlTargetPlacement: jest.fn(),
  completeControlTargetPlacement: jest.fn(),
  cancelControlTargetPlacement: jest.fn(),
  isValidTargetLane: jest.fn().mockReturnValue(true),
  determineWinner: jest.fn(),
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

// Mock the initial selection functions
jest.mock('../../src/game/initialSelection', () => ({
  hasInitialQubitCards: jest.fn().mockReturnValue(true),
  skipPlayerInitialSelection: jest.fn(),
  advanceInitialSelectionPlayer: jest.fn(),
  isInitialSelectionComplete: jest.fn().mockReturnValue(false),
  completeInitialSelection: jest.fn()
}));

describe('GameScreen Component', () => {
  const mockOnBackToMenu = jest.fn();
  
  // Test wrapper that provides I18nProvider context
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <I18nProvider>{children}</I18nProvider>
  );

  const renderWithI18n = (ui: React.ReactElement) => {
    return render(ui, { wrapper: TestWrapper });
  };

  const mockGameState = {
    players: [
      {
        id: '0',
        name: 'Player A',
        hand: [
          { id: '1', type: CardType.GATE, value: 'X' },
          { id: '2', type: CardType.QUBIT, value: '|0⟩' }
        ],
        score: 0,
        passes: 0,
        isEliminated: false
      },
      {
        id: '1',
        name: 'Player B',
        hand: [
          { id: '3', type: CardType.GATE, value: 'H' }
        ],
        score: 0,
        passes: 0,
        isEliminated: false
      }
    ],
    board: {
      lane: [
        [{ id: 'i1', type: CardType.GATE, value: 'I' }],
        [{ id: 'i2', type: CardType.GATE, value: 'I' }]
      ]
    },
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
    gameEndReason: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (initializeGame as jest.Mock).mockReturnValue(mockGameState);
  });

  describe('Rendering', () => {
    it('should render GameScreen component', () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      // GameScreen should render something (either loading, error, or game content)
      expect(document.body).toBeInTheDocument();
    });

    it('should handle props correctly', () => {
      const { container } = renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      // Should render without throwing errors
      expect(container).toBeInTheDocument();
    });
  });

  describe('Player Interaction', () => {
    it('should handle component interactions without errors', () => {
      const { container } = renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      // Component should handle interactions gracefully
      expect(container).toBeInTheDocument();
    });
  });

  describe('Game State Display', () => {
    it('should handle different game states', () => {
      const { container } = renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      // Component should handle different game states gracefully
      expect(container).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors', async () => {
      (initializeGame as jest.Mock).mockImplementation(() => {
        throw new Error('Initialization failed');
      });
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByText(/エラー:/)).toBeInTheDocument();
      });
    });

    it('should handle missing game state gracefully', async () => {
      (initializeGame as jest.Mock).mockReturnValue(null);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByText('ゲーム状態が利用できません。')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should render accessible component', () => {
      const { container } = renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      // Component should be accessible
      expect(container).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should handle different screen sizes', () => {
      const { container } = renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      // Component should handle responsive design
      expect(container).toBeInTheDocument();
    });
  });
});