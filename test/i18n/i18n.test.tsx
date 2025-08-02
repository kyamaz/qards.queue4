// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nProvider, useTranslation } from '../../src/i18n';

// Test component to verify i18n functionality
const TestComponent: React.FC = () => {
  const { t, locale, setLocale } = useTranslation();
  
  return (
    <div>
      <div data-testid="current-locale">{locale}</div>
      <div data-testid="translated-text">{t('common.gameTitle')}</div>
      <div data-testid="nested-translation">{t('settings.gameSettings')}</div>
      <div data-testid="parameterized-translation">{t('player.playerName', { letter: 'A' })}</div>
      <button 
        data-testid="switch-to-english" 
        onClick={() => setLocale('en')}
      >
        Switch to English
      </button>
      <button 
        data-testid="switch-to-japanese" 
        onClick={() => setLocale('ja')}
      >
        Switch to Japanese
      </button>
    </div>
  );
};

describe('i18n System', () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  describe('I18nProvider', () => {
    it('should provide default Japanese locale', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('current-locale')).toHaveTextContent('ja');
    });

    it('should load saved locale from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ language: 'en' }));
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('current-locale')).toHaveTextContent('en');
    });
  });

  describe('Translation Function', () => {
    it('should translate simple keys in Japanese', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('translated-text')).toHaveTextContent('量子ゲート並べ');
    });

    it('should translate nested keys', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('nested-translation')).toHaveTextContent('ゲーム設定');
    });

    it('should handle parameterized translations', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('parameterized-translation')).toHaveTextContent('プレイヤーA');
    });

    it('should switch to English translations', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      // Initially Japanese
      expect(screen.getByTestId('translated-text')).toHaveTextContent('量子ゲート並べ');
      
      // Switch to English
      act(() => {
        fireEvent.click(screen.getByTestId('switch-to-english'));
      });
      
      expect(screen.getByTestId('current-locale')).toHaveTextContent('en');
      expect(screen.getByTestId('translated-text')).toHaveTextContent('Quantum Gate Card Game');
      expect(screen.getByTestId('nested-translation')).toHaveTextContent('Game Settings');
      expect(screen.getByTestId('parameterized-translation')).toHaveTextContent('Player A');
    });

    it('should switch back to Japanese', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ language: 'en' }));
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      // Initially English
      expect(screen.getByTestId('translated-text')).toHaveTextContent('Quantum Gate Card Game');
      
      // Switch to Japanese
      act(() => {
        fireEvent.click(screen.getByTestId('switch-to-japanese'));
      });
      
      expect(screen.getByTestId('current-locale')).toHaveTextContent('ja');
      expect(screen.getByTestId('translated-text')).toHaveTextContent('量子ゲート並べ');
    });

    it('should save locale changes to localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      // Switch to English
      act(() => {
        fireEvent.click(screen.getByTestId('switch-to-english'));
      });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'en');
    });
  });

  describe('Error Handling', () => {
    it('should return key if translation is missing', () => {
      const TestMissingKey: React.FC = () => {
        const { t } = useTranslation();
        return <div data-testid="missing-key">{t('nonexistent.key')}</div>;
      };
      
      render(
        <I18nProvider>
          <TestMissingKey />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('missing-key')).toHaveTextContent('nonexistent.key');
    });

    it('should handle malformed localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      // Should fall back to default Japanese locale
      expect(screen.getByTestId('current-locale')).toHaveTextContent('ja');
      expect(screen.getByTestId('translated-text')).toHaveTextContent('量子ゲート並べ');
    });

    it('should throw error when useTranslation is used outside provider', () => {
      const TestOutsideProvider: React.FC = () => {
        useTranslation();
        return <div>Test</div>;
      };
      
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestOutsideProvider />);
      }).toThrow('useTranslation must be used within an I18nProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Translation Keys Coverage', () => {
    it('should have translations for common UI elements', () => {
      const TestCommonKeys: React.FC = () => {
        const { t } = useTranslation();
        return (
          <div>
            <div data-testid="start">{t('common.start')}</div>
            <div data-testid="cancel">{t('common.cancel')}</div>
            <div data-testid="confirm">{t('common.confirm')}</div>
            <div data-testid="settings">{t('common.settings')}</div>
          </div>
        );
      };
      
      render(
        <I18nProvider>
          <TestCommonKeys />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('start')).toHaveTextContent('ゲーム開始');
      expect(screen.getByTestId('cancel')).toHaveTextContent('キャンセル');
      expect(screen.getByTestId('confirm')).toHaveTextContent('確認');
      expect(screen.getByTestId('settings')).toHaveTextContent('設定');
    });

    it('should have translations for game-specific terms', () => {
      const TestGameKeys: React.FC = () => {
        const { t } = useTranslation();
        return (
          <div>
            <div data-testid="quantum-circuit">{t('board.quantumCircuit')}</div>
            <div data-testid="gate-card">{t('cards.gate')}</div>
            <div data-testid="measurement">{t('board.measurement')}</div>
          </div>
        );
      };
      
      render(
        <I18nProvider>
          <TestGameKeys />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('quantum-circuit')).toHaveTextContent('量子回路');
      expect(screen.getByTestId('gate-card')).toHaveTextContent('ゲートカード');
      expect(screen.getByTestId('measurement')).toHaveTextContent('測定');
    });

    it('should have consistent translations in both languages', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      // Test in Japanese
      expect(screen.getByTestId('translated-text')).toHaveTextContent('量子ゲート並べ');
      
      // Switch to English
      act(() => {
        fireEvent.click(screen.getByTestId('switch-to-english'));
      });
      
      // Verify English translation exists and is different
      const englishText = screen.getByTestId('translated-text').textContent;
      expect(englishText).toBe('Quantum Gate Card Game');
      expect(englishText).not.toBe('量子ゲート並べ');
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0;
      
      const TestRenderCount: React.FC = () => {
        renderCount++;
        const { t } = useTranslation();
        return <div>{t('common.gameTitle')}</div>;
      };
      
      const { rerender } = render(
        <I18nProvider>
          <TestRenderCount />
        </I18nProvider>
      );
      
      const initialRenderCount = renderCount;
      
      // Force a re-render
      rerender(
        <I18nProvider>
          <TestRenderCount />
        </I18nProvider>
      );
      
      // Should not have caused excessive re-renders
      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(1);
    });
  });
});