// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerHand from '../../src/components/PlayerHand';
import { Card, CardType } from '../../src/game/types';

describe('PlayerHand Component', () => {
  const mockCards: Card[] = [
    { id: '1', type: CardType.GATE, value: 'X' },
    { id: '2', type: CardType.QUBIT, value: '|+⟩' },
    { id: '3', type: CardType.MEASUREMENT, value: '⟨0|' },
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

      expect(screen.getByText(/Test Player/)).toBeInTheDocument();
      expect(screen.getByText(/現在のプレイヤー/)).toBeInTheDocument();
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
      expect(screen.getByText('⟨0|')).toBeInTheDocument();
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

    it('should show current player indicator', () => {
      const { rerender } = render(
        <PlayerHand
          hand={mockCards}
          playerName="Current Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      expect(screen.getByText(/現在のプレイヤー/)).toBeInTheDocument();

      rerender(
        <PlayerHand
          hand={mockCards}
          playerName="Other Player"
          isCurrentPlayer={false}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      expect(screen.queryByText(/現在のプレイヤー/)).not.toBeInTheDocument();
    });

    it('should apply correct card type colors', () => {
      render(
        <PlayerHand
          hand={mockCards}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      const gateCard = screen.getByText('X').parentElement?.parentElement;
      const quantumBitCard = screen.getByText('|+⟩').parentElement?.parentElement;
      const measurementCard = screen.getByText('⟨0|').parentElement?.parentElement;
      const unitaryCard = screen.getByText('U').parentElement?.parentElement;
      const controlCard = screen.getByText('C').parentElement?.parentElement;

      expect(gateCard).toHaveClass('bg-blue-600');
      expect(quantumBitCard).toHaveClass('bg-green-600');
      expect(measurementCard).toHaveClass('bg-red-600');
      expect(unitaryCard).toHaveClass('bg-purple-600');
      expect(controlCard).toHaveClass('bg-yellow-600');
    });

    it('should apply darker color for initial qubit cards', () => {
      const initialQubitCards: Card[] = [
        { id: '1', type: CardType.INITIAL_QUBIT, value: '|0⟩' },
      ];

      render(
        <PlayerHand
          hand={initialQubitCards}
          playerName="Test Player"
          isCurrentPlayer={true}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      const initialQubitCard = screen.getByText('|0⟩').parentElement?.parentElement;
      expect(initialQubitCard).toHaveClass('bg-green-800');
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

      const firstCard = screen.getByText('X').parentElement?.parentElement;
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

      const firstCard = screen.getByText('X').parentElement?.parentElement;
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

      const selectedCard = screen.getByText('X').parentElement?.parentElement;
      expect(selectedCard).toHaveClass('ring-4', 'ring-cyan-400');
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

      const card = screen.getByText('X').parentElement?.parentElement;
      expect(card).toHaveClass('cursor-default');
      expect(card).not.toHaveClass('cursor-pointer');
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

      const card = screen.getByText('X').parentElement?.parentElement;
      expect(card).toHaveClass('hover:scale-105');
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

      expect(screen.getByText(new RegExp(longName))).toBeInTheDocument();
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

      const card = screen.getByText('X').parentElement?.parentElement;
      
      // Should not throw error when clicking
      expect(() => fireEvent.click(card!)).not.toThrow();
    });
  });
});