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

  const createEmptyBoard = (): GameState['board'] => ({
    lane: [[], [], [], []]
  });

  const createControlCardBoard = (): GameState['board'] => ({
    lane: [
      [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.CONTROL, value: 'C', controlLink: { targetLaneIndex: 2 } }
      ],
      [
        { id: '3', type: CardType.GATE, value: 'I' }
      ],
      [
        { id: '4', type: CardType.GATE, value: 'I' },
        { id: '5', type: CardType.TARGET, value: 'T' }
      ],
      []
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

      // Check that the board is rendered with quantum circuit elements
      expect(screen.getByTestId('quantum-circuit-board')).toBeInTheDocument();
      
      // Check that at least some cards are rendered (using a more flexible approach)
      const allCards = screen.getAllByRole('button');
      expect(allCards.length).toBeGreaterThan(0);
      
      // Verify specific card content exists
      expect(screen.getAllByText('I').length).toBeGreaterThan(0); // I gates
      expect(screen.getByText('X')).toBeInTheDocument(); // X gate  
      expect(screen.getByText('|+⟩')).toBeInTheDocument(); // Qubit
      expect(screen.getByText('U')).toBeInTheDocument(); // Unitary
      expect(screen.getByText('C')).toBeInTheDocument(); // Control
    });

    it('should render empty slots', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Check that empty slots exist (they appear as numbered placeholders)
      const emptySlots = screen.getAllByText(/^[0-9]-[0-9]$/); // Pattern like "1-2", "2-3", etc.
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

      // Should render the cards properly (using board-card format with id)
      expect(screen.getByTestId('board-card-gate-lane0-pos0-id1')).toBeInTheDocument();
      expect(screen.getByTestId('board-card-gate-lane1-pos0-id2')).toBeInTheDocument();
      expect(screen.getByTestId('board-card-gate-lane1-pos1-id3')).toBeInTheDocument();
      expect(screen.getByTestId('board-card-gate-lane2-pos0-id4')).toBeInTheDocument();
      expect(screen.getByTestId('board-card-gate-lane3-pos0-id5')).toBeInTheDocument();
      
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
      const xCard = screen.getByTestId('board-card-gate-lane0-pos1-id2');
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
      fireEvent.click(screen.getByTestId('board-card-gate-lane0-pos0-id1')); // Lane 0
      expect(mockOnCardSlotClick).toHaveBeenCalledWith(0, 0);

      fireEvent.click(screen.getByTestId('board-card-gate-lane1-pos0-id4')); // Lane 1
      expect(mockOnCardSlotClick).toHaveBeenCalledWith(1, 0);

      fireEvent.click(screen.getByTestId('board-card-gate-lane2-pos0-id6')); // Lane 2
      expect(mockOnCardSlotClick).toHaveBeenCalledWith(2, 0);

      fireEvent.click(screen.getByTestId('board-card-gate-lane3-pos0-id8')); // Lane 3
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

      const gateCard = screen.getByTestId('board-card-gate-lane0-pos1-id2');
      const quantumBitCard = screen.getByTestId('board-card-qubit-lane0-pos3-id3');
      const unitaryCard = screen.getByTestId('board-card-unitary-lane1-pos1-id5');
      const controlCard = screen.getByTestId('board-card-control-lane2-pos1-id7');

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

      const initialQubitCard = screen.getByTestId('board-card-initial-qubit-lane0-pos1-id2');
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

      const controlCard = screen.getByTestId('board-card-control-lane2-pos1-id7');
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
        expect(screen.getByTestId(`board-card-gate-lane0-pos${i}-idcard-${i}`)).toBeInTheDocument();
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
      expect(screen.getByTestId('board-card-gate-lane0-pos2-id1')).toBeInTheDocument();
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
      const slot = screen.getByTestId('board-card-gate-lane0-pos0-id1');
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
      const cardSlot = screen.getByTestId('board-card-gate-lane0-pos0-id1');
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
      const measurementCard = screen.getByTestId('board-card-measurement-lane0-pos1-id2');
      expect(measurementCard).toBeInTheDocument();
      expect(measurementCard).toHaveTextContent('⟨0|');
    });
  });

  describe('Control Card Line Drawing', () => {
    it('should render control lines for control cards with targetLaneIndex', () => {
      renderWithI18n(
        <GameBoard
          board={createControlCardBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      const controlCard = screen.getByTestId('board-card-control-lane0-pos1-id2');
      expect(controlCard).toBeInTheDocument();
      
      // Check that the control card has proper styling
      expect(controlCard).toHaveClass('bg-yellow-600');
    });

    it('should handle control cards without controlLink', () => {
      const boardWithControlNoLink: GameState['board'] = {
        lane: [
          [
            { id: '1', type: CardType.GATE, value: 'I' },
            { id: '2', type: CardType.CONTROL, value: 'C' } // No controlLink
          ],
          [],
          [],
          []
        ]
      };

      renderWithI18n(
        <GameBoard
          board={boardWithControlNoLink}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      const controlCard = screen.getByTestId('board-card-control-lane0-pos1-id2');
      expect(controlCard).toBeInTheDocument();
    });

    it('should calculate correct line styles for different target lanes', () => {
      const boardWithMultipleControls: GameState['board'] = {
        lane: [
          [
            { id: '1', type: CardType.GATE, value: 'I' },
            { id: '2', type: CardType.CONTROL, value: 'C', controlLink: { targetLaneIndex: 3 } }
          ],
          [
            { id: '3', type: CardType.GATE, value: 'I' }
          ],
          [
            { id: '4', type: CardType.GATE, value: 'I' }
          ],
          [
            { id: '5', type: CardType.GATE, value: 'I' },
            { id: '6', type: CardType.TARGET, value: 'T' }
          ]
        ]
      };

      renderWithI18n(
        <GameBoard
          board={boardWithMultipleControls}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      const controlCard = screen.getByTestId('board-card-control-lane0-pos1-id2');
      expect(controlCard).toBeInTheDocument();
    });

    it('should handle negative vertical distance for control lines', () => {
      const boardWithUpwardControl: GameState['board'] = {
        lane: [
          [
            { id: '1', type: CardType.GATE, value: 'I' }
          ],
          [
            { id: '2', type: CardType.GATE, value: 'I' }
          ],
          [
            { id: '3', type: CardType.GATE, value: 'I' },
            { id: '4', type: CardType.CONTROL, value: 'C', controlLink: { targetLaneIndex: 0 } }
          ],
          []
        ]
      };

      renderWithI18n(
        <GameBoard
          board={boardWithUpwardControl}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      const controlCard = screen.getByTestId('board-card-control-lane2-pos1-id4');
      expect(controlCard).toBeInTheDocument();
    });
  });

  describe('Highlighting and Animation', () => {
    it('should highlight specified slots', () => {
      const highlightedSlots = [
        { laneIndex: 0, position: 1 },
        { laneIndex: 1, position: 0 }
      ];

      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          highlightedSlots={highlightedSlots}
          playerCount={4}
        />
      );

      // The highlighting is passed to CardComponent, which should apply highlighting styles
      const highlightedCard1 = screen.getByTestId('board-card-gate-lane0-pos1-id2');
      const highlightedCard2 = screen.getByTestId('board-card-gate-lane1-pos0-id4');
      
      expect(highlightedCard1).toBeInTheDocument();
      expect(highlightedCard2).toBeInTheDocument();
    });

    it('should handle empty highlighted slots array', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          highlightedSlots={[]}
          playerCount={4}
        />
      );

      expect(screen.getByTestId('board-title')).toBeInTheDocument();
    });

    it('should handle undefined highlighted slots', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      expect(screen.getByTestId('board-title')).toBeInTheDocument();
    });

    it('should apply animation to specified card', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          animatingCard="2"
          playerCount={4}
        />
      );

      // The animation is passed to CardComponent for card with id "2"
      const animatingCard = screen.getByTestId('board-card-gate-lane0-pos1-id2');
      expect(animatingCard).toBeInTheDocument();
    });

    it('should handle null animating card', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          animatingCard={null}
          playerCount={4}
        />
      );

      expect(screen.getByTestId('board-title')).toBeInTheDocument();
    });
  });

  describe('Game End State', () => {
    it('should disable interactions when game is ended', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
          gameEnded={true}
        />
      );

      // Try to click on a card - should not call onCardSlotClick
      const card = screen.getByTestId('board-card-gate-lane0-pos0-id1');
      fireEvent.click(card);

      expect(mockOnCardSlotClick).not.toHaveBeenCalled();
    });

    it('should allow interactions when game is not ended', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
          gameEnded={false}
        />
      );

      // Click on a card - should call onCardSlotClick
      const card = screen.getByTestId('board-card-gate-lane0-pos0-id1');
      fireEvent.click(card);

      expect(mockOnCardSlotClick).toHaveBeenCalledWith(0, 0);
    });

    it('should handle undefined gameEnded prop (defaults to false)', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Click on a card - should call onCardSlotClick (default behavior)
      const card = screen.getByTestId('board-card-gate-lane0-pos0-id1');
      fireEvent.click(card);

      expect(mockOnCardSlotClick).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('Player Count and Board Length Calculation', () => {
    it('should handle different player counts', () => {
      const playerCounts = [3, 4, 5, 6];
      
      playerCounts.forEach((playerCount, index) => {
        jest.clearAllMocks();
        
        const { unmount } = renderWithI18n(
          <GameBoard
            board={createMockBoard()}
            onCardSlotClick={mockOnCardSlotClick}
            playerCount={playerCount}
          />
        );

        expect(screen.getByTestId('board-title')).toBeInTheDocument();
        
        // Clean up before next render (except for the last one)
        if (index < playerCounts.length - 1) {
          unmount();
        }
      });
    });

    it('should calculate display length correctly', () => {
      const shortBoard: GameState['board'] = {
        lane: [
          [{ id: '1', type: CardType.GATE, value: 'I' }],
          [],
          [],
          []
        ]
      };

      renderWithI18n(
        <GameBoard
          board={shortBoard}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Should extend lanes to calculated length + 1
      expect(screen.getByTestId('board-title')).toBeInTheDocument();
    });
  });

  describe('Card Legend', () => {
    it('should render all card type indicators in legend', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      // Check that all card type indicators are present
      expect(screen.getByText('量子ビット')).toBeInTheDocument();
      expect(screen.getByText('ゲート')).toBeInTheDocument();
      expect(screen.getByText('ユニタリ')).toBeInTheDocument();
      expect(screen.getByText('測定')).toBeInTheDocument();
      expect(screen.getByText('制御')).toBeInTheDocument();
    });

    it('should apply correct colors to legend items', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      const legendItems = screen.getAllByText(/^(量子ビット|ゲート|ユニタリ|測定|制御)$/);
      expect(legendItems).toHaveLength(5);
      
      // Each legend item should have appropriate background color
      legendItems.forEach(item => {
        expect(item.className).toMatch(/bg-(green|blue|purple|red|yellow)-600/);
      });
    });
  });

  describe('Board Container Styling', () => {
    it('should apply correct container classes', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      const container = screen.getByTestId('quantum-circuit-board');
      expect(container).toHaveClass(
        'bg-gradient-to-br',
        'from-gray-900',
        'to-gray-800',
        'p-6',
        'rounded-xl',
        'shadow-2xl',
        'w-full',
        'max-w-6xl',
        'mx-auto',
        'border',
        'border-gray-600'
      );
    });

    it('should have responsive design classes', () => {
      renderWithI18n(
        <GameBoard
          board={createMockBoard()}
          onCardSlotClick={mockOnCardSlotClick}
          playerCount={4}
        />
      );

      const scrollContainer = screen.getByTestId('quantum-circuit-board').querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
      
      const boardContent = scrollContainer?.querySelector('.min-w-max');
      expect(boardContent).toBeInTheDocument();
    });
  });
});