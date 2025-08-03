// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { TranslationData, Locale } from './types';
import jaTranslations from './translations/ja.json';
import enTranslations from './translations/en.json';

const translations: Record<Locale, TranslationData> = {
  ja: jaTranslations,
  en: enTranslations,
};

export function getTranslation(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: unknown = translations[locale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback to Japanese if key not found
      let fallbackValue: unknown = translations.ja;
      for (const fallbackKey of keys) {
        if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
          fallbackValue = (fallbackValue as Record<string, unknown>)[fallbackKey];
        } else {
          return key; // Return key as-is if not found in fallback
        }
      }
      value = fallbackValue;
      break;
    }
  }

  if (typeof value !== 'string') {
    return key; // Return key as-is if final value is not a string
  }

  // Replace parameters in the string
  if (params) {
    let result = value;
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    }
    return result;
  }

  return value;
}

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'ja'; // Default to Japanese on server
  }

  try {
    // First try to read from the settings object
    const settingsData = localStorage.getItem('qards-queue4-settings');
    if (settingsData) {
      const parsedSettings = JSON.parse(settingsData);
      if (parsedSettings.language === 'ja' || parsedSettings.language === 'en') {
        return parsedSettings.language;
      }
    }
    
    // Fallback to legacy language key
    const stored = localStorage.getItem('language');
    if (stored === 'ja' || stored === 'en') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read language from localStorage:', error);
  }

  return 'ja'; // Default to Japanese
}

export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Update the settings object if it exists
    const settingsData = localStorage.getItem('qards-queue4-settings');
    if (settingsData) {
      const parsedSettings = JSON.parse(settingsData);
      parsedSettings.language = locale;
      localStorage.setItem('qards-queue4-settings', JSON.stringify(parsedSettings));
    }
    
    // Also maintain legacy language key for compatibility
    localStorage.setItem('language', locale);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { locale } }));
  } catch (error) {
    console.warn('Failed to save language to localStorage:', error);
  }
}
