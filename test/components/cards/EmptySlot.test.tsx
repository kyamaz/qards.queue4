// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmptySlot from '../../../src/components/cards/EmptySlot';

describe('EmptySlot Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render empty slot with position', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      expect(emptySlot).toBeInTheDocument();
      expect(emptySlot).toHaveTextContent('0');
    });

    it('should render empty slot with lane and position', () => {
      render(<EmptySlot position={2} laneIndex={1} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-lane1-pos2');
      expect(emptySlot).toBeInTheDocument();
      expect(emptySlot).toHaveTextContent('2-2');
    });

    it('should have proper default styling', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      expect(emptySlot).toHaveClass('w-24', 'h-32', 'bg-gray-700', 'border-dashed');
    });

    it('should be clickable by default', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      expect(emptySlot).toHaveClass('cursor-pointer');
      expect(emptySlot).toHaveAttribute('tabIndex', '0');
    });

    it('should not be clickable when isClickable is false', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} isClickable={false} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      expect(emptySlot).toHaveClass('cursor-default');
      expect(emptySlot).toHaveAttribute('tabIndex', '-1');
    });

    it('should show highlight styling when highlighted', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} isHighlighted={true} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      expect(emptySlot).toHaveClass('ring-4', 'ring-cyan-400', 'animate-pulse');
    });

    it('should not show highlight styling by default', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      expect(emptySlot).not.toHaveClass('ring-4', 'ring-cyan-400', 'animate-pulse');
    });
  });

  describe('Interaction', () => {
    it('should call onClick when clicked', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      fireEvent.click(emptySlot);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when not clickable', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} isClickable={false} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      fireEvent.click(emptySlot);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when onClick is not provided', () => {
      render(<EmptySlot position={0} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      
      // Should not throw error when clicking
      expect(() => fireEvent.click(emptySlot)).not.toThrow();
    });

    it('should handle keyboard interaction with Enter key', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      fireEvent.keyDown(emptySlot, { key: 'Enter' });
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard interaction with Space key', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      fireEvent.keyDown(emptySlot, { key: ' ' });
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not handle keyboard interaction when not clickable', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} isClickable={false} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      fireEvent.keyDown(emptySlot, { key: 'Enter' });
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should not handle other keyboard keys', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      fireEvent.keyDown(emptySlot, { key: 'a' });
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role attribute', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      expect(emptySlot).toHaveAttribute('role', 'button');
    });

    it('should be focusable when clickable', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      emptySlot.focus();
      
      expect(document.activeElement).toBe(emptySlot);
    });

    it('should not be focusable when not clickable', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} isClickable={false} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      expect(emptySlot).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Position Display', () => {
    it('should display lane-position format when laneIndex is provided', () => {
      render(<EmptySlot position={3} laneIndex={2} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-lane2-pos3');
      expect(emptySlot).toHaveTextContent('3-3');
    });

    it('should display just position when laneIndex is not provided', () => {
      render(<EmptySlot position={5} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-5');
      expect(emptySlot).toHaveTextContent('5');
    });

    it('should handle zero position correctly', () => {
      render(<EmptySlot position={0} laneIndex={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-lane0-pos0');
      expect(emptySlot).toHaveTextContent('1-0');
    });
  });

  describe('Styling Variations', () => {
    it('should apply highlighted styling correctly', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} isHighlighted={true} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      expect(emptySlot).toHaveClass('ring-4', 'ring-cyan-400', 'shadow-lg');
    });

    it('should apply hover effects when clickable', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      expect(emptySlot).toHaveClass('hover:bg-gray-600');
    });

    it('should not apply hover effects when not clickable', () => {
      render(<EmptySlot position={0} onClick={mockOnClick} isClickable={false} />);
      
      const emptySlot = screen.getByTestId('empty-slot-0');
      expect(emptySlot).not.toHaveClass('cursor-pointer');
    });
  });
});