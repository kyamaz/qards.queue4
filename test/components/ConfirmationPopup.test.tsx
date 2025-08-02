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
      
      expect(screen.queryByTestId('confirmation-popup-overlay')).not.toBeInTheDocument();
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
      
      expect(screen.getByTestId('confirmation-popup-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('confirmation-popup')).toBeInTheDocument();
      expect(screen.getByTestId('confirmation-popup-title')).toHaveTextContent('Test Title');
      expect(screen.getByTestId('confirmation-popup-message')).toHaveTextContent('Test Message');
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
      
      expect(screen.getByTestId('confirmation-popup-confirm')).toHaveTextContent('確認');
      expect(screen.getByTestId('confirmation-popup-cancel')).toHaveTextContent('キャンセル');
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
      
      expect(screen.getByTestId('confirmation-popup-confirm')).toHaveTextContent('はい');
      expect(screen.getByTestId('confirmation-popup-cancel')).toHaveTextContent('いいえ');
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
      
      const confirmButton = screen.getByTestId('confirmation-popup-confirm');
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
      
      const confirmButton = screen.getByTestId('confirmation-popup-confirm');
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
      
      const confirmButton = screen.getByTestId('confirmation-popup-confirm');
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
      
      const cancelButton = screen.getByTestId('confirmation-popup-cancel');
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
      
      const backdrop = screen.getByTestId('confirmation-popup-overlay');
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
      
      const modal = screen.getByTestId('confirmation-popup');
      expect(modal).toHaveClass('bg-gray-800', 'rounded-lg', 'p-6');
    });
  });
});