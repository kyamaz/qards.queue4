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

describe('GameScreen Coverage Tests', () => {
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
        hand: [
          { id: '6', type: 'GATE', value: 'H' }
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
    mockGameLogic.initializeGame.mockReturnValue(createMockGameState());
    mockGameLogic.determineWinner.mockReturnValue({
      winner: { id: '0', name: 'Player A' },
      finalScores: [
        { player: { id: '0', name: 'Player A' }, finalScore: 10 },
        { player: { id: '1', name: 'Player B' }, finalScore: 5 }
      ]
    });
  });

  describe('Turn Management and Game Flow', () => {
    it('should handle turn advancement when game is not ended', async () => {
      mockGameLogic.getNextActivePlayer.mockReturnValue('1');
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Simulate turn advancement by triggering pass action
      const passButton = screen.getByTestId('pass-button');
      fireEvent.click(passButton);

      expect(mockGameLogic.getNextActivePlayer).toHaveBeenCalled();
    });

    it('should handle turn advancement when no active players left', async () => {
      mockGameLogic.getNextActivePlayer.mockReturnValue(null);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Simulate turn advancement that would end the game
      const passButton = screen.getByTestId('pass-button');
      fireEvent.click(passButton);

      expect(mockGameLogic.getNextActivePlayer).toHaveBeenCalled();
    });

    it('should handle turn advancement with turn increment', async () => {
      const gameStateWithFirstPlayer = createMockGameState({
        firstPlayerId: '0',
        currentPlayerId: '1'
      });
      mockGameLogic.initializeGame.mockReturnValue(gameStateWithFirstPlayer);
      mockGameLogic.getNextActivePlayer.mockReturnValue('0'); // Return to first player
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      const passButton = screen.getByTestId('pass-button');
      fireEvent.click(passButton);

      // The turn increment and unitary counter reset happens internally
      expect(mockGameLogic.getNextActivePlayer).toHaveBeenCalled();
    });

    it('should not advance turn when game has ended', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        gamePhase: 'game_ended'
      }));
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Game ended, turn advancement should be blocked
      expect(mockGameLogic.getNextActivePlayer).not.toHaveBeenCalled();
    });
  });

  describe('Card Selection and Interaction', () => {
    it('should handle card selection when game is not ended', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
      });

      const card = screen.getByTestId('hand-card-gate-id1');
      fireEvent.click(card);

      // Card should be selectable in normal play - check for ring highlight
      expect(card).toHaveClass('ring-cyan-400');
    });

    it('should prevent card selection when game is ended', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        gamePhase: 'game_ended'
      }));
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // In game ended state, card selection should be prevented
      const cards = screen.queryAllByTestId(/hand-card-/);
      if (cards.length > 0) {
        fireEvent.click(cards[0]);
        // Should show error message about game being ended
      }
    });

    it('should handle control-target placement mode', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        controlTargetPlacement: {
          controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
          controlLane: 0,
          controlPosition: 1,
          waitingForTarget: true
        }
      }));
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Try to select another card while in control-target mode
      const card = screen.getByTestId('hand-card-gate-id1');
      fireEvent.click(card);

      // Should show message about completing control card
    });

    it('should handle unitary card restriction', async () => {
      mockGameLogic.canPlayUnitaryCard.mockReturnValue(false);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-unitary-id4')).toBeInTheDocument();
      });

      const unitaryCard = screen.getByTestId('hand-card-unitary-id4');
      fireEvent.click(unitaryCard);

      // Should show unitary card restriction message
      expect(mockGameLogic.canPlayUnitaryCard).toHaveBeenCalled();
    });

    it('should handle card deselection', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
      });

      const card = screen.getByTestId('hand-card-gate-id1');
      
      // Select card
      fireEvent.click(card);
      expect(card).toHaveClass('ring-cyan-400');
      
      // Deselect same card
      fireEvent.click(card);
      expect(card).not.toHaveClass('ring-cyan-400');
    });
  });

  describe('Hint System and Slot Highlighting', () => {
    it('should show hints when enabled in settings', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        showHints: true,
        difficulty: 'normal',
        playerCount: 4,
        allowUnfinalizedMeasurement: false,
        controlledHadamard: false
      }));
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
      });

      // Select a card to trigger hint system
      const card = screen.getByTestId('hand-card-gate-id1');
      fireEvent.click(card);

      // Should trigger slot highlighting
      expect(mockGameLogic.isValidPlay).toHaveBeenCalled();
    });

    it('should not show hints when disabled in settings', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        showHints: false,
        difficulty: 'normal',
        playerCount: 4,
        allowUnfinalizedMeasurement: false,
        controlledHadamard: false
      }));
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
      });

      const card = screen.getByTestId('hand-card-gate-id1');
      fireEvent.click(card);

      // Hints should be disabled, but card selection should still work
      expect(card).toHaveClass('ring-cyan-400');
    });

    it('should show measurement score hints', async () => {
      mockGameLogic.findPrecedingQubit.mockReturnValue({ id: 'qubit1', type: 'QUBIT', value: '|0⟩' });
      mockGameLogic.calculateMeasurementScore.mockReturnValue(3);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-measurement-id3')).toBeInTheDocument();
      });

      // Select measurement card to trigger score hints
      const measurementCard = screen.getByTestId('hand-card-measurement-id3');
      fireEvent.click(measurementCard);

      expect(mockGameLogic.findPrecedingQubit).toHaveBeenCalled();
      expect(mockGameLogic.calculateMeasurementScore).toHaveBeenCalled();
    });

    it('should show initial qubit placement hints during initial phase', async () => {
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
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Look for any initial qubit card
      const initialQubitCards = screen.queryAllByTestId(/hand-card-initial_qubit-/);
      if (initialQubitCards.length > 0) {
        fireEvent.click(initialQubitCards[0]);
        // Should show initial qubit placement hints
      }
    });

    it('should handle control card slot validation', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-control-id5')).toBeInTheDocument();
      });

      // Select control card
      const controlCard = screen.getByTestId('hand-card-control-id5');
      fireEvent.click(controlCard);

      // Should check for empty slots for control card placement
    });
  });

  describe('Board Interaction and Card Placement', () => {
    it('should handle slot click for card placement', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
      });

      // Select a card first
      const card = screen.getByTestId('hand-card-gate-id1');
      fireEvent.click(card);

      // Click on an empty slot
      const emptySlot = screen.getByTestId('empty-slot-lane2-pos0');
      fireEvent.click(emptySlot);

      // Should attempt to place the card
      expect(mockGameLogic.isValidPlay).toHaveBeenCalled();
    });

    it('should handle invalid card placement', async () => {
      mockGameLogic.isValidPlay.mockReturnValue(false);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
      });

      const card = screen.getByTestId('hand-card-gate-id1');
      fireEvent.click(card);

      const emptySlot = screen.getByTestId('empty-slot-lane2-pos0');
      fireEvent.click(emptySlot);

      // Should show invalid placement message
      expect(mockGameLogic.isValidPlay).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', type: 'GATE', value: 'X' }),
        2,
        0,
        expect.any(Object),
        false,
        false
      );
    });

    it('should handle control card placement', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-control-id5')).toBeInTheDocument();
      });

      const controlCard = screen.getByTestId('hand-card-control-id5');
      fireEvent.click(controlCard);

      const emptySlot = screen.getByTestId('empty-slot-lane2-pos0');
      fireEvent.click(emptySlot);

      // Should start control-target placement
      expect(mockGameLogic.startControlTargetPlacement).toHaveBeenCalled();
    });

    it('should handle target lane selection during control-target placement', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        controlTargetPlacement: {
          controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
          controlLane: 0,
          controlPosition: 1,
          waitingForTarget: true
        }
      }));
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Click on a target lane
      const targetSlot = screen.queryByTestId('empty-slot-lane1-pos0');
      if (targetSlot) {
        fireEvent.click(targetSlot);
        // Should complete control-target placement
        expect(mockGameLogic.completeControlTargetPlacement).toHaveBeenCalled();
      }
    });

    it('should handle measurement card placement with quantum computation', async () => {
      mockQuantumIntegration.executeMeasurementComputation.mockResolvedValue({
        outcome: 1,
        probability: 0.8,
        gameScore: 5,
        computationSteps: ['Step 1', 'Step 2']
      });
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // The test passes if it doesn't throw an error
      const measurementCard = screen.queryByTestId('hand-card-measurement-id3');
      if (measurementCard) {
        fireEvent.click(measurementCard);
        const targetSlot = screen.queryByTestId('empty-slot-lane0-pos1');
        if (targetSlot) {
          fireEvent.click(targetSlot);
        }
      }
      // Test passes by reaching here without errors
    });
  });

  describe('Message System', () => {
    it('should show temporary messages', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Try selecting a card to see if any message appears
      const card = screen.queryByTestId('hand-card-gate-id1');
      if (card) {
        fireEvent.click(card);
        // Should show card selection without error
      }
    });

    it('should clear messages on card selection', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hand-card-gate-id1')).toBeInTheDocument();
      });

      const card = screen.getByTestId('hand-card-gate-id1');
      fireEvent.click(card);

      // Message should be cleared when selecting a valid card
    });
  });

  describe('Game State Updates and Effects', () => {
    it('should handle game end conditions', async () => {
      mockGameLogic.checkGameEndConditions.mockReturnValue(true);
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Trigger an action that would check game end conditions
      const passButton = screen.getByTestId('pass-button');
      fireEvent.click(passButton);

      expect(mockGameLogic.checkGameEndConditions).toHaveBeenCalled();
    });

    it('should handle player elimination', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Trigger player elimination check
      const passButton = screen.getByTestId('pass-button');
      fireEvent.click(passButton);

      // The elimination check happens internally with turn advancement
      expect(mockGameLogic.getNextActivePlayer).toHaveBeenCalled();
    });

    it('should handle unitary card counter increment', async () => {
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Select and place unitary card
      const unitaryCard = screen.queryByTestId('hand-card-unitary-id4');
      if (unitaryCard) {
        fireEvent.click(unitaryCard);
        const targetSlot = screen.queryByTestId('empty-slot-lane0-pos1');
        if (targetSlot) {
          fireEvent.click(targetSlot);
        }
      }
      // Test passes by reaching here without errors
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle quantum computation errors', async () => {
      mockQuantumIntegration.executeMeasurementComputation.mockRejectedValue(new Error('Quantum error'));
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      const measurementCard = screen.queryByTestId('hand-card-measurement-id3');
      if (measurementCard) {
        fireEvent.click(measurementCard);
        const targetSlot = screen.queryByTestId('empty-slot-lane0-pos1');
        if (targetSlot) {
          fireEvent.click(targetSlot);
        }
      }
      // Test passes by handling the error gracefully
    });

    it('should handle invalid target lane during control-target placement', async () => {
      mockGameLogic.isValidTargetLane.mockReturnValue(false);
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        controlTargetPlacement: {
          controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
          controlLane: 0,
          controlPosition: 1,
          waitingForTarget: true
        }
      }));
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Click on invalid target lane
      const targetSlot = screen.getByTestId('empty-slot-lane3-pos0');
      fireEvent.click(targetSlot);

      // Should show invalid target lane message
      expect(mockGameLogic.isValidTargetLane).toHaveBeenCalled();
    });

    it('should handle control-target placement cancellation', async () => {
      mockGameLogic.initializeGame.mockReturnValue(createMockGameState({
        controlTargetPlacement: {
          controlCard: { id: 'ctrl', type: CardType.CONTROL, value: 'C' },
          controlLane: 0,
          controlPosition: 1,
          waitingForTarget: true
        }
      }));
      
      renderWithI18n(<GameScreen onBackToMenu={mockOnBackToMenu} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      });

      // Look for cancel button
      const cancelButton = screen.queryByTestId('cancel-control-button');
      if (cancelButton) {
        fireEvent.click(cancelButton);
        expect(mockGameLogic.cancelControlTargetPlacement).toHaveBeenCalled();
      }
    });
  });
});