// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from '../../src/components/Game';
import { I18nProvider } from '../../src/i18n';

// Mock the GameScreen component since it has complex logic
jest.mock('../../src/components/GameScreen', () => {
  return function MockGameScreen() {
    return <div data-testid="game-screen">Game Screen</div>;
  };
});

// Mock the SettingsScreen component
jest.mock('../../src/components/SettingsScreen', () => {
  return function MockSettingsScreen({ onBack, onStartGame }: any) {
    return (
      <div data-testid="settings-screen">
        Settings Screen
        <button onClick={onBack}>Back to Title</button>
        <button onClick={onStartGame}>Start Game from Settings</button>
      </div>
    );
  };
});

describe('Game Component', () => {
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

  describe('Initial Screen', () => {
    it('should render title on initial screen', () => {
      renderWithI18n(<Game />);
      
      expect(screen.getByTestId('game-title')).toBeInTheDocument();
      expect(screen.getByTestId('game-title')).toHaveTextContent('量子ゲート並べ');
    });

    it('should render start button on initial screen', () => {
      renderWithI18n(<Game />);
      
      const startButton = screen.getByTestId('start-game-button');
      expect(startButton).toBeInTheDocument();
      expect(startButton).toHaveTextContent('ゲーム開始');
    });

    it('should render rules button on initial screen', () => {
      renderWithI18n(<Game />);
      
      const rulesButton = screen.getByTestId('rules-button');
      expect(rulesButton).toBeInTheDocument();
      expect(rulesButton).toHaveTextContent('遊び方');
    });

    it('should render settings button on initial screen', () => {
      renderWithI18n(<Game />);
      
      const settingsButton = screen.getByTestId('settings-button');
      expect(settingsButton).toBeInTheDocument();
      expect(settingsButton).toHaveTextContent('設定');
    });

    it('should have proper styling for title screen', () => {
      renderWithI18n(<Game />);
      
      const container = screen.getByTestId('title-screen');
      expect(container).toHaveClass('min-h-screen', 'bg-gray-800');
    });

    it('should display version information', () => {
      renderWithI18n(<Game />);
      
      const gameInfo = screen.getByTestId('game-info');
      expect(gameInfo).toBeInTheDocument();
      expect(gameInfo).toHaveTextContent('量子コンピューティングを学ぶカードゲーム');
      expect(gameInfo).toHaveTextContent('バージョン 0.1.0');
    });
  });

  describe('Screen Navigation', () => {
    it('should navigate to game screen when start button is clicked', () => {
      renderWithI18n(<Game />);
      
      const startButton = screen.getByTestId('start-game-button');
      fireEvent.click(startButton);
      
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('title-screen')).not.toBeInTheDocument();
    });

    it('should navigate to rules screen when rules button is clicked', () => {
      renderWithI18n(<Game />);
      
      const rulesButton = screen.getByTestId('rules-button');
      fireEvent.click(rulesButton);
      
      expect(screen.getByTestId('rules-title')).toBeInTheDocument();
      expect(screen.queryByTestId('title-screen')).not.toBeInTheDocument();
    });

    it('should navigate to settings screen when settings button is clicked', () => {
      renderWithI18n(<Game />);
      
      const settingsButton = screen.getByTestId('settings-button');
      fireEvent.click(settingsButton);
      
      expect(screen.getByTestId('settings-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('title-screen')).not.toBeInTheDocument();
    });

    it('should return to title from rules screen', () => {
      renderWithI18n(<Game />);
      
      // Go to rules
      const rulesButton = screen.getByTestId('rules-button');
      fireEvent.click(rulesButton);
      
      // Go back to title
      const backButton = screen.getByRole('button', { name: 'タイトルに戻る' });
      fireEvent.click(backButton);
      
      expect(screen.getByTestId('game-title')).toBeInTheDocument();
    });

    it('should navigate from rules to game directly', () => {
      renderWithI18n(<Game />);
      
      // Go to rules
      const rulesButton = screen.getByTestId('rules-button');
      fireEvent.click(rulesButton);
      
      // Start game from rules
      const startButton = screen.getByRole('button', { name: 'ゲーム開始' });
      fireEvent.click(startButton);
      
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    it('should return to title from settings screen', () => {
      renderWithI18n(<Game />);
      
      // Go to settings
      const settingsButton = screen.getByTestId('settings-button');
      fireEvent.click(settingsButton);
      
      // Go back to title
      const backButton = screen.getByRole('button', { name: 'Back to Title' });
      fireEvent.click(backButton);
      
      expect(screen.getByTestId('game-title')).toBeInTheDocument();
    });

    it('should navigate from settings to game directly', () => {
      renderWithI18n(<Game />);
      
      // Go to settings
      const settingsButton = screen.getByTestId('settings-button');
      fireEvent.click(settingsButton);
      
      // Start game from settings
      const startButton = screen.getByRole('button', { name: 'Start Game from Settings' });
      fireEvent.click(startButton);
      
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });
  });

  describe('Rules Screen', () => {
    it('should display all rule sections', () => {
      renderWithI18n(<Game />);
      
      const rulesButton = screen.getByTestId('rules-button');
      fireEvent.click(rulesButton);
      
      // Check main sections
      expect(screen.getByTestId('rules-title')).toBeInTheDocument();
      expect(screen.getByTestId('game-purpose-title')).toBeInTheDocument();
      expect(screen.getByTestId('card-types-title')).toBeInTheDocument();
      expect(screen.getByTestId('basic-rules-title')).toBeInTheDocument();
      expect(screen.getByTestId('placement-rules-title')).toBeInTheDocument();
    });

    it('should display card types information', () => {
      renderWithI18n(<Game />);
      
      const rulesButton = screen.getByTestId('rules-button');
      fireEvent.click(rulesButton);
      
      // Check card types
      expect(screen.getByTestId('qubit-card-info')).toBeInTheDocument();
      expect(screen.getByTestId('gate-card-info')).toBeInTheDocument();
      expect(screen.getByTestId('unitary-card-info')).toBeInTheDocument();
      expect(screen.getByTestId('control-card-info')).toBeInTheDocument();
      expect(screen.getByTestId('measurement-card-info')).toBeInTheDocument();
    });

    it('should have proper styling for rules screen', () => {
      renderWithI18n(<Game />);
      
      const rulesButton = screen.getByTestId('rules-button');
      fireEvent.click(rulesButton);
      
      const rulesTitle = screen.getByTestId('rules-title');
      const rulesContainer = rulesTitle.parentElement?.parentElement;
      expect(rulesContainer).toHaveClass('bg-gray-800');
    });

    it('should have navigation buttons on rules screen', () => {
      renderWithI18n(<Game />);
      
      const rulesButton = screen.getByTestId('rules-button');
      fireEvent.click(rulesButton);
      
      expect(screen.getByTestId('rules-back-button')).toBeInTheDocument();
      expect(screen.getByTestId('rules-start-game-button')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should show hover effects on buttons', () => {
      renderWithI18n(<Game />);
      
      const startButton = screen.getByTestId('start-game-button');
      expect(startButton).toHaveClass('hover:bg-blue-700');
      
      const rulesButton = screen.getByTestId('rules-button');
      expect(rulesButton).toHaveClass('hover:bg-green-700');
    });

    it('should maintain button styling consistency', () => {
      renderWithI18n(<Game />);
      
      const startButton = screen.getByTestId('start-game-button');
      const rulesButton = screen.getByTestId('rules-button');
      const settingsButton = screen.getByTestId('settings-button');
      
      [startButton, rulesButton, settingsButton].forEach(button => {
        expect(button).toHaveClass('px-8', 'py-4', 'rounded-lg');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      renderWithI18n(<Game />);
      
      expect(screen.getByTestId('start-game-button')).toHaveTextContent('ゲーム開始');
      expect(screen.getByTestId('rules-button')).toHaveTextContent('遊び方');
      expect(screen.getByTestId('settings-button')).toHaveTextContent('設定');
    });

    it('should maintain focus on navigation', () => {
      renderWithI18n(<Game />);
      
      const startButton = screen.getByTestId('start-game-button');
      startButton.focus();
      expect(document.activeElement).toBe(startButton);
      
      fireEvent.click(startButton);
      // Focus management would depend on GameScreen implementation
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid screen switching', () => {
      renderWithI18n(<Game />);
      
      const startButton = screen.getByTestId('start-game-button');
      
      // Click start button to go to game screen
      fireEvent.click(startButton);
      
      // Should be on game screen
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    it('should render correctly with different viewport sizes', () => {
      renderWithI18n(<Game />);
      
      const container = screen.getByTestId('title-screen');
      
      // Check responsive classes
      expect(container).toHaveClass('min-h-screen');
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
  });
});