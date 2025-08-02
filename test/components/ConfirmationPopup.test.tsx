// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmationPopup from '../../src/components/ConfirmationPopup';
import { I18nProvider } from '../../src/i18n';

describe('ConfirmationPopup Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  // Test wrapper that provides I18nProvider context
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <I18nProvider>{children}</I18nProvider>
  );

  const renderWithI18n = (ui: React.ReactElement) => {
    return render(ui, { wrapper: TestWrapper });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      renderWithI18n(
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
      renderWithI18n(
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
      renderWithI18n(
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
      renderWithI18n(
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
      renderWithI18n(
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
      renderWithI18n(
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
      renderWithI18n(
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
      renderWithI18n(
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

  describe('Button Color Variants', () => {
    it('should apply green color to confirm button', () => {
      renderWithI18n(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          confirmButtonColor="green"
        />
      );
      
      const confirmButton = screen.getByTestId('confirmation-popup-confirm');
      expect(confirmButton).toHaveClass('bg-green-600', 'hover:bg-green-700');
    });

    it('should apply blue color to confirm button', () => {
      renderWithI18n(
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
      expect(confirmButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    });

    it('should apply red color to confirm button', () => {
      renderWithI18n(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          confirmButtonColor="red"
        />
      );
      
      const confirmButton = screen.getByTestId('confirmation-popup-confirm');
      expect(confirmButton).toHaveClass('bg-red-600', 'hover:bg-red-700');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string titles and messages', () => {
      renderWithI18n(
        <ConfirmationPopup
          isOpen={true}
          title=""
          message=""
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByTestId('confirmation-popup-title')).toHaveTextContent('');
      expect(screen.getByTestId('confirmation-popup-message')).toHaveTextContent('');
    });

    it('should handle very long titles and messages', () => {
      const longTitle = 'This is a very long title that might overflow the container and test the layout behavior';
      const longMessage = 'This is a very long message that spans multiple lines and tests how the component handles extensive text content with proper wrapping and spacing.';
      
      renderWithI18n(
        <ConfirmationPopup
          isOpen={true}
          title={longTitle}
          message={longMessage}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByTestId('confirmation-popup-title')).toHaveTextContent(longTitle);
      expect(screen.getByTestId('confirmation-popup-message')).toHaveTextContent(longMessage);
    });

    it('should handle special characters in titles and messages', () => {
      const specialTitle = 'タイトル with émojis 🎯 & symbols @#$%';
      const specialMessage = 'メッセージ with special chars: <>&"\' and newlines Test line 2';
      
      renderWithI18n(
        <ConfirmationPopup
          isOpen={true}
          title={specialTitle}
          message={specialMessage}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByTestId('confirmation-popup-title')).toHaveTextContent(specialTitle);
      expect(screen.getByTestId('confirmation-popup-message')).toHaveTextContent(specialMessage);
    });

    it('should use default texts when custom button texts are empty', () => {
      renderWithI18n(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          confirmText=""
          cancelText=""
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      // When empty strings are provided, the component should use translation defaults
      expect(screen.getByTestId('confirmation-popup-confirm')).toHaveTextContent('確認');
      expect(screen.getByTestId('confirmation-popup-cancel')).toHaveTextContent('キャンセル');
    });
  });

  describe('Styling', () => {
    it('should have proper backdrop styling', () => {
      renderWithI18n(
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
      renderWithI18n(
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

    it('should have proper button styling', () => {
      renderWithI18n(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const cancelButton = screen.getByTestId('confirmation-popup-cancel');
      expect(cancelButton).toHaveClass('px-4', 'py-2', 'bg-gray-600', 'hover:bg-gray-700');
      
      const confirmButton = screen.getByTestId('confirmation-popup-confirm');
      expect(confirmButton).toHaveClass('px-4', 'py-2', 'text-white', 'rounded-lg', 'transition', 'duration-300');
    });
  });

  describe('Multiple Interactions', () => {
    it('should handle rapid clicks correctly', () => {
      renderWithI18n(
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
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
    });

    it('should handle alternating button clicks', () => {
      renderWithI18n(
        <ConfirmationPopup
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByTestId('confirmation-popup-confirm');
      const cancelButton = screen.getByTestId('confirmation-popup-cancel');
      
      fireEvent.click(confirmButton);
      fireEvent.click(cancelButton);
      fireEvent.click(confirmButton);
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(2);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});