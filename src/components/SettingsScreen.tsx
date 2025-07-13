'use client';

import React, { useState, useEffect } from 'react';

interface SettingsData {
  soundVolume: number;
  musicVolume: number;
  difficulty: 'easy' | 'normal' | 'hard';
  animationSpeed: 'slow' | 'normal' | 'fast';
  showHints: boolean;
  language: 'ja' | 'en';
  playerCount: 3 | 4 | 5 | 6;
}

interface SettingsScreenProps {
  onBack: () => void;
  onStartGame: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onStartGame }) => {
  const defaultSettings = React.useMemo(() => ({
    soundVolume: 50,
    musicVolume: 30,
    difficulty: 'normal' as const,
    animationSpeed: 'normal' as const,
    showHints: true,
    language: 'ja' as const,
    playerCount: 4 as const,
  }), []);

  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('qards4-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }, [defaultSettings]);

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('qards4-settings', JSON.stringify(settings));
      console.log('Settings saved successfully:', settings);
      onBack();
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      // Still navigate back even if save fails
      onBack();
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white p-6">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">設定</h1>
        

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">ゲーム設定</h2>
          
          {/* Player Count */}
          <div className="mb-4">
            <label className="block text-lg mb-2">プレイヤー人数</label>
            <select
              value={settings.playerCount}
              onChange={(e) => updateSetting('playerCount', parseInt(e.target.value) as 3 | 4 | 5 | 6)}
              className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value={3}>3人</option>
              <option value={4}>4人（推奨）</option>
              <option value={5}>5人</option>
              <option value={6}>6人</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="mb-4">
            <label className="block text-lg mb-2">難易度</label>
            <select
              value={settings.difficulty}
              onChange={(e) => updateSetting('difficulty', e.target.value as 'easy' | 'normal' | 'hard')}
              className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="easy">初級 - CPUが弱く、ヒントが多い</option>
              <option value="normal">中級 - 標準的な難易度</option>
              <option value="hard">上級 - CPUが強く、ヒントが少ない</option>
            </select>
          </div>

          {/* Show Hints */}
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showHints}
                onChange={(e) => updateSetting('showHints', e.target.checked)}
                className="mr-3 w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-lg">ヒント表示</span>
            </label>
            <p className="text-sm text-gray-400 mt-1">有効にすると、配置可能な場所がハイライトされます</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">システム設定</h2>
          
          {/* Language */}
          <div className="mb-4">
            <label className="block text-lg mb-2">言語</label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value as 'ja' | 'en')}
              className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Animation Speed */}
          <div className="mb-4">
            <label className="block text-lg mb-2">アニメーション速度</label>
            <select
              value={settings.animationSpeed}
              onChange={(e) => updateSetting('animationSpeed', e.target.value as 'slow' | 'normal' | 'fast')}
              className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="slow">ゆっくり</option>
              <option value="normal">標準</option>
              <option value="fast">高速</option>
            </select>
          </div>

          {/* Audio Settings */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-3">オーディオ設定</h3>
            
            {/* Sound Volume */}
            <div className="mb-3">
              <label className="block text-base mb-2">効果音音量: {settings.soundVolume}%</label>
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
              <label className="block text-base mb-2">BGM音量: {settings.musicVolume}%</label>
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-lg rounded-lg shadow-lg transition duration-300"
          >
            リセット
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg rounded-lg shadow-lg transition duration-300"
          >
            保存してタイトルに戻る
          </button>
          <button
            onClick={onStartGame}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-lg shadow-lg transition duration-300"
          >
            ゲーム開始
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white text-lg rounded-lg shadow-lg transition duration-300"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;