// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n';

interface SettingsData {
  soundVolume: number;
  musicVolume: number;
  difficulty: 'easy' | 'normal' | 'hard';
  showHints: boolean;
  language: 'ja' | 'en';
  playerCount: 3 | 4 | 5 | 6;
  comPlayerCount: number;
  controlledHadamard: boolean;
  allowUnfinalizedMeasurement: boolean;
}

interface SettingsScreenProps {
  onBack: () => void;
  onStartGame?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onStartGame }) => {
  const { t, locale, setLocale } = useTranslation();
  const defaultSettings = React.useMemo(() => ({
    soundVolume: 50,
    musicVolume: 30,
    difficulty: 'normal' as const,
    showHints: true,
    language: 'ja' as const,
    playerCount: 4 as const,
    comPlayerCount: 0,
    controlledHadamard: false,
    allowUnfinalizedMeasurement: false,
  }), []);

  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('qards-queue4-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }, [defaultSettings]);

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // When player count changes, set COM player count to playerCount - 1
      if (key === 'playerCount') {
        newSettings.comPlayerCount = (value as number) - 1;
      }
      
      // When language changes, sync with i18n system
      if (key === 'language') {
        setLocale(value as 'ja' | 'en');
      }
      
      return newSettings;
    });
  };

  const handleSave = () => {
    try {
      localStorage.setItem('qards-queue4-settings', JSON.stringify(settings));
      console.log('Settings saved successfully:', settings);
      
      // Dispatch custom event to notify other components of settings change
      window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
      
      // Just show a success message, don't navigate back
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white p-6" data-testid="settings-screen">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-8 text-center" data-testid="settings-title">{t('settings.title')}</h1>
        

        <div className="bg-gray-900 rounded-lg p-6 mb-6" data-testid="game-settings-section">
          <h2 className="text-2xl font-semibold mb-4" data-testid="game-settings-title">{t('settings.gameSettings')}</h2>
          
          {/* Player Count */}
          <div className="mb-4">
            <label className="block text-lg mb-2">{t('settings.playerCount')}</label>
            <select
              value={settings.playerCount}
              onChange={(e) => updateSetting('playerCount', parseInt(e.target.value) as 3 | 4 | 5 | 6)}
              className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              data-testid="player-count-select"
            >
              <option value={3}>{t('settings.playerCountOption', { count: 3 })}</option>
              <option value={4}>{t('settings.playerCountOption', { count: 4 })}</option>
              <option value={5}>{t('settings.playerCountOption', { count: 5 })}</option>
              <option value={6}>{t('settings.playerCountOption', { count: 6 })}</option>
            </select>
          </div>

          {/* COM Player Count */}
          <div className="mb-4">
            <label className="block text-lg mb-2">{t('settings.comPlayerCount')}</label>
            <select
              value={settings.comPlayerCount}
              onChange={(e) => updateSetting('comPlayerCount', parseInt(e.target.value))}
              className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              data-testid="com-player-count-select"
            >
              <option value={0}>0{locale === 'ja' ? '人（COMプレイヤーなし）' : ' (No COM players)'}</option>
              {Array.from({ length: settings.playerCount - 1 }, (_, i) => i + 1).map(count => (
                <option key={count} value={count}>
                  {count}{locale === 'ja' ? `人${count === settings.playerCount - 1 ? '（1人プレイ）' : ''}` : ` player${count > 1 ? 's' : ''}${count === settings.playerCount - 1 ? ' (Single play)' : ''}`}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-400 mt-1">
              <span data-testid="player-count-display">
              {settings.comPlayerCount === 0 
                ? t('settings.singlePlayerMode')
                : t('settings.humanAndCom', { 
                    comCount: settings.comPlayerCount, 
                    totalCount: settings.comPlayerCount + 1 
                  })
              }
              </span>
            </p>
          </div>

          {/* Difficulty */}
          <div className="mb-4">
            <label className="block text-lg mb-2">{t('settings.difficulty')}</label>
            <select
              value={settings.difficulty}
              onChange={(e) => updateSetting('difficulty', e.target.value as 'easy' | 'normal' | 'hard')}
              disabled={settings.comPlayerCount === 0}
              data-testid="difficulty-select"
              className={`w-full p-3 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none ${
                settings.comPlayerCount === 0 
                  ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                  : 'bg-gray-700'
              }`}
            >
              <option value="easy">{t('settings.difficultyEasy')}{locale === 'ja' ? ' - CPUが弱く、ヒントが多い' : ' - Weak CPU, more hints'}</option>
              <option value="normal">{t('settings.difficultyNormal')}{locale === 'ja' ? ' - 標準的な難易度' : ' - Standard difficulty'}</option>
              <option value="hard">{t('settings.difficultyHard')}{locale === 'ja' ? ' - CPUが強く、ヒントが少ない' : ' - Strong CPU, fewer hints'}</option>
            </select>
            {settings.comPlayerCount === 0 && (
              <p className="text-sm text-gray-400 mt-1" data-testid="single-player-difficulty-notice">{t('settings.singlePlayerDifficultyNote')}</p>
            )}
          </div>

        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-6" data-testid="rule-settings-section">
          <h2 className="text-2xl font-semibold mb-4" data-testid="rule-settings-title">{t('settings.ruleSettings')}</h2>
          
          {/* Show Hints */}
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showHints}
                onChange={(e) => updateSetting('showHints', e.target.checked)}
                className="mr-3 w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                data-testid="show-hints-checkbox"
              />
              <span className="text-lg">{t('settings.showHints')}</span>
            </label>
            <p className="text-sm text-gray-400 mt-1" data-testid="show-hints-description">{t('settings.showHintsDescription')}</p>
          </div>
          
          {/* Controlled Hadamard */}
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.controlledHadamard}
                onChange={(e) => updateSetting('controlledHadamard', e.target.checked)}
                className="mr-3 w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                data-testid="controlled-hadamard-checkbox"
              />
              <span className="text-lg">{t('settings.controlledHadamard')}</span>
            </label>
            <p className="text-sm text-gray-400 mt-1" data-testid="controlled-hadamard-description">{t('settings.controlledHadamardDescription')}</p>
          </div>

          {/* Allow Unfinalized Measurement */}
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowUnfinalizedMeasurement}
                onChange={(e) => updateSetting('allowUnfinalizedMeasurement', e.target.checked)}
                className="mr-3 w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-lg">{t('settings.allowUnfinalizedMeasurement')}</span>
            </label>
            <p className="text-sm text-gray-400 mt-1" data-testid="allow-unfinalized-measurement-description">{t('settings.allowUnfinalizedMeasurementDescription')}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-6" data-testid="system-settings-section">
          <h2 className="text-2xl font-semibold mb-4" data-testid="system-settings-title">{t('settings.systemSettings')}</h2>
          

          {/* Language */}
          <div className="mb-4">
            <label className="block text-lg mb-2" data-testid="language-label">{t('settings.language')}</label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value as 'ja' | 'en')}
              data-testid="language-select"
              className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>


          {/* Audio Settings - Hidden for future implementation */}
          {false && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-3">オーディオ設定</h3>
              
              {/* Sound Volume */}
              <div className="mb-3">
                <label className="block text-base mb-2" data-testid="sound-volume-label">効果音音量: {settings.soundVolume}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.soundVolume}
                  onChange={(e) => updateSetting('soundVolume', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Music Volume */}
              <div className="mb-0">
                <label className="block text-base mb-2" data-testid="music-volume-label">BGM音量: {settings.musicVolume}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.musicVolume}
                  onChange={(e) => updateSetting('musicVolume', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-lg rounded-lg shadow-lg transition duration-300"
            data-testid="reset-button"
          >
            {t('settings.resetToDefaults')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg rounded-lg shadow-lg transition duration-300"
            data-testid="save-button"
          >
            {t('settings.saveSettings')}
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white text-lg rounded-lg shadow-lg transition duration-300"
            data-testid="back-button"
          >
            {t('settings.backToTitle')}
          </button>
          {onStartGame && (
            <button
              onClick={onStartGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg rounded-lg shadow-lg transition duration-300"
              data-testid="start-game-button"
            >
              {t('common.start')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
