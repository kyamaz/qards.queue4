// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { getTranslation, getStoredLocale, setStoredLocale } from '../../src/i18n/utils';

// Mock localStorage at the module level
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};

const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
};

// Set up global mocks before importing
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('I18n Utils Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTranslation function', () => {
    it('should return key when value is not string - line 35-36', () => {
      // This tests when the final value is not a string
      const result = getTranslation('ja', 'nonexistent.deeply.nested.key');
      expect(result).toBe('nonexistent.deeply.nested.key');
    });

    it('should handle fallback when key not found in Japanese - lines 27-28', () => {
      // Test when a key is not found even in Japanese fallback
      const result = getTranslation('en', 'completely.nonexistent.key.that.does.not.exist');
      expect(result).toBe('completely.nonexistent.key.that.does.not.exist');
    });

    it('should replace parameters in translation - lines 40-45', () => {
      // Test parameter replacement
      const result = getTranslation('ja', 'player.winner', { name: 'テストプレイヤー' });
      expect(typeof result).toBe('string');
      expect(result).toContain('テストプレイヤー');
    });

    it('should handle translation without parameters - lines 47-48', () => {
      const result = getTranslation('ja', 'actions.startGame');
      expect(typeof result).toBe('string');
    });
  });

  describe('getStoredLocale function', () => {
    it('should return ja when window is undefined - lines 52-54', () => {
      const originalWindow = global.window;
      global.window = undefined as any;
      
      const result = getStoredLocale();
      expect(result).toBe('ja');
      
      global.window = originalWindow;
    });

    it('should handle localStorage errors - lines 71-73', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = getStoredLocale();
      expect(result).toBe('ja');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to read language from localStorage:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should use settings data when available - lines 58-64', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'qards4-settings') {
          return JSON.stringify({ language: 'en' });
        }
        return null;
      });
      
      const result = getStoredLocale();
      expect(result).toBe('en');
    });

    it('should fallback to legacy language key - lines 67-70', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'qards4-settings') {
          return null;
        }
        if (key === 'language') {
          return 'en';
        }
        return null;
      });
      
      const result = getStoredLocale();
      expect(result).toBe('en');
    });

    it('should handle invalid settings data', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'qards4-settings') {
          return 'invalid json';
        }
        return null;
      });
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      expect(() => getStoredLocale()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to read language from localStorage:', expect.any(SyntaxError));
      
      consoleSpy.mockRestore();
    });

    it('should handle invalid language in settings', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'qards4-settings') {
          return JSON.stringify({ language: 'invalid' });
        }
        if (key === 'language') {
          return 'ja';
        }
        return null;
      });
      
      const result = getStoredLocale();
      expect(result).toBe('ja');
    });
  });

  describe('setStoredLocale function', () => {
    it('should return early when window is undefined - lines 79-81', () => {
      const originalWindow = global.window;
      global.window = undefined as any;
      
      setStoredLocale('en');
      // Should not throw error
      
      global.window = originalWindow;
    });

    it('should handle localStorage errors - lines 96-98', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ language: 'ja' }));
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Reset mock to track calls properly
      mockWindow.dispatchEvent.mockClear();
      
      setStoredLocale('en');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save language to localStorage:', expect.any(Error));
      // When error occurs, dispatchEvent is not called
      expect(mockWindow.dispatchEvent).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should update existing settings and dispatch event - lines 85-95', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ 
        language: 'ja',
        otherSetting: 'value'
      }));
      
      // Reset mock to clear previous calls and remove error throwing behavior
      mockLocalStorage.setItem.mockClear();
      mockLocalStorage.setItem.mockImplementation(() => {}); // Reset to non-throwing implementation
      mockWindow.dispatchEvent.mockClear();
      
      setStoredLocale('en');
      
      // Check that both setItem calls were made
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'qards4-settings', 
        JSON.stringify({ language: 'en', otherSetting: 'value' })
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'en');
      expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'languageChanged',
          detail: { locale: 'en' }
        })
      );
    });

    it('should handle case when settings do not exist - line 93', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      // Reset mock to clear previous calls and ensure non-throwing behavior
      mockLocalStorage.setItem.mockClear();
      mockLocalStorage.setItem.mockImplementation(() => {}); // Reset to non-throwing implementation
      mockWindow.dispatchEvent.mockClear();
      
      setStoredLocale('en');
      
      // Should only call setItem once for the legacy language key (no settings exist)
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'en');
      // Should dispatch event if no error occurred
      expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'languageChanged',
          detail: { locale: 'en' }
        })
      );
    });

    it('should handle invalid JSON in existing settings', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      // Mock console.warn to suppress expected error messages during error handling tests
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      expect(() => setStoredLocale('en')).not.toThrow();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle nested translation keys', () => {
      const result = getTranslation('ja', 'actions.startGame');
      expect(typeof result).toBe('string');
    });

    it('should handle parameters with special characters', () => {
      const result = getTranslation('ja', 'player.winner', { name: 'プレイヤー@#$' });
      expect(typeof result).toBe('string');
    });

    it('should handle multiple parameter replacements', () => {
      const result = getTranslation('ja', 'player.finalScore', { score: 100 });
      expect(typeof result).toBe('string');
    });
  });
});