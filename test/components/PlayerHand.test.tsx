import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerHand from '../../src/components/PlayerHand';
import { Card, CardType } from '../../src/game/types';

describe('PlayerHand Component', () => {
  const mockCards: Card[] = [
    { id: '1', type: CardType.GATE, value: 'X' },
    { id: '2', type: CardType.QUANTUM_BIT, value: '|+⟩' },
    { id: '3', type: CardType.MEASUREMENT, value: '<0|' },
    { id: '4', type: CardType.UNITARY, value: 'U' },
    { id: '5', type: CardType.CONTROL, value: 'C' },
  ];

  const mockOnCardClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render player name', () => {
      render(
        <PlayerHand
          hand={mockCards}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    it('should render all cards in hand', () => {
      render(
        <PlayerHand
          hand={mockCards}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      expect(screen.getByText('X')).toBeInTheDocument();
      expect(screen.getByText('|+⟩')).toBeInTheDocument();
      expect(screen.getByText('<0|')).toBeInTheDocument();
      expect(screen.getByText('U')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('should render empty hand message when no cards', () => {
      render(
        <PlayerHand
          hand={[]}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      expect(screen.getByText('手札がありません')).toBeInTheDocument();
    });

    it('should apply different styles for current player vs other players', () => {
      const { rerender } = render(
        <PlayerHand
          hand={mockCards}
          playerName="Current Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      expect(screen.getByText('Current Player').parentElement).toHaveClass('bg-gray-900');

      rerender(
        <PlayerHand
          hand={mockCards}
          playerName="Other Player"
          isCurrentPlayer={false}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      expect(screen.getByText('Other Player').parentElement).toHaveClass('bg-gray-800');
    });
  });

  describe('Card Selection', () => {
    it('should call onCardClick when card is clicked for current player', () => {
      render(
        <PlayerHand
          hand={mockCards}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      const firstCard = screen.getByText('X').parentElement;
      fireEvent.click(firstCard!);

      expect(mockOnCardClick).toHaveBeenCalledWith(mockCards[0]);
      expect(mockOnCardClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onCardClick for other players cards', () => {
      render(
        <PlayerHand
          hand={mockCards}
          playerName="Other Player"
          isCurrentPlayer={false}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      const firstCard = screen.getByText('X').parentElement;
      fireEvent.click(firstCard!);

      expect(mockOnCardClick).not.toHaveBeenCalled();
    });

    it('should highlight selected card', () => {
      render(
        <PlayerHand
          hand={mockCards}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={mockCards[0]}
        />
      );

      const selectedCard = screen.getByText('X').parentElement;
      expect(selectedCard).toHaveClass('ring-4', 'ring-yellow-400');
    });

    it('should not show cursor-pointer for non-current player', () => {
      render(
        <PlayerHand
          hand={mockCards}
          playerName="Other Player"
          isCurrentPlayer={false}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      const card = screen.getByText('X').parentElement;
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Card Type Styling', () => {
    it('should apply correct colors for different card types', () => {
      render(
        <PlayerHand
          hand={mockCards}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      const gateCard = screen.getByText('X').parentElement;
      const quantumBitCard = screen.getByText('|+⟩').parentElement;
      const measurementCard = screen.getByText('<0|').parentElement;
      const unitaryCard = screen.getByText('U').parentElement;
      const controlCard = screen.getByText('C').parentElement;

      expect(gateCard).toHaveClass('bg-blue-600');
      expect(quantumBitCard).toHaveClass('bg-green-600');
      expect(measurementCard).toHaveClass('bg-red-600');
      expect(unitaryCard).toHaveClass('bg-purple-600');
      expect(controlCard).toHaveClass('bg-yellow-600');
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate hover states for current player', () => {
      render(
        <PlayerHand
          hand={mockCards}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      const card = screen.getByText('X').parentElement;
      expect(card).toHaveClass('hover:ring-2');
    });

    it('should handle keyboard navigation if implemented', () => {
      // This test is a placeholder for future keyboard navigation implementation
      render(
        <PlayerHand
          hand={mockCards}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      // Future: Test keyboard events like Enter or Space to select cards
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long player names', () => {
      const longName = 'A'.repeat(50);
      render(
        <PlayerHand
          hand={mockCards}
          playerName={longName}
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle large number of cards', () => {
      const manyCards = Array.from({ length: 20 }, (_, i) => ({
        id: `card-${i}`,
        type: CardType.GATE,
        value: 'X' as const,
      }));

      render(
        <PlayerHand
          hand={manyCards}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      const cards = screen.getAllByText('X');
      expect(cards).toHaveLength(20);
    });

    it('should handle undefined onCardClick gracefully', () => {
      render(
        <PlayerHand
          hand={mockCards}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={undefined as any}
          selectedCard={null}
        />
      );

      const card = screen.getByText('X').parentElement;
      
      // Should not throw error when clicking
      expect(() => fireEvent.click(card!)).not.toThrow();
    });
  });
});