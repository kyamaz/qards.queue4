// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameBoard from '../../src/components/GameBoard';
import { Card, CardType, GameState } from '../../src/game/types';
import { I18nProvider } from '../../src/i18n';

describe('GameBoard Component', () => {
  const mockOnCardSlotClick = jest.fn();
  
  // Test wrapper that provides I18nProvider context
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <I18nProvider>{children}</I18nProvider>
  );

  const renderWithI18n = (ui: React.ReactElement) => {
    return render(ui, { wrapper: TestWrapper });
  };
  
  const createMockBoard = (): GameState['board'] => ({
    lane: [
      [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.GATE, value: 'X' },
        null,
        { id: '3', type: CardType.QUBIT, value: '|+⟩' }
      ],
      [
        { id: '4', type: CardType.GATE, value: 'I' },
        { id: '5', type: CardType.UNITARY, value: 'U' }
      ],
      [
        { id: '6', type: CardType.GATE, value: 'I' },
        { id: '7', type: CardType.CONTROL, value: 'C', controlLink: { targetLaneIndex: 1 } }
      ],
      [
        { id: '8', type: CardType.GATE, value: 'I' }
      ]
    ]
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render quantum circuit title', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Check quantum circuit title
      expect(screen.getByTestId('board-title')).toBeInTheDocument();
      expect(screen.getByTestId('board-title')).toHaveTextContent('量子回路');
    });

    it('should render cards in correct positions', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Check specific cards are rendered in correct positions
      expect(screen.getByTestId('card-gate-lane0-pos0')).toBeInTheDocument(); // I gate
      expect(screen.getByTestId('card-gate-lane0-pos1')).toBeInTheDocument(); // X gate
      expect(screen.getByTestId('card-qubit-lane0-pos3')).toBeInTheDocument(); // |+⟩
      expect(screen.getByTestId('card-gate-lane1-pos0')).toBeInTheDocument(); // I gate
      expect(screen.getByTestId('card-unitary-lane1-pos1')).toBeInTheDocument(); // U
      expect(screen.getByTestId('card-gate-lane2-pos0')).toBeInTheDocument(); // I gate
      expect(screen.getByTestId('card-control-lane2-pos1')).toBeInTheDocument(); // C
      expect(screen.getByTestId('card-gate-lane3-pos0')).toBeInTheDocument(); // I gate
    });

    it('should render empty slots', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Check for empty slot at lane 0, position 2
      expect(screen.getByTestId('empty-slot-lane0-pos2')).toBeInTheDocument();
      
      // Check that empty slots exist in other lanes too
      const lane1 = screen.getByTestId('board-lane-1');
      const emptySlots = within(lane1).getAllByTestId(/empty-slot-lane1-pos\d+/);
      expect(emptySlots.length).toBeGreaterThan(0);
    });

    it('should extend lanes to maximum length with empty slots', () => {
      const board: GameState['board'] = {
        lane: [
          [{ id: '1', type: CardType.GATE, value: 'I' }],
          [{ id: '2', type: CardType.GATE, value: 'I' }, { id: '3', type: CardType.GATE, value: 'X' }],
          [{ id: '4', type: CardType.GATE, value: 'I' }],
          [{ id: '5', type: CardType.GATE, value: 'I' }]
        ]
      };

      renderWithI18n(
        <GameBoard
          board={board}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Should render the cards properly
      expect(screen.getByTestId('card-gate-lane0-pos0')).toBeInTheDocument();
      expect(screen.getByTestId('card-gate-lane1-pos0')).toBeInTheDocument();
      expect(screen.getByTestId('card-gate-lane1-pos1')).toBeInTheDocument();
      expect(screen.getByTestId('card-gate-lane2-pos0')).toBeInTheDocument();
      expect(screen.getByTestId('card-gate-lane3-pos0')).toBeInTheDocument();
      
      // Check that empty slots fill remaining positions
      expect(screen.getByTestId('empty-slot-lane0-pos1')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onCardSlotClick with correct parameters when slot is clicked', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Click on the empty slot in lane 0, position 2
      const emptySlot = screen.getByTestId('empty-slot-lane0-pos2');
      fireEvent.click(emptySlot);

      expect(mockOnCardSlotClick).toHaveBeenCalledWith(0, 2);
    });

    it('should call onCardSlotClick when clicking on occupied slot', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Click on the X card in lane 0, position 1
      const xCard = screen.getByTestId('card-gate-lane0-pos1');
      fireEvent.click(xCard);

      expect(mockOnCardSlotClick).toHaveBeenCalledWith(0, 1);
    });

    it('should handle clicks on all lanes', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Click on first card (I gate) in each lane
      fireEvent.click(screen.getByTestId('card-gate-lane0-pos0')); // Lane 0
      expect(mockOnCardSlotClick).toHaveBeenCalledWith(0, 0);

      fireEvent.click(screen.getByTestId('card-gate-lane1-pos0')); // Lane 1
      expect(mockOnCardSlotClick).toHaveBeenCalledWith(1, 0);

      fireEvent.click(screen.getByTestId('card-gate-lane2-pos0')); // Lane 2
      expect(mockOnCardSlotClick).toHaveBeenCalledWith(2, 0);

      fireEvent.click(screen.getByTestId('card-gate-lane3-pos0')); // Lane 3
      expect(mockOnCardSlotClick).toHaveBeenCalledWith(3, 0);
    });
  });

  describe('Card Type Styling', () => {
    it('should apply correct styles for different card types', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      const gateCard = screen.getByTestId('card-gate-lane0-pos1');
      const quantumBitCard = screen.getByTestId('card-qubit-lane0-pos3');
      const unitaryCard = screen.getByTestId('card-unitary-lane1-pos1');
      const controlCard = screen.getByTestId('card-control-lane2-pos1');

      expect(gateCard).toHaveClass('bg-blue-600');
      expect(quantumBitCard).toHaveClass('bg-green-600');
      expect(unitaryCard).toHaveClass('bg-purple-600');
      expect(controlCard).toHaveClass('bg-yellow-600');
    });

    it('should apply darker color for initial qubit cards', () => {
      const board: GameState['board'] = {
        lane: [
          [
            { id: '1', type: CardType.GATE, value: 'I' },
            { id: '2', type: CardType.INITIAL_QUBIT, value: '|0⟩' }
          ],
          [],
          [],
          []
        ]
      };

      renderWithI18n(
        <GameBoard
          board={board}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      const initialQubitCard = screen.getByTestId('card-initial-qubit-lane0-pos1');
      expect(initialQubitCard).toHaveClass('bg-green-800');
    });

    it('should show control link indicator for control cards', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      const controlCard = screen.getByTestId('card-control-lane2-pos1');
      expect(controlCard).toHaveTextContent('C');
      expect(controlCard).toHaveTextContent('→2'); // Links to lane 2 (1-indexed display)
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty board', () => {
      const emptyBoard: GameState['board'] = {
        lane: [[], [], [], []]
      };

      renderWithI18n(
        <GameBoard
          board={emptyBoard}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      // Should still render quantum circuit title and board
      expect(screen.getByTestId('board-title')).toBeInTheDocument();
      expect(screen.getByTestId('quantum-circuit-board')).toBeInTheDocument();
    });

    it('should handle board with very long lanes', () => {
      const longLane = Array(20).fill(null).map((_, i) => ({
        id: `card-${i}`,
        type: CardType.GATE,
        value: 'X' as const
      }));

      const board: GameState['board'] = {
        lane: [longLane, [], [], []]
      };

      renderWithI18n(
        <GameBoard
          board={board}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Check that all 20 cards are rendered
      for (let i = 0; i < 20; i++) {
        expect(screen.getByTestId(`card-gate-lane0-pos${i}`)).toBeInTheDocument();
      }
    });

    it('should handle null values in lanes correctly', () => {
      const board: GameState['board'] = {
        lane: [
          [null, null, { id: '1', type: CardType.GATE, value: 'X' }, null],
          [],
          [],
          []
        ]
      };

      renderWithI18n(
        <GameBoard
          board={board}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Should render the X card at position 2
      expect(screen.getByTestId('card-gate-lane0-pos2')).toBeInTheDocument();
      // Should render empty slots for null positions
      expect(screen.getByTestId('empty-slot-lane0-pos0')).toBeInTheDocument();
      expect(screen.getByTestId('empty-slot-lane0-pos1')).toBeInTheDocument();
      expect(screen.getByTestId('empty-slot-lane0-pos3')).toBeInTheDocument();
    });

    it('should handle undefined onCardSlotClick gracefully', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={undefined as any}
          playerCount={4}
        />
      );

      // Should render without errors
      expect(screen.getByTestId('board-title')).toBeInTheDocument();
      expect(screen.getByTestId('quantum-circuit-board')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should apply hover effects to slots', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Get a card slot
      const slot = screen.getByTestId('card-gate-lane0-pos0');
      // Check if hover effect class is present
      const classList = slot.className;
      expect(classList).toContain('hover:');
    });

    it('should have consistent slot sizing', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Check both card and empty slot sizes
      const cardSlot = screen.getByTestId('card-gate-lane0-pos0');
      const emptySlot = screen.getByTestId('empty-slot-lane0-pos2');
      
      expect(cardSlot.className).toContain('w-24');
      expect(cardSlot.className).toContain('h-32');
      expect(emptySlot.className).toContain('w-24');
      expect(emptySlot.className).toContain('h-32');
    });

    it('should display measurement cards correctly', () => {
      const boardWithMeasurement: GameState['board'] = {
        lane: [
          [
            { id: '1', type: CardType.GATE, value: 'I' },
            { id: '2', type: CardType.MEASUREMENT, value: '⟨0|' }
          ],
          [],
          [],
          []
        ]
      };

      renderWithI18n(
        <GameBoard
          board={boardWithMeasurement}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Check that measurement card is rendered at correct position
      const measurementCard = screen.getByTestId('card-measurement-lane0-pos1');
      expect(measurementCard).toBeInTheDocument();
      expect(measurementCard).toHaveTextContent('⟨0|');
    });
  });
});