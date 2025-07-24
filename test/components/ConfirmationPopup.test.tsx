// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmationPopup from '../../src/components/ConfirmationPopup';

describe('ConfirmationPopup Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ConfirmationPopup
          isOpen={false}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('should render default button texts', () => {
      render(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('確認')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
    });

    it('should render custom button texts', () => {
      render(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          confirmText="はい"
          cancelText="いいえ"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('はい')).toBeInTheDocument();
      expect(screen.getByText('いいえ')).toBeInTheDocument();
    });

    it('should apply red color to confirm button by default', () => {
      render(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('確認');
      expect(confirmButton).toHaveClass('bg-red-600');
    });

    it('should apply custom color to confirm button', () => {
      render(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          confirmButtonColor="blue"
        />
      );
      
      const confirmButton = screen.getByText('確認');
      expect(confirmButton).toHaveClass('bg-blue-600');
    });
  });

  describe('User Interactions', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      render(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('確認');
      fireEvent.click(confirmButton);
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const cancelButton = screen.getByText('キャンセル');
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have proper backdrop styling', () => {
      render(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const backdrop = screen.getByText('Test Title').closest('.fixed');
      expect(backdrop).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50');
    });

    it('should have proper modal styling', () => {
      render(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const modal = screen.getByText('Test Title').closest('.bg-gray-800');
      expect(modal).toHaveClass('bg-gray-800', 'rounded-lg', 'p-6');
    });
  });
});