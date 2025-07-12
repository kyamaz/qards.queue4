'use client';

import React, { useState } from 'react';
import GameScreen from './GameScreen'; // Import the actual GameScreen component

// Placeholder components for different game screens
const TitleScreen: React.FC<{ onStartGame: () => void }> = ({ onStartGame }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
    <h1 className="text-5xl font-bold mb-8">量子ゲート並べ</h1>
    <button
      className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg shadow-lg transition duration-300"
      onClick={onStartGame}
    >
      ゲーム開始
    </button>
  </div>
);

const ResultScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-600 text-white">
    <h2 className="text-4xl">リザルト画面 (開発中)</h2>
  </div>
);

const Game: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'title' | 'playing' | 'result'>('title');

  const handleStartGame = () => {
    setCurrentScreen('playing');
  };

  // Render the appropriate screen based on currentScreen state
  switch (currentScreen) {
    case 'title':
      return <TitleScreen onStartGame={handleStartGame} />;
    case 'playing':
      return <GameScreen />;
    case 'result':
      return <ResultScreen />;
    default:
      return <TitleScreen onStartGame={handleStartGame} />;
  }
};

export default Game;
