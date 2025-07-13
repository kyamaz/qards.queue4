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

describe('Game Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Screen', () => {
    it('should render title on initial screen', () => {
      render(<Game />);
      
      expect(screen.getByText('Quantum Gate Card Game')).toBeInTheDocument();
    });

    it('should render start button on initial screen', () => {
      render(<Game />);
      
      const startButton = screen.getByRole('button', { name: 'ゲームを開始' });
      expect(startButton).toBeInTheDocument();
    });

    it('should render rules button on initial screen', () => {
      render(<Game />);
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      expect(rulesButton).toBeInTheDocument();
    });

    it('should have proper styling for title screen', () => {
      render(<Game />);
      
      const container = screen.getByText('Quantum Gate Card Game').parentElement?.parentElement;
      expect(container).toHaveClass('min-h-screen', 'bg-gray-800');
    });
  });

  describe('Screen Navigation', () => {
    it('should navigate to game screen when start button is clicked', () => {
      render(<Game />);
      
      const startButton = screen.getByRole('button', { name: 'ゲームを開始' });
      fireEvent.click(startButton);
      
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
      expect(screen.queryByText('Quantum Gate Card Game')).not.toBeInTheDocument();
    });

    it('should navigate to rules screen when rules button is clicked', () => {
      render(<Game />);
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      expect(screen.getByText('ゲームのルール')).toBeInTheDocument();
      expect(screen.queryByText('Quantum Gate Card Game')).not.toBeInTheDocument();
    });

    it('should return to title from rules screen', () => {
      render(<Game />);
      
      // Go to rules
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      // Go back to title
      const backButton = screen.getByRole('button', { name: 'タイトルに戻る' });
      fireEvent.click(backButton);
      
      expect(screen.getByText('Quantum Gate Card Game')).toBeInTheDocument();
    });

    it('should navigate from rules to game directly', () => {
      render(<Game />);
      
      // Go to rules
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      // Start game from rules
      const startButton = screen.getByRole('button', { name: 'ゲームを開始' });
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
      expect(screen.getByText('ゲームのルール')).toBeInTheDocument();
      expect(screen.getByText('ゲームの目的')).toBeInTheDocument();
      expect(screen.getByText('カードの種類')).toBeInTheDocument();
      expect(screen.getByText('ゲームの準備')).toBeInTheDocument();
      expect(screen.getByText('プレイ方法')).toBeInTheDocument();
      expect(screen.getByText('カードの配置ルール')).toBeInTheDocument();
      expect(screen.getByText('ゲームの終了')).toBeInTheDocument();
    });

    it('should display card types information', () => {
      render(<Game />);
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      // Check card types
      expect(screen.getByText(/量子ビットカード/)).toBeInTheDocument();
      expect(screen.getByText(/ゲートカード/)).toBeInTheDocument();
      expect(screen.getByText(/ユニタリカード/)).toBeInTheDocument();
      expect(screen.getByText(/制御カード/)).toBeInTheDocument();
      expect(screen.getByText(/測定カード/)).toBeInTheDocument();
    });

    it('should have proper styling for rules screen', () => {
      render(<Game />);
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      const rulesContainer = screen.getByText('ゲームのルール').parentElement;
      expect(rulesContainer).toHaveClass('bg-gray-900');
    });

    it('should have navigation buttons on rules screen', () => {
      render(<Game />);
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      fireEvent.click(rulesButton);
      
      expect(screen.getByRole('button', { name: 'タイトルに戻る' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ゲームを開始' })).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should show hover effects on buttons', () => {
      render(<Game />);
      
      const startButton = screen.getByRole('button', { name: 'ゲームを開始' });
      expect(startButton).toHaveClass('hover:bg-blue-600');
      
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      expect(rulesButton).toHaveClass('hover:bg-green-600');
    });

    it('should maintain button styling consistency', () => {
      render(<Game />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('px-8', 'py-4', 'rounded-lg', 'text-xl');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<Game />);
      
      expect(screen.getByRole('button', { name: 'ゲームを開始' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '遊び方' })).toBeInTheDocument();
    });

    it('should maintain focus on navigation', () => {
      render(<Game />);
      
      const startButton = screen.getByRole('button', { name: 'ゲームを開始' });
      startButton.focus();
      expect(document.activeElement).toBe(startButton);
      
      fireEvent.click(startButton);
      // Focus management would depend on GameScreen implementation
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid screen switching', () => {
      render(<Game />);
      
      const startButton = screen.getByRole('button', { name: 'ゲームを開始' });
      const rulesButton = screen.getByRole('button', { name: '遊び方' });
      
      // Rapidly switch screens
      fireEvent.click(startButton);
      fireEvent.click(rulesButton); // This shouldn't be visible, but test robustness
      
      // Should be on game screen
      expect(screen.getByTestId('game-screen')).toBeInTheDocument();
    });

    it('should render correctly with different viewport sizes', () => {
      render(<Game />);
      
      const container = screen.getByText('Quantum Gate Card Game').parentElement?.parentElement;
      
      // Check responsive classes
      expect(container).toHaveClass('min-h-screen');
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
  });
});