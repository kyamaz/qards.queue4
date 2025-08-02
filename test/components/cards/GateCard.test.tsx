// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GateCard from '../../../src/components/cards/GateCard';

describe('GateCard Component', () => {
  const mockOnClick = jest.fn();
  const defaultProps = {
    value: 'X',
    onClick: mockOnClick,
    'data-testid': 'card-gate-1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render gate card with value', () => {
      render(<GateCard {...defaultProps} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      expect(gateCard).toBeInTheDocument();
      expect(gateCard).toHaveTextContent('X');
    });

    it('should have blue background color', () => {
      render(<GateCard {...defaultProps} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      expect(gateCard).toHaveClass('bg-blue-600');
    });

    it('should render different gate values', () => {
      const { rerender } = render(<GateCard {...defaultProps} value="H" />);
      expect(screen.getByTestId('card-gate-1')).toHaveTextContent('H');
      
      rerender(<GateCard {...defaultProps} value="Z" />);
      expect(screen.getByTestId('card-gate-1')).toHaveTextContent('Z');
      
      rerender(<GateCard {...defaultProps} value="I" />);
      expect(screen.getByTestId('card-gate-1')).toHaveTextContent('I');
    });

    it('should render with different data-testid', () => {
      render(<GateCard {...defaultProps} data-testid="card-gate-different" />);
      
      const gateCard = screen.getByTestId('card-gate-different');
      expect(gateCard).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClick when clicked', () => {
      render(<GateCard {...defaultProps} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      fireEvent.click(gateCard);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard interaction', () => {
      render(<GateCard {...defaultProps} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      fireEvent.keyDown(gateCard, { key: 'Enter' });
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      render(<GateCard {...defaultProps} isClickable={false} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      fireEvent.click(gateCard);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Selection State', () => {
    it('should show selection styling when selected', () => {
      render(<GateCard {...defaultProps} isSelected={true} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      expect(gateCard).toHaveClass('ring-4', 'ring-cyan-400');
    });

    it('should not show selection styling when not selected', () => {
      render(<GateCard {...defaultProps} isSelected={false} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      expect(gateCard).not.toHaveClass('ring-4', 'ring-cyan-400');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<GateCard {...defaultProps} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      expect(gateCard).toHaveAttribute('role', 'button');
      expect(gateCard).toHaveAttribute('tabIndex', '0');
    });

    it('should be focusable', () => {
      render(<GateCard {...defaultProps} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      gateCard.focus();
      
      expect(document.activeElement).toBe(gateCard);
    });

    it('should not be focusable when not clickable', () => {
      render(<GateCard {...defaultProps} isClickable={false} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      expect(gateCard).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Visual States', () => {
    it('should show hover effects when clickable', () => {
      render(<GateCard {...defaultProps} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      expect(gateCard).toHaveClass('hover:scale-105');
    });

    it('should show highlighted state when highlighted', () => {
      render(<GateCard {...defaultProps} isHighlighted={true} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      expect(gateCard).toHaveClass('ring-4', 'ring-cyan-400');
    });
  });

  describe('Card Type Identification', () => {
    it('should have gate card data-testid pattern', () => {
      render(<GateCard {...defaultProps} data-testid="card-test-gate" />);
      
      const gateCard = screen.getByTestId('card-test-gate');
      expect(gateCard).toBeInTheDocument();
    });

    it('should maintain blue color for all gate types', () => {
      const gateTypes = ['I', 'X', 'Y', 'Z', 'H'];
      
      gateTypes.forEach(gateType => {
        const { container } = render(<GateCard {...defaultProps} value={gateType} />);
        const gateCard = container.querySelector('[data-testid="card-gate-1"]');
        expect(gateCard).toHaveClass('bg-blue-600');
        container.remove();
      });
    });
  });

  describe('Layout and Styling', () => {
    it('should have consistent card dimensions', () => {
      render(<GateCard {...defaultProps} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      expect(gateCard).toHaveClass('w-24', 'h-32');
    });

    it('should have proper text styling', () => {
      render(<GateCard {...defaultProps} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      expect(gateCard).toHaveClass('font-semibold', 'text-white');
    });

    it('should have rounded corners', () => {
      render(<GateCard {...defaultProps} />);
      
      const gateCard = screen.getByTestId('card-gate-1');
      expect(gateCard).toHaveClass('rounded-lg');
    });
  });
});