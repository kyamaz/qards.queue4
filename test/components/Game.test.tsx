import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from '../../src/components/Game';

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Screen', () => {
    it('should render title on initial screen', () => {
      render(<Game />);
      
      expect(screen.getByText('量子ゲート並べ')).toBeInTheDocument();
    });

    it('should render start button on initial screen', () => {
      render(<Game />);
      
      const startButton = screen.getByRole('button', { name: 'ゲーム開始' });
      expect(startButton).toBeInTheDocument();
    });

    it('should render rules button on initial screen', () => {
      render(<Game />);
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      expect(rulesButton).toBeInTheDocument();
    });

    it('should render settings button on initial screen', () => {
      render(<Game />);
      
      const settingsButton = screen.getByRole('button', { name: '設定' });
      expect(settingsButton).toBeInTheDocument();
    });

    it('should have proper styling for title screen', () => {
      render(<Game />);
      
      const container = screen.getByText('量子ゲート並べ').parentElement;
      expect(container).toHaveClass('min-h-screen', 'bg-gray-800');
    });

    it('should display version information', () => {
      render(<Game />);
      
      expect(screen.getByText('量子コンピューティングを学ぶカードゲーム')).toBeInTheDocument();
      expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
    });
  });

  describe('Screen Navigation', () => {
    it('should navigate to game screen when start button is clicked', () => {
      render(<Game />);
      
      const startButton = screen.getByRole('button', { name: 'ゲーム開始' });
      fireEvent.click(startButton);
      
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      expect(screen.queryByText('量子ゲート並べ')).not.toBeInTheDocument();
    });

    it('should navigate to rules screen when rules button is clicked', () => {
      render(<Game />);
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      expect(screen.getByText('遊び方')).toBeInTheDocument();
      expect(screen.queryByText('量子ゲート並べ')).not.toBeInTheDocument();
    });

    it('should navigate to settings screen when settings button is clicked', () => {
      render(<Game />);
      
      const settingsButton = screen.getByRole('button', { name: '設定' });
      fireEvent.click(settingsButton);
      
      expect(screen.getByTestId('settings-screen')).toBeInTheDocument();
      expect(screen.queryByText('量子ゲート並べ')).not.toBeInTheDocument();
    });

    it('should return to title from rules screen', () => {
      render(<Game />);
      
      // Go to rules
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      // Go back to title
      const backButton = screen.getByRole('button', { name: 'タイトルに戻る' });
      fireEvent.click(backButton);
      
      expect(screen.getByText('量子ゲート並べ')).toBeInTheDocument();
    });

    it('should navigate from rules to game directly', () => {
      render(<Game />);
      
      // Go to rules
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      // Start game from rules
      const startButton = screen.getByRole('button', { name: 'ゲーム開始' });
      fireEvent.click(startButton);
      
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    it('should return to title from settings screen', () => {
      render(<Game />);
      
      // Go to settings
      const settingsButton = screen.getByRole('button', { name: '設定' });
      fireEvent.click(settingsButton);
      
      // Go back to title
      const backButton = screen.getByRole('button', { name: 'Back to Title' });
      fireEvent.click(backButton);
      
      expect(screen.getByText('量子ゲート並べ')).toBeInTheDocument();
    });

    it('should navigate from settings to game directly', () => {
      render(<Game />);
      
      // Go to settings
      const settingsButton = screen.getByRole('button', { name: '設定' });
      fireEvent.click(settingsButton);
      
      // Start game from settings
      const startButton = screen.getByRole('button', { name: 'Start Game from Settings' });
      fireEvent.click(startButton);
      
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });
  });

  describe('Rules Screen', () => {
    it('should display all rule sections', () => {
      render(<Game />);
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      // Check main sections
      expect(screen.getByText('遊び方')).toBeInTheDocument();
      expect(screen.getByText('ゲームの目的')).toBeInTheDocument();
      expect(screen.getByText('カードの種類')).toBeInTheDocument();
      expect(screen.getByText('基本ルール')).toBeInTheDocument();
      expect(screen.getByText('配置ルール')).toBeInTheDocument();
    });

    it('should display card types information', () => {
      render(<Game />);
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      // Check card types
      expect(screen.getByText('🟢 量子ビットカード')).toBeInTheDocument();
      expect(screen.getByText('🔵 ゲートカード')).toBeInTheDocument();
      expect(screen.getByText('🟣 ユニタリカード')).toBeInTheDocument();
      expect(screen.getByText('🟡 制御カード')).toBeInTheDocument();
      expect(screen.getByText('🔴 測定カード')).toBeInTheDocument();
    });

    it('should have proper styling for rules screen', () => {
      render(<Game />);
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      const rulesContainer = screen.getByText('遊び方').parentElement?.parentElement;
      expect(rulesContainer).toHaveClass('bg-gray-800');
    });

    it('should have navigation buttons on rules screen', () => {
      render(<Game />);
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      expect(screen.getByRole('button', { name: 'タイトルに戻る' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ゲーム開始' })).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should show hover effects on buttons', () => {
      render(<Game />);
      
      const startButton = screen.getByRole('button', { name: 'ゲーム開始' });
      expect(startButton).toHaveClass('hover:bg-blue-700');
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      expect(rulesButton).toHaveClass('hover:bg-green-700');
    });

    it('should maintain button styling consistency', () => {
      render(<Game />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('px-8', 'py-4', 'rounded-lg');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<Game />);
      
      expect(screen.getByRole('button', { name: 'ゲーム開始' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '遊び方' })).toBeInTheDocument();
    });

    it('should maintain focus on navigation', () => {
      render(<Game />);
      
      const startButton = screen.getByRole('button', { name: 'ゲーム開始' });
      startButton.focus();
      expect(document.activeElement).toBe(startButton);
      
      fireEvent.click(startButton);
      // Focus management would depend on GameScreen implementation
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid screen switching', () => {
      render(<Game />);
      
      const startButton = screen.getByRole('button', { name: 'ゲーム開始' });
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      
      // Rapidly switch screens
      fireEvent.click(startButton);
      fireEvent.click(rulesButton); // This shouldn't be visible, but test robustness
      
      // Should be on game screen
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    it('should render correctly with different viewport sizes', () => {
      render(<Game />);
      
      const container = screen.getByText('量子ゲート並べ').parentElement;
      
      // Check responsive classes
      expect(container).toHaveClass('min-h-screen');
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
  });
});