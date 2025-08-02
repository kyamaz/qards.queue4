// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsScreen from '../../src/components/SettingsScreen';

describe('SettingsScreen Component', () => {
  const mockOnBack = jest.fn();
  const mockOnStartGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render settings title', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      expect(screen.getByTestId('settings-title')).toBeInTheDocument();
    });

    it('should render all setting sections', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Note: Audio settings are hidden for future implementation
      expect(screen.getByTestId('game-settings-title')).toBeInTheDocument();
      expect(screen.getByTestId('rule-settings-title')).toBeInTheDocument();
      expect(screen.getByTestId('system-settings-title')).toBeInTheDocument();
    });

    // Audio settings are hidden for future implementation
    it.skip('should render volume sliders with default values', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      expect(screen.getByTestId('sound-volume-label')).toHaveTextContent('効果音音量: 50%');
      expect(screen.getByTestId('music-volume-label')).toHaveTextContent('BGM音量: 30%');
    });

    it('should render difficulty selector with default value', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Find the difficulty select by finding all selects and choosing the one with difficulty options
      const selects = screen.getAllByRole('combobox');
      const difficultySelect = selects.find(select => {
        return select.querySelector('option[value="normal"]')?.textContent?.includes('中級');
      });
      expect(difficultySelect).toBeInTheDocument();
      expect(difficultySelect).toHaveValue('normal');
    });


    it('should render hints checkbox checked by default', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const hintsCheckbox = screen.getByLabelText('ヒント表示');
      expect(hintsCheckbox).toBeChecked();
    });

    it('should render controlled hadamard checkbox unchecked by default', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const controlledHadamardCheckbox = screen.getByLabelText('制御アダマール使用');
      expect(controlledHadamardCheckbox).not.toBeChecked();
    });

    it('should render language selector with default value', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Find the language select by finding the parent div containing the label
      const languageLabel = screen.getByTestId('language-label');
      const languageSelect = languageLabel.parentElement?.parentElement?.querySelector('select');
      expect(languageSelect).toBeInTheDocument();
      expect(languageSelect).toHaveValue('ja');
    });

    it('should render player count selector with default value', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const playerCountSelect = screen.getByTestId('player-count-select');
      expect(playerCountSelect).toBeInTheDocument();
      expect(playerCountSelect).toHaveValue('4');
    });

    it('should render COM player count selector with default value', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const comPlayerCountSelect = screen.getByTestId('com-player-count-select');
      expect(comPlayerCountSelect).toBeInTheDocument();
      expect(comPlayerCountSelect).toHaveValue('0');
    });
  });

  describe('User Interactions', () => {
    // Audio settings are hidden for future implementation
    it.skip('should update sound volume when slider is moved', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const soundSlider = screen.getAllByRole('slider')[0];
      fireEvent.change(soundSlider, { target: { value: '75' } });
      
      expect(screen.getByTestId('sound-volume-label')).toHaveTextContent('効果音音量: 75%');
    });

    it.skip('should update music volume when slider is moved', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const musicSlider = screen.getAllByRole('slider')[1];
      fireEvent.change(musicSlider, { target: { value: '60' } });
      
      expect(screen.getByTestId('music-volume-label')).toHaveTextContent('BGM音量: 60%');
    });

    it('should update difficulty when selector is changed', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // First enable COM players
      const comPlayerCountSelect = screen.getByTestId('com-player-count-select');
      fireEvent.change(comPlayerCountSelect, { target: { value: '3' } });
      
      // Find the difficulty select by finding all selects and choosing the one with difficulty options
      const selects = screen.getAllByRole('combobox');
      const difficultySelect = selects.find(select => {
        return select.querySelector('option[value="normal"]')?.textContent?.includes('中級');
      }) as HTMLSelectElement;
      
      fireEvent.change(difficultySelect, { target: { value: 'hard' } });
      
      expect(difficultySelect).toHaveValue('hard');
    });


    it('should toggle hints checkbox', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const hintsCheckbox = screen.getByLabelText('ヒント表示');
      expect(hintsCheckbox).toBeChecked();
      
      fireEvent.click(hintsCheckbox);
      expect(hintsCheckbox).not.toBeChecked();
    });

    it('should toggle controlled hadamard checkbox', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const controlledHadamardCheckbox = screen.getByLabelText('制御アダマール使用');
      expect(controlledHadamardCheckbox).not.toBeChecked();
      
      fireEvent.click(controlledHadamardCheckbox);
      expect(controlledHadamardCheckbox).toBeChecked();
    });

    it('should update language when selector is changed', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Find the language select by finding the parent div containing the label
      const languageLabel = screen.getByTestId('language-label');
      const languageSelect = languageLabel.parentElement?.parentElement?.querySelector('select') as HTMLSelectElement;
      fireEvent.change(languageSelect, { target: { value: 'en' } });
      
      expect(languageSelect).toHaveValue('en');
    });

    it('should update player count when selector is changed', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const playerCountSelect = screen.getByTestId('player-count-select');
      fireEvent.change(playerCountSelect, { target: { value: '6' } });
      
      expect(playerCountSelect).toHaveValue('6');
    });

    it('should update COM player count when selector is changed', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const comPlayerCountSelect = screen.getByTestId('com-player-count-select');
      fireEvent.change(comPlayerCountSelect, { target: { value: '2' } });
      
      expect(comPlayerCountSelect).toHaveValue('2');
    });

    it('should allow 0 COM players for single player mode', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Default is already 0 COM players
      const comPlayerCountSelect = screen.getByTestId('com-player-count-select');
      expect(comPlayerCountSelect).toHaveValue('0');
      expect(screen.getByTestId('player-count-display')).toHaveTextContent('1人プレイモード（人間プレイヤーのみ）');
    });

    it('should disable difficulty setting when COM players is 0', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Default is already 0 COM players, so difficulty should be disabled
      const selects = screen.getAllByRole('combobox');
      const difficultySelect = selects.find(select => {
        return select.querySelector('option[value="normal"]')?.textContent?.includes('中級');
      });
      expect(difficultySelect).toBeDisabled();
      expect(screen.getByTestId('single-player-difficulty-notice')).toBeInTheDocument();
    });

    it('should adjust COM player count when total player count changes', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Initially 4 total players, 0 COM players
      const comPlayerCountSelect = screen.getByTestId('com-player-count-select');
      expect(comPlayerCountSelect).toHaveValue('0');
      
      // Change total players to 3
      const playerCountSelect = screen.getByTestId('player-count-select');
      fireEvent.change(playerCountSelect, { target: { value: '3' } });
      
      // COM players should automatically adjust to 2 (3 - 1)
      expect(comPlayerCountSelect).toHaveValue('2');
    });
  });

  describe('Button Actions', () => {
    it('should call onBack when back button is clicked', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    // Game start button has been removed from the UI

    it('should save settings to localStorage when save button is clicked', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // First enable COM players so we can change difficulty
      const comPlayerCountSelect = screen.getByTestId('com-player-count-select');
      fireEvent.change(comPlayerCountSelect, { target: { value: '3' } });
      
      // Now change difficulty (it should be enabled now)
      const selects = screen.getAllByRole('combobox');
      const difficultySelect = selects.find(select => {
        return select.querySelector('option[value="normal"]')?.textContent?.includes('中級');
      }) as HTMLSelectElement;
      fireEvent.change(difficultySelect, { target: { value: 'hard' } });
      
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);
      
      // Check if settings were saved to localStorage
      const savedSettings = localStorage.getItem('qards4-settings');
      expect(savedSettings).toBeTruthy();
      
      const parsedSettings = JSON.parse(savedSettings!);
      expect(parsedSettings.difficulty).toBe('hard'); // Should now be hard
      expect(parsedSettings.playerCount).toBe(4); // Default value
      expect(parsedSettings.comPlayerCount).toBe(3); // Changed value
      // Audio settings should still be preserved internally
      expect(parsedSettings.soundVolume).toBe(50); // Default value
      expect(parsedSettings.musicVolume).toBe(30); // Default value
      
      // Save button no longer calls onBack - it just saves settings
      expect(mockOnBack).toHaveBeenCalledTimes(0);
    });

    it('should reset all settings when reset button is clicked', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // First enable COM players
      const comPlayerCountSelect = screen.getByTestId('com-player-count-select');
      fireEvent.change(comPlayerCountSelect, { target: { value: '3' } });
      
      // Now change difficulty
      const selects = screen.getAllByRole('combobox');
      const difficultySelect = selects.find(select => {
        return select.querySelector('option[value="normal"]')?.textContent?.includes('中級');
      }) as HTMLSelectElement;
      fireEvent.change(difficultySelect, { target: { value: 'hard' } });
      
      // Reset settings
      const resetButton = screen.getByTestId('reset-button');
      fireEvent.click(resetButton);
      
      // Check if settings are back to defaults (audio settings are internal only)
      expect(difficultySelect).toHaveValue('normal');
      expect(screen.getByTestId('player-count-select')).toHaveValue('4');
      expect(screen.getByTestId('com-player-count-select')).toHaveValue('0');
    });
  });

  describe('Styling and Layout', () => {
    it('should apply correct button colors', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const resetButton = screen.getByTestId('reset-button');
      const saveButton = screen.getByTestId('save-button');
      const backButton = screen.getByTestId('back-button');
      
      expect(resetButton).toHaveClass('bg-red-600');
      expect(saveButton).toHaveClass('bg-green-600');
      expect(backButton).toHaveClass('bg-gray-600');
      // Game start button has been removed
    });

    it('should have hover effects on buttons', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const resetButton = screen.getByTestId('reset-button');
      expect(resetButton).toHaveClass('hover:bg-red-700');
    });

    it('should display hint description', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      expect(screen.getByTestId('show-hints-description')).toBeInTheDocument();
    });

    it('should display controlled hadamard description', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      expect(screen.getByTestId('controlled-hadamard-description')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined callbacks gracefully', () => {
      render(<SettingsScreen onBack={undefined as any} onStartGame={undefined as any} />);
      
      const backButton = screen.getByTestId('back-button');
      
      expect(() => fireEvent.click(backButton)).not.toThrow();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const saveButton = screen.getByTestId('save-button');
      
      expect(() => fireEvent.click(saveButton)).not.toThrow();
      
      // Restore original function
      localStorage.setItem = originalSetItem;
    });
  });
});