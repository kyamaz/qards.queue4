// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardComponent from '../../../src/components/cards/CardComponent';
import { Card, CardType } from '../../../src/game/types';

describe('CardComponent', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Card Types', () => {
    it('should render QubitCard for QUBIT type', () => {
      const card: Card = { id: '1', type: CardType.QUBIT, value: '|+⟩' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
        />
      );

      const cardElement = screen.getByText('|+⟩').parentElement?.parentElement;
      expect(cardElement).toHaveClass('bg-green-600');
    });

    it('should render QubitCard with darker color for INITIAL_QUBIT type', () => {
      const card: Card = { id: '1', type: CardType.INITIAL_QUBIT, value: '|0⟩' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
        />
      );

      const cardElement = screen.getByText('|0⟩').parentElement?.parentElement;
      expect(cardElement).toHaveClass('bg-green-800');
    });

    it('should render GateCard for GATE type', () => {
      const card: Card = { id: '1', type: CardType.GATE, value: 'X' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('bg-blue-600');
    });

    it('should render UnitaryCard for UNITARY type', () => {
      const card: Card = { id: '1', type: CardType.UNITARY, value: 'U' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
        />
      );

      const cardElement = screen.getByText('U').parentElement?.parentElement;
      expect(cardElement).toHaveClass('bg-purple-600');
    });

    it('should render MeasurementCard for MEASUREMENT type', () => {
      const card: Card = { id: '1', type: CardType.MEASUREMENT, value: '⟨0|' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
        />
      );

      const cardElement = screen.getByText('⟨0|').parentElement?.parentElement;
      expect(cardElement).toHaveClass('bg-red-600');
    });

    it('should render ControlCard for CONTROL type with target lane', () => {
      const card: Card = { 
        id: '1', 
        type: CardType.CONTROL, 
        value: 'C', 
        controlLink: { targetLaneIndex: 1 } 
      };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
        />
      );

      const cardElement = screen.getByText('C').parentElement?.parentElement;
      expect(cardElement).toHaveClass('bg-yellow-600');
      expect(screen.getByText('→2')).toBeInTheDocument(); // 1-indexed display
    });

    it('should render EmptySlot when card is null', () => {
      render(
        <CardComponent
          card={null}
          position={5}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument(); // position (0-based)
    });
  });

  describe('Interaction', () => {
    it('should call onClick when card is clicked', () => {
      const card: Card = { id: '1', type: CardType.GATE, value: 'X' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
          isClickable={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      fireEvent.click(cardElement!);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when card is not clickable', () => {
      const card: Card = { id: '1', type: CardType.GATE, value: 'X' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
          isClickable={false}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      fireEvent.click(cardElement!);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should call onClick when empty slot is clicked', () => {
      render(
        <CardComponent
          card={null}
          position={0}
          onClick={mockOnClick}
          isClickable={true}
        />
      );

      const emptySlot = screen.getByText('0').parentElement?.parentElement;
      fireEvent.click(emptySlot!);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual States', () => {
    it('should apply selected styling when isSelected is true', () => {
      const card: Card = { id: '1', type: CardType.GATE, value: 'X' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
          isSelected={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('ring-4', 'ring-cyan-400');
    });

    it('should apply highlighted styling when isHighlighted is true', () => {
      const card: Card = { id: '1', type: CardType.GATE, value: 'X' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
          isHighlighted={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('ring-4', 'ring-cyan-400', 'animate-pulse');
    });

    it('should apply animating styling when isAnimating is true', () => {
      const card: Card = { id: '1', type: CardType.GATE, value: 'X' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
          isAnimating={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('animate-bounce', 'scale-110');
    });

    it('should apply custom className when provided', () => {
      const card: Card = { id: '1', type: CardType.GATE, value: 'X' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
          className="custom-class"
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle ControlCard without controlLink', () => {
      const card: Card = { id: '1', type: CardType.CONTROL, value: 'C' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.queryByText(/→/)).not.toBeInTheDocument();
    });

    it('should handle undefined onClick gracefully', () => {
      const card: Card = { id: '1', type: CardType.GATE, value: 'X' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={undefined}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(() => fireEvent.click(cardElement!)).not.toThrow();
    });

    it('should handle keyboard navigation', () => {
      const card: Card = { id: '1', type: CardType.GATE, value: 'X' };
      
      render(
        <CardComponent
          card={card}
          position={0}
          onClick={mockOnClick}
          isClickable={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      
      fireEvent.keyDown(cardElement!, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(cardElement!, { key: ' ' });
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });
});