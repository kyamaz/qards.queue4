// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
'use client';

import React, { useState } from 'react';
import GameScreen from './GameScreen'; // Import the actual GameScreen component
import SettingsScreen from './SettingsScreen'; // Import the SettingsScreen component

// Placeholder components for different game screens
const TitleScreen: React.FC<{ onStartGame: () => void; onSettings: () => void; onRules: () => void }> = ({ 
  onStartGame, 
  onSettings, 
  onRules 
}) => (
  <div 
    className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white"
    data-testid="title-screen"
  >
    <h1 className="text-5xl font-bold mb-12" data-testid="game-title">量子ゲート並べ</h1>
    
    <div className="flex flex-col gap-4" data-testid="title-menu">
      <button
        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg shadow-lg transition duration-300 min-w-[240px]"
        onClick={onStartGame}
        data-testid="start-game-button"
      >
        ゲーム開始
      </button>
      
      <button
        className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl rounded-lg shadow-lg transition duration-300 min-w-[240px]"
        onClick={onRules}
        data-testid="rules-button"
      >
        遊び方
      </button>
      
      <button
        className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-xl rounded-lg shadow-lg transition duration-300 min-w-[240px]"
        onClick={onSettings}
        data-testid="settings-button"
      >
        設定
      </button>
    </div>
    
    <div className="mt-8 text-center text-gray-400" data-testid="game-info">
      <p className="text-sm">量子コンピューティングを学ぶカードゲーム</p>
      <p className="text-xs mt-1">Version 1.0.0</p>
    </div>
  </div>
);

const ResultScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-600 text-white">
    <h2 className="text-4xl">リザルト画面 (開発中)</h2>
  </div>
);

const RulesScreen: React.FC<{ onBack: () => void; onStartGame: () => void }> = ({ onBack, onStartGame }) => (
  <div className="flex flex-col min-h-screen bg-gray-800 text-white p-6">
    <div className="max-w-4xl mx-auto w-full">
      <h1 className="text-4xl font-bold mb-8 text-center" data-testid="rules-title">遊び方</h1>
      
      <div className="bg-gray-900 rounded-lg p-6 mb-6" data-testid="game-purpose-section">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400" data-testid="game-purpose-title">ゲームの目的</h2>
        <p className="text-lg leading-relaxed">
          量子ゲート並べは、量子コンピューティングの概念を学びながら楽しむカードゲームです。
          手札のカードを適切な順序でボードに配置し、最初に手札を空にしたプレイヤーが勝利します。
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 mb-6" data-testid="card-types-section">
        <h2 className="text-2xl font-semibold mb-4 text-green-400" data-testid="card-types-title">カードの種類</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-800 p-4 rounded-lg" data-testid="gate-card-info">
            <h3 className="text-xl font-semibold mb-2">🔵 ゲートカード</h3>
            <p>I, X, Z, H ゲート。量子演算を表現します。</p>
          </div>
          <div className="bg-green-800 p-4 rounded-lg" data-testid="qubit-card-info">
            <h3 className="text-xl font-semibold mb-2">🟢 量子ビットカード</h3>
            <p>|0⟩, |1⟩, |+⟩, |-⟩ 状態を表現します。</p>
          </div>
          <div className="bg-purple-800 p-4 rounded-lg" data-testid="unitary-card-info">
            <h3 className="text-xl font-semibold mb-2">🟣 ユニタリカード</h3>
            <p>ターン順を逆転させる特殊カードです。</p>
          </div>
          <div className="bg-red-800 p-4 rounded-lg" data-testid="measurement-card-info">
            <h3 className="text-xl font-semibold mb-2">🔴 測定カード</h3>
            <p>量子状態を測定し、得点を獲得します。</p>
          </div>
          <div className="bg-yellow-800 p-4 rounded-lg" data-testid="control-card-info">
            <h3 className="text-xl font-semibold mb-2">🟡 制御カード</h3>
            <p>他のレーンのカードと連動する高度なカードです。</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 mb-6" data-testid="basic-rules-section">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-400" data-testid="basic-rules-title">基本ルール</h2>
        <ol className="list-decimal list-inside space-y-2 text-lg">
          <li>各プレイヤーは手札からカードを1枚ずつ場に出します</li>
          <li>カードは物理法則に従って配置する必要があります</li>
          <li>測定カードを出すとポイントを獲得できます</li>
          <li>ユニタリカードはターン順を逆転させます</li>
          <li>最初に手札を空にしたプレイヤーが勝利です</li>
        </ol>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 mb-6" data-testid="placement-rules-section">
        <h2 className="text-2xl font-semibold mb-4 text-purple-400" data-testid="placement-rules-title">配置ルール</h2>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>ゲートカードは他のゲートカードの後に配置可能</li>
          <li>量子ビットカードは測定カードの後、またはIゲートの後に配置可能</li>
          <li>測定カードは量子ビットカードの後にのみ配置可能</li>
          <li>ユニタリカードは測定カードの後には配置できません</li>
          <li>制御カードは隣接するレーンのカードを対象とします</li>
        </ul>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={onStartGame}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-lg shadow-lg transition duration-300"
          data-testid="rules-start-game-button"
        >
          ゲーム開始
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white text-lg rounded-lg shadow-lg transition duration-300"
          data-testid="rules-back-button"
        >
          タイトルに戻る
        </button>
      </div>
    </div>
  </div>
);

const Game: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'title' | 'playing' | 'result' | 'settings' | 'rules'>('title');

  const handleStartGame = () => {
    setCurrentScreen('playing');
  };

  const handleSettings = () => {
    setCurrentScreen('settings');
  };

  const handleRules = () => {
    setCurrentScreen('rules');
  };

  const handleBackToTitle = () => {
    setCurrentScreen('title');
  };

  // Render the appropriate screen based on currentScreen state
  switch (currentScreen) {
    case 'title':
      return (
        <TitleScreen 
          onStartGame={handleStartGame} 
          onSettings={handleSettings}
          onRules={handleRules}
        />
      );
    case 'playing':
      return <GameScreen onBackToMenu={handleBackToTitle} />;
    case 'result':
      return <ResultScreen />;
    case 'settings':
      return (
        <SettingsScreen 
          onBack={handleBackToTitle}
          onStartGame={handleStartGame}
        />
      );
    case 'rules':
      return <RulesScreen onBack={handleBackToTitle} onStartGame={handleStartGame} />;
    default:
      return (
        <TitleScreen 
          onStartGame={handleStartGame} 
          onSettings={handleSettings}
          onRules={handleRules}
        />
      );
  }
};

export default Game;
