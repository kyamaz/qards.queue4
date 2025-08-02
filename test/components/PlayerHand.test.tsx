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

      const playerTitle = screen.getByTestId('player-hand-title');
      expect(playerTitle).toHaveTextContent('Test Player');
      expect(playerTitle).toHaveTextContent('現在のプレイヤー');
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

      // Check that the cards container is rendered
      const cardsContainer = screen.getByTestId('hand-cards-container');
      expect(cardsContainer).toBeInTheDocument();

      // Check each card by its data-testid
      expect(screen.getByTestId('card-gate-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-qubit-2')).toBeInTheDocument();
      expect(screen.getByTestId('card-measurement-3')).toBeInTheDocument();
      expect(screen.getByTestId('card-unitary-4')).toBeInTheDocument();
      expect(screen.getByTestId('card-control-5')).toBeInTheDocument();

      // Verify the card values are displayed
      expect(screen.getByTestId('card-gate-1')).toHaveTextContent('X');
      expect(screen.getByTestId('card-qubit-2')).toHaveTextContent('|+⟩');
      expect(screen.getByTestId('card-measurement-3')).toHaveTextContent('⟨0|');
      expect(screen.getByTestId('card-unitary-4')).toHaveTextContent('U');
      expect(screen.getByTestId('card-control-5')).toHaveTextContent('C');
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

      const emptyMessage = screen.getByTestId('empty-hand-message');
      expect(emptyMessage).toBeInTheDocument();
      expect(emptyMessage).toHaveTextContent('手札がありません');
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

      const playerTitle = screen.getByTestId('player-hand-title');
      expect(playerTitle).toHaveTextContent('現在のプレイヤー');

      rerender(
        <PlayerHand
          hand={mockCards}
          playerName="Other Player"
          isCurrentPlayer={false}
          onCardClick={mockOnCardClick}
          selectedCard={null}
        />
      );

      const updatedTitle = screen.getByTestId('player-hand-title');
      expect(updatedTitle).not.toHaveTextContent('現在のプレイヤー');
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

      const gateCard = screen.getByTestId('card-gate-1');
      const quantumBitCard = screen.getByTestId('card-qubit-2');
      const measurementCard = screen.getByTestId('card-measurement-3');
      const unitaryCard = screen.getByTestId('card-unitary-4');
      const controlCard = screen.getByTestId('card-control-5');

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

      const initialQubitCard = screen.getByTestId('card-initial-qubit-1');
      expect(initialQubitCard).toHaveClass('bg-green-800');
      expect(initialQubitCard).toHaveTextContent('|0⟩');
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

      const firstCard = screen.getByTestId('card-gate-1');
      fireEvent.click(firstCard);

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

      const firstCard = screen.getByTestId('card-gate-1');
      fireEvent.click(firstCard);

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

      const selectedCard = screen.getByTestId('card-gate-1');
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

      const card = screen.getByTestId('card-gate-1');
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

      const card = screen.getByTestId('card-gate-1');
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

      const playerTitle = screen.getByTestId('player-hand-title');
      expect(playerTitle).toHaveTextContent(longName);
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

      // Check that all cards are rendered with correct data-testid
      for (let i = 0; i < 20; i++) {
        const card = screen.getByTestId(`card-gate-card-${i}`);
        expect(card).toBeInTheDocument();
        expect(card).toHaveTextContent('X');
      }
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

      const card = screen.getByTestId('card-gate-1');
      
      // Should not throw error when clicking
      expect(() => fireEvent.click(card)).not.toThrow();
    });
  });
});