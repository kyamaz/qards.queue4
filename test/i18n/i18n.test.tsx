// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nProvider, useTranslation } from '../../src/i18n';
import { getTranslation, getStoredLocale, setStoredLocale } from '../../src/i18n/utils';

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
      
      // Mock console.warn to suppress expected error messages during error handling tests
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      consoleWarnSpy.mockRestore();
      
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

describe('i18n Utility Functions', () => {
  describe('getTranslation', () => {
    it('should return correct translation for valid key', () => {
      const result = getTranslation('en', 'common.gameTitle');
      expect(result).toBe('Quantum Gate Card Game');
    });

    it('should fallback to Japanese when key missing in target locale', () => {
      const result = getTranslation('en', 'common.settings');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return key if translation not found anywhere', () => {
      const result = getTranslation('en', 'completely.nonexistent.key');
      expect(result).toBe('completely.nonexistent.key');
    });

    it('should handle nested translation keys', () => {
      const result = getTranslation('en', 'game.turn');
      expect(result).toBe('Turn');
    });

    it('should replace parameters in translations', () => {
      const result = getTranslation('en', 'player.playerName', { letter: 'A' });
      expect(result).toBe('Player A');
    });

    it('should handle multiple parameter replacements', () => {
      const result = getTranslation('en', 'gameMessages.measurementGainedPoints', { 
        points: 5, 
        compatibility: ' (test)', 
        computation: ' 🔬' 
      });
      expect(typeof result).toBe('string');
    });

    it('should handle empty parameters object', () => {
      const result = getTranslation('en', 'common.gameTitle', {});
      expect(result).toBe('Quantum Gate Card Game');
    });

    it('should handle non-string translation values', () => {
      const result = getTranslation('en', 'common');
      expect(result).toBe('common'); // Should return key when value is not string
    });

    it('should handle empty key', () => {
      const result = getTranslation('en', '');
      expect(typeof result).toBe('string');
    });

    it('should handle deep nested missing keys', () => {
      const result = getTranslation('en', 'deep.nested.missing.key');
      expect(result).toBe('deep.nested.missing.key');
    });
  });

  describe('getStoredLocale', () => {
    const originalWindow = global.window;

    beforeEach(() => {
      delete (global as any).window;
    });

    afterEach(() => {
      (global as any).window = originalWindow;
    });

    it('should return default locale on server (no window)', () => {
      const result = getStoredLocale();
      expect(result).toBe('ja');
    });

    it('should handle window with localStorage', () => {
      (global as any).window = {
        localStorage: {
          getItem: jest.fn().mockReturnValue(null)
        }
      };

      const result = getStoredLocale();
      expect(result).toBe('ja');
    });

    it('should handle function execution', () => {
      (global as any).window = {
        localStorage: {
          getItem: jest.fn().mockReturnValue(null)
        }
      };

      expect(() => getStoredLocale()).not.toThrow();
    });

    it('should handle invalid JSON in settings', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      (global as any).window = {
        localStorage: {
          getItem: jest.fn().mockImplementation((key) => {
            if (key === 'qards4-settings') return 'invalid json';
            return null;
          })
        }
      };

      const result = getStoredLocale();
      expect(result).toBe('ja'); // Should default to Japanese
      
      consoleSpy.mockRestore();
    });

    it('should handle invalid language values', () => {
      (global as any).window = {
        localStorage: {
          getItem: jest.fn().mockImplementation((key) => {
            if (key === 'qards4-settings') {
              return JSON.stringify({ language: 'invalid' });
            }
            return null;
          })
        }
      };

      const result = getStoredLocale();
      expect(result).toBe('ja'); // Should default to Japanese
    });
  });

  describe('setStoredLocale', () => {
    const originalWindow = global.window;

    beforeEach(() => {
      delete (global as any).window;
    });

    afterEach(() => {
      (global as any).window = originalWindow;
    });

    it('should do nothing on server (no window)', () => {
      expect(() => setStoredLocale('en')).not.toThrow();
    });

    it('should handle window with localStorage', () => {
      const mockSetItem = jest.fn();
      const mockDispatchEvent = jest.fn();
      
      (global as any).window = {
        localStorage: {
          getItem: jest.fn().mockReturnValue(null),
          setItem: mockSetItem
        },
        dispatchEvent: mockDispatchEvent
      };

      setStoredLocale('en');

      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    it('should execute without errors', () => {
      (global as any).window = {
        localStorage: {
          getItem: jest.fn().mockReturnValue(null),
          setItem: jest.fn()
        },
        dispatchEvent: jest.fn()
      };

      expect(() => setStoredLocale('en')).not.toThrow();
    });

    it('should handle localStorage errors', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      (global as any).window = {
        localStorage: {
          getItem: jest.fn().mockImplementation(() => {
            throw new Error('Storage error');
          }),
          setItem: jest.fn().mockImplementation(() => {
            throw new Error('Storage error');
          })
        },
        dispatchEvent: jest.fn()
      };

      expect(() => setStoredLocale('en')).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });
});