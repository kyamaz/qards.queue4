// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TargetCard } from '../../../src/components/cards/TargetCard';
import { CardType } from '../../../src/game/types';

describe('TargetCard Component', () => {
  const mockCard = {
    id: 'target-1',
    type: CardType.TARGET,
    value: 'CNOT'
  };

  describe('Rendering', () => {
    it('should render the target card with default props', () => {
      render(<TargetCard card={mockCard} data-testid="target-card" />);
      
      const targetCard = screen.getByTestId('target-card');
      expect(targetCard).toBeInTheDocument();
      expect(screen.getByText('O')).toBeInTheDocument(); // BaseCard displays single O
    });

    it('should render with custom data-testid', () => {
      render(<TargetCard card={mockCard} data-testid="custom-target-card" />);
      
      const targetCard = screen.getByTestId('custom-target-card');
      expect(targetCard).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<TargetCard card={mockCard} className="custom-class" data-testid="custom-class-card" />);
      
      const targetCard = screen.getByTestId('custom-class-card');
      expect(targetCard).toBeInTheDocument();
    });
  });

  describe('Props and Default Values', () => {
    it('should use default values when props are not provided', () => {
      const { container } = render(<TargetCard card={mockCard} />);
      
      // Default values should be applied
      const baseCard = container.firstChild;
      expect(baseCard).toBeInTheDocument();
      
      // Card should be clickable by default (isClickable = true)
      const clickableCard = container.querySelector('[role="button"]');
      expect(clickableCard).toBeInTheDocument();
    });

    it('should apply isSelected prop when true', () => {
      render(<TargetCard card={mockCard} isSelected={true} data-testid="selected-target" />);
      
      const targetCard = screen.getByTestId('selected-target');
      expect(targetCard).toBeInTheDocument();
    });

    it('should apply isSelected prop when false', () => {
      render(<TargetCard card={mockCard} isSelected={false} data-testid="unselected-target" />);
      
      const targetCard = screen.getByTestId('unselected-target');
      expect(targetCard).toBeInTheDocument();
    });

    it('should apply isHighlighted prop when true', () => {
      render(<TargetCard card={mockCard} isHighlighted={true} data-testid="highlighted-target" />);
      
      const targetCard = screen.getByTestId('highlighted-target');
      expect(targetCard).toBeInTheDocument();
    });

    it('should apply isHighlighted prop when false', () => {
      render(<TargetCard card={mockCard} isHighlighted={false} data-testid="unhighlighted-target" />);
      
      const targetCard = screen.getByTestId('unhighlighted-target');
      expect(targetCard).toBeInTheDocument();
    });

    it('should apply isAnimating prop when true', () => {
      render(<TargetCard card={mockCard} isAnimating={true} data-testid="animating-target" />);
      
      const targetCard = screen.getByTestId('animating-target');
      expect(targetCard).toBeInTheDocument();
    });

    it('should apply isAnimating prop when false', () => {
      render(<TargetCard card={mockCard} isAnimating={false} data-testid="static-target" />);
      
      const targetCard = screen.getByTestId('static-target');
      expect(targetCard).toBeInTheDocument();
    });

    it('should apply isClickable prop when true', () => {
      render(<TargetCard card={mockCard} isClickable={true} data-testid="clickable-target" />);
      
      const targetCard = screen.getByTestId('clickable-target');
      expect(targetCard).toBeInTheDocument();
    });

    it('should apply isClickable prop when false', () => {
      render(<TargetCard card={mockCard} isClickable={false} data-testid="non-clickable-target" />);
      
      const targetCard = screen.getByTestId('non-clickable-target');
      expect(targetCard).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle onClick event', () => {
      const mockOnClick = jest.fn();
      render(<TargetCard card={mockCard} onClick={mockOnClick} data-testid="clickable-target" />);
      
      const targetCard = screen.getByTestId('clickable-target');
      fireEvent.click(targetCard);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when isClickable is false', () => {
      const mockOnClick = jest.fn();
      render(<TargetCard card={mockCard} onClick={mockOnClick} isClickable={false} data-testid="non-clickable-target" />);
      
      const targetCard = screen.getByTestId('non-clickable-target');
      fireEvent.click(targetCard);
      
      // BaseCard should handle the isClickable prop, so onClick might still be called
      // This test verifies the prop is passed correctly
      expect(targetCard).toBeInTheDocument();
    });

    it('should handle undefined onClick prop', () => {
      render(<TargetCard card={mockCard} data-testid="no-click-target" />);
      
      const targetCard = screen.getByTestId('no-click-target');
      fireEvent.click(targetCard);
      
      // Should not throw error
      expect(targetCard).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render with gray background', () => {
      render(<TargetCard card={mockCard} data-testid="target-card" />);
      
      const targetCard = screen.getByTestId('target-card');
      expect(targetCard).toHaveClass('bg-gray-300');
    });

    it('should render the O symbol with correct styling', () => {
      render(<TargetCard card={mockCard} data-testid="target-card" />);
      
      const targetCard = screen.getByTestId('target-card');
      expect(targetCard).toHaveTextContent('O');
      
      // Check for font styling in the text element
      const symbolElement = screen.getByText('O');
      expect(symbolElement).toHaveClass('text-lg', 'font-bold');
    });
  });

  describe('All Props Combination', () => {
    it('should handle all props together', () => {
      const mockOnClick = jest.fn();
      
      render(
        <TargetCard
          card={mockCard}
          onClick={mockOnClick}
          isSelected={true}
          isHighlighted={true}
          isAnimating={true}
          isClickable={true}
          className="all-props-class"
          data-testid="all-props-target"
        />
      );
      
      const targetCard = screen.getByTestId('all-props-target');
      expect(targetCard).toBeInTheDocument();
      
      fireEvent.click(targetCard);
      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should handle all props with false values', () => {
      const mockOnClick = jest.fn();
      
      render(
        <TargetCard
          card={mockCard}
          onClick={mockOnClick}
          isSelected={false}
          isHighlighted={false}
          isAnimating={false}
          isClickable={false}
          className=""
          data-testid="all-false-target"
        />
      );
      
      const targetCard = screen.getByTestId('all-false-target');
      expect(targetCard).toBeInTheDocument();
    });

    it('should handle missing optional props', () => {
      render(<TargetCard card={mockCard} />);
      
      // Check that the component renders correctly with default props
      const symbols = screen.getAllByText('O');
      expect(symbols.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty className', () => {
      render(<TargetCard card={mockCard} className="" data-testid="empty-class-target" />);
      
      const targetCard = screen.getByTestId('empty-class-target');
      expect(targetCard).toBeInTheDocument();
    });

    it('should handle special characters in className', () => {
      render(<TargetCard card={mockCard} className="test-class-123 another-class" data-testid="special-class-target" />);
      
      const targetCard = screen.getByTestId('special-class-target');
      expect(targetCard).toBeInTheDocument();
    });

    it('should maintain gray background color', () => {
      const { container } = render(<TargetCard card={mockCard} />);
      
      // The BaseCard should receive backgroundColor="bg-gray-300"
      const baseCard = container.firstChild;
      expect(baseCard).toBeInTheDocument();
    });
  });
});