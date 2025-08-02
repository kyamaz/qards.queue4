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
      
      expect(screen.getByText('設定')).toBeInTheDocument();
    });

    it('should render all setting sections', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Note: Audio settings are hidden for future implementation
      expect(screen.getByText('ゲーム設定')).toBeInTheDocument();
      expect(screen.getByText('ルール設定')).toBeInTheDocument();
      expect(screen.getByText('システム設定')).toBeInTheDocument();
    });

    // Audio settings are hidden for future implementation
    it.skip('should render volume sliders with default values', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      expect(screen.getByText('効果音音量: 50%')).toBeInTheDocument();
      expect(screen.getByText('BGM音量: 30%')).toBeInTheDocument();
    });

    it('should render difficulty selector with default value', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const difficultySelect = screen.getByDisplayValue('中級 - 標準的な難易度');
      expect(difficultySelect).toBeInTheDocument();
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
      
      const languageSelect = screen.getByDisplayValue('日本語');
      expect(languageSelect).toBeInTheDocument();
    });

    it('should render player count selector with default value', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const playerCountSelect = screen.getByDisplayValue('4人');
      expect(playerCountSelect).toBeInTheDocument();
    });

    it('should render COM player count selector with default value', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const comPlayerCountSelect = screen.getByDisplayValue('0人（COMプレイヤーなし）');
      expect(comPlayerCountSelect).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    // Audio settings are hidden for future implementation
    it.skip('should update sound volume when slider is moved', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const soundSlider = screen.getAllByRole('slider')[0];
      fireEvent.change(soundSlider, { target: { value: '75' } });
      
      expect(screen.getByText('効果音音量: 75%')).toBeInTheDocument();
    });

    it.skip('should update music volume when slider is moved', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const musicSlider = screen.getAllByRole('slider')[1];
      fireEvent.change(musicSlider, { target: { value: '60' } });
      
      expect(screen.getByText('BGM音量: 60%')).toBeInTheDocument();
    });

    it('should update difficulty when selector is changed', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const difficultySelect = screen.getByDisplayValue('中級 - 標準的な難易度');
      fireEvent.change(difficultySelect, { target: { value: 'hard' } });
      
      expect(screen.getByDisplayValue('上級 - CPUが強く、ヒントが少ない')).toBeInTheDocument();
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
      
      const languageSelect = screen.getByDisplayValue('日本語');
      fireEvent.change(languageSelect, { target: { value: 'en' } });
      
      expect(screen.getByDisplayValue('English')).toBeInTheDocument();
    });

    it('should update player count when selector is changed', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const playerCountSelect = screen.getByDisplayValue('4人');
      fireEvent.change(playerCountSelect, { target: { value: '6' } });
      
      expect(screen.getByDisplayValue('6人')).toBeInTheDocument();
    });

    it('should update COM player count when selector is changed', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const comPlayerCountSelect = screen.getByDisplayValue('0人（COMプレイヤーなし）');
      fireEvent.change(comPlayerCountSelect, { target: { value: '2' } });
      
      expect(screen.getByDisplayValue('2人')).toBeInTheDocument();
    });

    it('should allow 0 COM players for single player mode', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Default is already 0 COM players
      expect(screen.getByDisplayValue('0人（COMプレイヤーなし）')).toBeInTheDocument();
      expect(screen.getByText('1人プレイモード（人間プレイヤーのみ）')).toBeInTheDocument();
    });

    it('should disable difficulty setting when COM players is 0', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Default is already 0 COM players, so difficulty should be disabled
      const difficultySelect = screen.getByDisplayValue('中級 - 標準的な難易度');
      expect(difficultySelect).toBeDisabled();
      expect(screen.getByText('1人プレイモードでは難易度設定は無効です')).toBeInTheDocument();
    });

    it('should adjust COM player count when total player count changes', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Initially 4 total players, 0 COM players
      expect(screen.getByDisplayValue('0人（COMプレイヤーなし）')).toBeInTheDocument();
      
      // Change total players to 3
      const playerCountSelect = screen.getByDisplayValue('4人');
      fireEvent.change(playerCountSelect, { target: { value: '3' } });
      
      // COM players should automatically adjust to 2 (3 - 1)
      expect(screen.getByDisplayValue('2人（1人プレイ）')).toBeInTheDocument();
    });
  });

  describe('Button Actions', () => {
    it('should call onBack when back button is clicked', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const backButton = screen.getByText('タイトルに戻る');
      fireEvent.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    // Game start button has been removed from the UI

    it('should save settings to localStorage when save button is clicked', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Change a non-audio setting (since audio controls are hidden)
      const difficultySelect = screen.getByDisplayValue('中級 - 標準的な難易度');
      fireEvent.change(difficultySelect, { target: { value: 'hard' } });
      
      const saveButton = screen.getByText('設定を保存');
      fireEvent.click(saveButton);
      
      // Check if settings were saved to localStorage
      const savedSettings = localStorage.getItem('qards4-settings');
      expect(savedSettings).toBeTruthy();
      
      const parsedSettings = JSON.parse(savedSettings!);
      expect(parsedSettings.difficulty).toBe('hard');
      expect(parsedSettings.playerCount).toBe(4); // Default value
      expect(parsedSettings.comPlayerCount).toBe(0); // Default value
      // Audio settings should still be preserved internally
      expect(parsedSettings.soundVolume).toBe(50); // Default value
      expect(parsedSettings.musicVolume).toBe(30); // Default value
      
      // Save button no longer calls onBack - it just saves settings
      expect(mockOnBack).toHaveBeenCalledTimes(0);
    });

    it('should reset all settings when reset button is clicked', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      // Change a non-audio setting (since audio controls are hidden)
      const difficultySelect = screen.getByDisplayValue('中級 - 標準的な難易度');
      fireEvent.change(difficultySelect, { target: { value: 'hard' } });
      
      // Reset settings
      const resetButton = screen.getByText('初期設定に戻す');
      fireEvent.click(resetButton);
      
      // Check if settings are back to defaults (audio settings are internal only)
      expect(screen.getByDisplayValue('中級 - 標準的な難易度')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4人')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0人（COMプレイヤーなし）')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply correct button colors', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const resetButton = screen.getByText('初期設定に戻す');
      const saveButton = screen.getByText('設定を保存');
      const backButton = screen.getByText('タイトルに戻る');
      
      expect(resetButton).toHaveClass('bg-red-600');
      expect(saveButton).toHaveClass('bg-green-600');
      expect(backButton).toHaveClass('bg-gray-600');
      // Game start button has been removed
    });

    it('should have hover effects on buttons', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const resetButton = screen.getByText('初期設定に戻す');
      expect(resetButton).toHaveClass('hover:bg-red-700');
    });

    it('should display hint description', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      expect(screen.getByText('有効にすると、配置可能な場所がハイライトされます')).toBeInTheDocument();
    });

    it('should display controlled hadamard description', () => {
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      expect(screen.getByText('制御アダマールゲートカードを使用可能にします')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined callbacks gracefully', () => {
      render(<SettingsScreen onBack={undefined as any} onStartGame={undefined as any} />);
      
      const backButton = screen.getByText('タイトルに戻る');
      
      expect(() => fireEvent.click(backButton)).not.toThrow();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      
      render(<SettingsScreen onBack={mockOnBack} onStartGame={mockOnStartGame} />);
      
      const saveButton = screen.getByText('設定を保存');
      
      expect(() => fireEvent.click(saveButton)).not.toThrow();
      
      // Restore original function
      localStorage.setItem = originalSetItem;
    });
  });
});