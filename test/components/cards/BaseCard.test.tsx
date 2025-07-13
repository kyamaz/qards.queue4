import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseCard from '../../../src/components/cards/BaseCard';

describe('BaseCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render card value', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('X')).toBeInTheDocument();
    });

    it('should apply background color', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('bg-blue-600');
    });

    it('should render children content', () => {
      render(
        <BaseCard
          value="C"
          backgroundColor="bg-yellow-600"
          onClick={mockOnClick}
        >
          <div>→2</div>
        </BaseCard>
      );

      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('→2')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClick when clicked and clickable', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isClickable={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      fireEvent.click(cardElement!);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when not clickable', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isClickable={false}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      fireEvent.click(cardElement!);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard navigation when clickable', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isClickable={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      
      fireEvent.keyDown(cardElement!, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(cardElement!, { key: ' ' });
      expect(mockOnClick).toHaveBeenCalledTimes(2);

      fireEvent.keyDown(cardElement!, { key: 'Escape' });
      expect(mockOnClick).toHaveBeenCalledTimes(2); // Should not trigger
    });

    it('should not handle keyboard navigation when not clickable', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isClickable={false}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      
      fireEvent.keyDown(cardElement!, { key: 'Enter' });
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Visual States', () => {
    it('should apply selected styling', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isSelected={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('ring-4', 'ring-cyan-400', 'scale-105');
    });

    it('should apply highlighted styling', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isHighlighted={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('ring-4', 'ring-cyan-400', 'animate-pulse');
    });

    it('should apply animating styling', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isAnimating={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('animate-bounce', 'scale-110');
    });

    it('should apply custom className', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          className="custom-class"
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('custom-class');
    });

    it('should show hover effect when clickable', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isClickable={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('cursor-pointer', 'hover:scale-105');
    });

    it('should not show hover effect when not clickable', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isClickable={false}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('cursor-default');
      expect(cardElement).not.toHaveClass('hover:scale-105');
    });
  });

  describe('Accessibility', () => {
    it('should have correct tabIndex when clickable', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isClickable={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveAttribute('tabIndex', '0');
    });

    it('should have correct tabIndex when not clickable', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isClickable={false}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveAttribute('tabIndex', '-1');
    });

    it('should have button role', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveAttribute('role', 'button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onClick gracefully', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={undefined}
          isClickable={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(() => fireEvent.click(cardElement!)).not.toThrow();
    });

    it('should handle multiple visual states simultaneously', () => {
      render(
        <BaseCard
          value="X"
          backgroundColor="bg-blue-600"
          onClick={mockOnClick}
          isSelected={true}
          isHighlighted={true}
          isAnimating={true}
        />
      );

      const cardElement = screen.getByText('X').parentElement?.parentElement;
      expect(cardElement).toHaveClass('ring-4', 'ring-cyan-400', 'scale-105');
      expect(cardElement).toHaveClass('animate-pulse');
      expect(cardElement).toHaveClass('animate-bounce', 'scale-110');
    });
  });
});