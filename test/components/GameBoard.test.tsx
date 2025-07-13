import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameBoard from '../../src/components/GameBoard';
import { Card, CardType, GameState } from '../../src/game/types';

describe('GameBoard Component', () => {
  const mockOnCardSlotClick = jest.fn();
  
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
      render(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      // Check quantum circuit title
      expect(screen.getByText('量子回路')).toBeInTheDocument();
    });

    it('should render cards in correct positions', () => {
      render(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      // Check some cards are rendered
      expect(screen.getAllByText('I')).toHaveLength(4); // 4 I gates
      expect(screen.getByText('X')).toBeInTheDocument();
      expect(screen.getByText('|+⟩')).toBeInTheDocument();
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should render empty slots', () => {
      render(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      // Empty slots should have specific styling
      const emptySlots = screen.getAllByText('空');
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

      render(
        <GameBoard
          board={board}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      // All lanes should be extended to have equal length (max length + 1, minimum 11)
      const slots = screen.getAllByRole('button');
      // 4 lanes * 11 slots each = 44 total slots (max length 2 + 1 = 3, but minimum is 10 + 1 = 11)
      expect(slots.length).toBe(44);
    });
  });

  describe('Interaction', () => {
    it('should call onCardSlotClick with correct parameters when slot is clicked', () => {
      render(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      // Click on the first empty slot in lane 1 (position 2)
      const emptySlots = screen.getAllByText('空');
      fireEvent.click(emptySlots[0]);

      expect(mockOnCardSlotClick).toHaveBeenCalledWith(0, 2);
    });

    it('should call onCardSlotClick when clicking on occupied slot', () => {
      render(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      // Click on the X card in lane 1 (position 1)
      const xCard = screen.getByText('X');
      fireEvent.click(xCard.parentElement!);

      expect(mockOnCardSlotClick).toHaveBeenCalledWith(0, 1);
    });

    it('should handle clicks on all lanes', () => {
      render(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      // Click on I gate in each lane
      const iGates = screen.getAllByText('I');
      
      fireEvent.click(iGates[0].parentElement!); // Lane 0
      expect(mockOnCardSlotClick).toHaveBeenCalledWith(0, 0);

      fireEvent.click(iGates[1].parentElement!); // Lane 1
      expect(mockOnCardSlotClick).toHaveBeenCalledWith(1, 0);

      fireEvent.click(iGates[2].parentElement!); // Lane 2
      expect(mockOnCardSlotClick).toHaveBeenCalledWith(2, 0);

      fireEvent.click(iGates[3].parentElement!); // Lane 3
      expect(mockOnCardSlotClick).toHaveBeenCalledWith(3, 0);
    });
  });

  describe('Card Type Styling', () => {
    it('should apply correct styles for different card types', () => {
      render(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      const gateCard = screen.getByText('X').parentElement?.parentElement;
      const quantumBitCard = screen.getByText('|+⟩').parentElement?.parentElement;
      const unitaryCard = screen.getByText('U').parentElement?.parentElement;
      const controlCard = screen.getByText('C').parentElement?.parentElement;

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

      render(
        <GameBoard
          board={board}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      const initialQubitCard = screen.getByText('|0⟩').parentElement?.parentElement;
      expect(initialQubitCard).toHaveClass('bg-green-800');
    });

    it('should show control link indicator for control cards', () => {
      render(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      const controlCard = screen.getByText('C').parentElement?.parentElement;
      expect(controlCard).toHaveTextContent('→2'); // Links to lane 2 (1-indexed display)
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty board', () => {
      const emptyBoard: GameState['board'] = {
        lane: [[], [], [], []]
      };

      render(
        <GameBoard
          board={emptyBoard}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      // Should still render quantum circuit title and empty slots
      expect(screen.getByText('量子回路')).toBeInTheDocument();
      
      const emptySlots = screen.getAllByText('空');
      expect(emptySlots.length).toBeGreaterThanOrEqual(4); // At least one per lane
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

      render(
        <GameBoard
          board={board}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      const xCards = screen.getAllByText('X');
      expect(xCards).toHaveLength(20);
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

      render(
        <GameBoard
          board={board}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      // Should render empty slots for null values
      const emptySlots = screen.getAllByText('空');
      expect(emptySlots.length).toBeGreaterThan(3); // At least 3 nulls in lane 1
    });

    it('should handle undefined onCardSlotClick gracefully', () => {
      render(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={undefined as any}
        />
      );

      const slot = screen.getAllByText('空')[0];
      
      // Should not throw error when clicking with optional chaining
      expect(() => fireEvent.click(slot)).not.toThrow();
    });
  });

  describe('Layout and Styling', () => {
    it('should apply hover effects to slots', () => {
      render(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      const slot = screen.getAllByRole('button')[0];
      expect(slot).toHaveClass('hover:scale-105');
    });

    it('should have consistent slot sizing', () => {
      render(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      const slots = screen.getAllByRole('button');
      slots.forEach(slot => {
        expect(slot).toHaveClass('w-24', 'h-32');
      });
    });

    it('should display measurement counts if implemented', () => {
      // This is a placeholder for future feature
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

      render(
        <GameBoard
          board={boardWithMeasurement}
          onCardSlotClick={mockOnCardSlotClick}
        />
      );

      // Future: Check for measurement count display
      expect(screen.getByText('⟨0|')).toBeInTheDocument();
    });
  });
});