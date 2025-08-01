// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
'use client';

import React, { useState, useEffect } from 'react';
import { 
  initializeGame, 
  isValidPlay, 
  calculateMeasurementScore, 
  findPrecedingQubit,
  startControlTargetPlacement,
  completeControlTargetPlacement,
  cancelControlTargetPlacement,
  isValidTargetLane,
  determineWinner,
  canPlayUnitaryCard,
  incrementUnitaryCardCounter,
  resetUnitaryCardCounters,
  calculateHandPenalty,
  getGameEndReason,
  eliminatePlayer,
  getNextActivePlayer,
  shouldEliminatePlayer,
  checkGameEndConditions
} from '../game/gameLogic';
import { 
  hasInitialQubitCards, 
  skipPlayerInitialSelection,
  advanceInitialSelectionPlayer,
  isInitialSelectionComplete,
  completeInitialSelection
} from '../game/initialSelection';
import { Card, CardType, GameState } from '../game/types';
import { QuantumGameIntegration } from '../quantum';
import GameBoard from './GameBoard';
import PlayerHand from './PlayerHand';
import ConfirmationPopup from './ConfirmationPopup';

interface GameScreenProps {
  onBackToMenu?: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onBackToMenu }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);
  const [highlightedSlots, setHighlightedSlots] = useState<{laneIndex: number; position: number}[]>([]);
  const [selectedPlayerForHandView, setSelectedPlayerForHandView] = useState<string | null>(null);
  const [confirmationPopup, setConfirmationPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  });
  
  // Quantum computation integration
  const [quantumIntegration] = useState(() => new QuantumGameIntegration());

  // Load settings from localStorage
  const getSettings = () => {
    try {
      const settingsStr = localStorage.getItem('qards4-settings');
      return settingsStr ? JSON.parse(settingsStr) : {
        showHints: true,
        difficulty: 'normal',
        playerCount: 4,
        allowUnfinalizedMeasurement: false
      };
    } catch {
      return { showHints: true, difficulty: 'normal', playerCount: 4, allowUnfinalizedMeasurement: false };
    }
  };

  const [settings] = useState(getSettings());

  // Check if game is in progress (not initial state, has moves made)
  const isGameInProgress = () => {
    if (!gameState) return false;
    if (gameState.gamePhase === 'initial_selection') return true;
    
    // Check if any cards have been played (board has cards or players have different hand sizes)
    const hasCardsOnBoard = gameState.board.lane.some(lane => lane.some(card => card !== null));
    const hasDifferentHandSizes = gameState.players.some(player => player.hand.length !== gameState.players[0].hand.length);
    const hasScores = gameState.players.some(player => player.score > 0);
    const hasPasses = gameState.players.some(player => player.passes > 0);
    
    return hasCardsOnBoard || hasDifferentHandSizes || hasScores || hasPasses || gameState.turn > 1;
  };

  const showConfirmationPopup = (title: string, message: string, action: () => void) => {
    setConfirmationPopup({
      isOpen: true,
      title,
      message,
      action
    });
  };

  const closeConfirmationPopup = () => {
    setConfirmationPopup({
      isOpen: false,
      title: '',
      message: '',
      action: () => {}
    });
  };

  const advanceTurn = () => {
    // Don't advance turn if game has ended
    if (gameState?.gamePhase === 'game_ended') {
      return;
    }
    
    setGameState(prevGameState => {
      if (!prevGameState) return null;
      
      // Don't advance turn if game has ended
      if (prevGameState.gamePhase === 'game_ended') {
        return prevGameState;
      }

      const { players, currentPlayerId, turnDirection } = prevGameState;
      const numPlayers = players.length;
      const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);

      let nextPlayerIndex: number;
      if (turnDirection === 'forward') {
        nextPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
      } else {
        nextPlayerIndex = (currentPlayerIndex - 1 + numPlayers) % numPlayers;
      }
      
      const nextPlayerId = players[nextPlayerIndex].id;

      // Increment turn counter when the first player's turn comes around
      const shouldIncrementTurn = prevGameState.firstPlayerId && 
                                 nextPlayerId === prevGameState.firstPlayerId;

      let updatedGameState = {
        ...prevGameState,
        currentPlayerId: nextPlayerId,
        turn: shouldIncrementTurn ? prevGameState.turn + 1 : prevGameState.turn,
      };

      // Reset Unitary card counters when a full round is completed (new turn starts)
      if (shouldIncrementTurn) {
        updatedGameState = resetUnitaryCardCounters(updatedGameState);
      }

      return updatedGameState;
    });
  };

  const updateHighlightedSlots = (card: Card | null) => {
    if (!card || !gameState || !settings.showHints) {
      setHighlightedSlots([]);
      return;
    }

    const validSlots: {laneIndex: number; position: number}[] = [];
    
    // Special handling for initial qubit cards during initial phase
    if (isInitialPhase && card.type === CardType.INITIAL_QUBIT) {
      // Initial qubit cards can only be placed at position 0 of empty lanes
      gameState.board.lane.forEach((lane, laneIndex) => {
        if (lane.length === 0) {
          validSlots.push({ laneIndex, position: 0 });
        }
      });
    } else {
      // Check all possible positions for the selected card
      gameState.board.lane.forEach((lane, laneIndex) => {
        for (let position = 0; position <= lane.length; position++) {
          if (card.type === CardType.CONTROL) {
            // For control cards, check if slot is empty
            if (!lane[position]) {
              validSlots.push({ laneIndex, position });
            }
          } else if (isValidPlay(card, laneIndex, position, gameState.board, settings.allowUnfinalizedMeasurement)) {
            validSlots.push({ laneIndex, position });
          }
        }
      });
    }

    setHighlightedSlots(validSlots);

    // Show measurement card score hints
    if (card.type === CardType.MEASUREMENT && validSlots.length > 0) {
      const scoreHints: string[] = [];
      validSlots.forEach(({laneIndex, position}) => {
        const lane = gameState.board.lane[laneIndex];
        const precedingQubit = findPrecedingQubit(lane, position);
        if (precedingQubit) {
          const score = calculateMeasurementScore(precedingQubit.value, card.value);
          const scoreText = score === 5 ? '測定結果1(+5)' : '測定結果0(+3)';
          scoreHints.push(`レーン${laneIndex + 1}: ${scoreText}`);
        }
      });
      if (scoreHints.length > 0) {
        setMessage(`測定カードヒント: ${scoreHints.join(', ')}`);
      }
    }
    
    // Show initial qubit card hints
    if (isInitialPhase && card.type === CardType.INITIAL_QUBIT && validSlots.length > 0) {
      setMessage(`初期量子ビットカード: 空のレーンの左端に配置してください（${validSlots.length}箇所利用可能）`);
    }
  };

  const handleCardSelect = (card: Card) => {
    // Disable card selection when game is ended
    if (gameState?.gamePhase === 'game_ended') {
      showTemporaryMessage('ゲームは終了しています。カードを選択することはできません。');
      return;
    }
    
    if (gameState?.controlTargetPlacement?.waitingForTarget) {
      setMessage('制御カードの配置を完了するか、キャンセルしてください。');
      return;
    }
    
    // Check Unitary card restriction
    if (card.type === CardType.UNITARY && gameState && !canPlayUnitaryCard(gameState, gameState.currentPlayerId)) {
      setMessage('このターンではすでにUカードを使用しているため、追加のUカードは使用できません。');
      return;
    }
    
    const newSelectedCard = selectedCard?.id === card.id ? null : card;
    setSelectedCard(newSelectedCard);
    updateHighlightedSlots(newSelectedCard);
    setMessage(null);
  };

  const showTemporaryMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const animateCardPlacement = (cardId: string) => {
    setAnimatingCard(cardId);
    const duration = 500; // Fixed animation duration
    setTimeout(() => setAnimatingCard(null), duration);
  };

  // Skip current player in initial selection if they have no initial cards
  const handleSkipInitialPlayer = () => {
    if (!gameState || gameState.gamePhase !== 'initial_selection' || !gameState.initialSelection) {
      showTemporaryMessage('スキップできません：初期配置フェーズではありません。');
      return;
    }

    const currentPlayerIndex = gameState.initialSelection.currentPlayerIndex;
    const currentPlayer = gameState.players[currentPlayerIndex];
    
    // Skip this player
    let newState = skipPlayerInitialSelection(gameState, currentPlayer.id);
    
    if (isInitialSelectionComplete(newState)) {
      newState = completeInitialSelection(newState);
      showTemporaryMessage('初期配置完了！ゲーム開始です');
    } else {
      newState = advanceInitialSelectionPlayer(newState);
    }
    
    setGameState(newState);
  };



  const handleCardSlotClick = (laneIndex: number, position: number) => {
    if (!gameState) return;
    
    // Disable card placement when game is ended
    if (gameState.gamePhase === 'game_ended') {
      showTemporaryMessage('ゲームは終了しています。カードを配置することはできません。');
      return;
    }

    // Handle target placement for control-target cards
    if (gameState.controlTargetPlacement?.waitingForTarget) {
      if (isValidTargetLane(gameState, laneIndex)) {
        try {
          const updatedGameState = completeControlTargetPlacement(gameState, laneIndex);
          animateCardPlacement(gameState.controlTargetPlacement.controlCard.id);
          setGameState(updatedGameState);
          showTemporaryMessage('制御ゲートを配置しました。');
          advanceTurn();
        } catch {
          showTemporaryMessage('制御ゲートの配置に失敗しました。');
          setGameState(cancelControlTargetPlacement(gameState));
        }
      } else {
        showTemporaryMessage('そのレーンには配置できません。隣接レーンを選択してください。');
      }
      setHighlightedSlots([]);
      return;
    }

    // Handle normal card placement
    if (selectedCard) {
      if (selectedCard.type === CardType.CONTROL) {
        if (gameState?.board.lane[laneIndex]?.[position]) {
          showTemporaryMessage('制御カードは空のスロットに配置してください。');
          return;
        }
        try {
          const updatedGameState = startControlTargetPlacement(gameState, selectedCard, laneIndex, position);
          setGameState(updatedGameState);
          setSelectedCard(null);
          
          // Highlight valid target lanes
          const validTargetLanes: {laneIndex: number; position: number}[] = [];
          if (laneIndex > 0) {
            validTargetLanes.push({ laneIndex: laneIndex - 1, position: position });
          }
          if (laneIndex < gameState.board.lane.length - 1) {
            validTargetLanes.push({ laneIndex: laneIndex + 1, position: position });
          }
          setHighlightedSlots(validTargetLanes);
          
          showTemporaryMessage('制御カードを配置しました。隣接するレーンでターゲット位置を選択してください。');
          return; // Prevent fall-through to normal card placement logic
        } catch (error) {
          if (error instanceof Error && error.message.includes('gaps detected')) {
            showTemporaryMessage('制御カードの前の位置にカードがない場合は配置できません。');
          } else {
            showTemporaryMessage('制御カードの配置に失敗しました。');
          }
          return;
        }
      }

      // Special validation for initial qubit cards during initial phase
      if (isInitialPhase && selectedCard.type === CardType.INITIAL_QUBIT) {
        // Initial qubit cards can only be placed at position 0
        if (position !== 0) {
          showTemporaryMessage('初期量子ビットカードは各レーンの左端（位置0）にのみ配置できます。');
          return;
        }
        
        // The target lane must be empty
        if (gameState.board.lane[laneIndex].length > 0) {
          showTemporaryMessage('このレーンは既にカードが配置されています。空のレーンを選択してください。');
          return;
        }
        
        // Only allow placement by the current initial selection player
        const currentInitialPlayerIndex = gameState.initialSelection?.currentPlayerIndex || 0;
        const currentInitialPlayer = gameState.players[currentInitialPlayerIndex];
        
        // Check if the current player is the one who should be placing initial cards
        if (gameState.currentPlayerId !== currentInitialPlayer.id) {
          showTemporaryMessage('現在の初期配置プレイヤーのみがカードを配置できます。');
          return;
        }
      } else if (!gameState || !isValidPlay(selectedCard, laneIndex, position, gameState.board, settings.allowUnfinalizedMeasurement)) {
        showTemporaryMessage('そのカードはそのレーンに配置できません。');
        return;
      }

      const playedCardType = selectedCard.type;
      const currentPlayerId = gameState.currentPlayerId;

      animateCardPlacement(selectedCard.id);

      setGameState(prev => {
        if (!prev) return null;
        const newPlayers = prev.players.map(p =>
          p.id === currentPlayerId ? { ...p, hand: p.hand.filter(c => c.id !== selectedCard.id) } : p
        );
        const newBoard = { ...prev.board };
        const newLane = [...newBoard.lane[laneIndex]];

        // Check what card is being replaced (for TARGET card logic)
        const existingCard = newLane[position] || null;

        while (newLane.length < position) {
          newLane.push(null);
        }
        newLane[position] = selectedCard;
        newBoard.lane[laneIndex] = newLane;

        let newTurnDirection = prev.turnDirection;
        let newMeasurementCount = prev.measurementCount;
        let newGamePhase = prev.gamePhase; // Start with current game phase
        let playersWithUpdatedScore = newPlayers;

        // Check for hand empty victory condition
        const currentPlayer = newPlayers.find(p => p.id === currentPlayerId);
        if (currentPlayer && currentPlayer.hand.length === 0) {
          newGamePhase = 'game_ended';
        }

        // UNITARY card effect: reverse turn direction and increment counter
        // GATE card on TARGET: does NOT reverse turn direction
        let updatedGameState = prev;
        if (playedCardType === CardType.UNITARY) {
          newTurnDirection = prev.turnDirection === 'forward' ? 'backward' : 'forward';
          // Increment Unitary card counter for current player
          updatedGameState = incrementUnitaryCardCounter(prev, currentPlayerId);
        } else if (playedCardType === CardType.GATE && existingCard?.type === CardType.TARGET) {
          // GATE placed on TARGET card - no turn reversal
          // This is the special case mentioned in requirements
        } else if (playedCardType === CardType.MEASUREMENT) {
          newMeasurementCount++;
          
          // Try quantum computation first, fallback to classical if not available
          let scoreGained = 1; // Default score
          let quantumComputationUsed = false;
          
          if (quantumIntegration.isQuantumComputationAvailable(prev, laneIndex)) {
            try {
              // Execute quantum computation asynchronously
              quantumIntegration.executeMeasurementComputation(
                prev, 
                selectedCard, 
                laneIndex, 
                position
              ).then(result => {
                if (result) {
                  console.log('✅ Quantum computation completed successfully');
                  quantumComputationUsed = true;
                  // The result is logged in the integration layer
                }
              }).catch(error => {
                console.warn('⚠️ Quantum computation failed, using classical fallback:', error);
              });
            } catch (error) {
              console.warn('⚠️ Quantum computation setup failed:', error);
            }
          }
          
          // Classical fallback calculation (always executed for game consistency)
          const lane = newBoard.lane[laneIndex];
          const precedingQubit = findPrecedingQubit(lane, position);
          
          if (precedingQubit) {
            scoreGained = calculateMeasurementScore(precedingQubit.value, selectedCard.value);
          }
          
          playersWithUpdatedScore = newPlayers.map(p =>
            p.id === currentPlayerId ? { ...p, score: p.score + scoreGained } : p
          );
          
          // Store the score and computation info for the message
          (selectedCard as Card & { measurementScore?: number; quantumComputationUsed?: boolean }).measurementScore = scoreGained;
          (selectedCard as Card & { measurementScore?: number; quantumComputationUsed?: boolean }).quantumComputationUsed = quantumComputationUsed;
          
          if (newMeasurementCount >= 11) newGamePhase = 'game_ended';
        }
        
        // Handle initial phase turn progression
        if (isInitialPhase && playedCardType === CardType.INITIAL_QUBIT) {
          // Update firstPlayerCandidates if a |1⟩ card was placed
          const firstPlayerCandidates = [...(updatedGameState.initialSelection?.firstPlayerCandidates || [])];
          if (selectedCard.value === '|1⟩' && !firstPlayerCandidates.includes(currentPlayerId)) {
            firstPlayerCandidates.push(currentPlayerId);
          }
          
          // Check if current player has any more initial qubit cards
          const currentPlayer = newPlayers.find(p => p.id === currentPlayerId);
          const hasMoreInitialCards = currentPlayer ? hasInitialQubitCards(currentPlayer) : false;
          
          if (!hasMoreInitialCards) {
            // Mark this player as completed
            const playerIndex = updatedGameState.players.findIndex(p => p.id === currentPlayerId);
            const newPlayersCompleted = [...(updatedGameState.initialSelection?.playersCompleted || [])];
            newPlayersCompleted[playerIndex] = true;
            const phaseComplete = newPlayersCompleted.every(completed => completed);
            
            // Check if we should complete initial selection or advance player
            if (phaseComplete) {
              // Make sure the gameState has the updated firstPlayerCandidates before completing
              const stateWithUpdatedCandidates = {
                ...updatedGameState,
                initialSelection: {
                  ...updatedGameState.initialSelection!,
                  playersCompleted: newPlayersCompleted,
                  firstPlayerCandidates,
                  phaseComplete
                }
              };
              updatedGameState = completeInitialSelection(stateWithUpdatedCandidates);
              setTimeout(() => showTemporaryMessage('初期配置完了！ゲーム開始です'), 0);
            } else {
              // Update initial selection state and advance player
              updatedGameState.initialSelection = {
                ...updatedGameState.initialSelection!,
                playersCompleted: newPlayersCompleted,
                firstPlayerCandidates,
                phaseComplete
              };
              updatedGameState = advanceInitialSelectionPlayer(updatedGameState);
            }
          } else {
            // Player still has initial cards, just update firstPlayerCandidates but DON'T advance
            updatedGameState.initialSelection = {
              ...updatedGameState.initialSelection!,
              firstPlayerCandidates
            };
            // Don't advance turn - let the player place more cards
          }
        }

        // Update newGamePhase if it was changed by initial selection completion
        newGamePhase = updatedGameState.gamePhase;

        return { 
          ...updatedGameState, 
          players: playersWithUpdatedScore, 
          board: newBoard, 
          turnDirection: newTurnDirection, 
          measurementCount: newMeasurementCount, 
          gamePhase: newGamePhase // Use newGamePhase which may be updated by measurement completion or initial selection completion
        };
      });

      setSelectedCard(null);
      setHighlightedSlots([]);

      // Handle initial qubit card placement message
      if (isInitialPhase && playedCardType === CardType.INITIAL_QUBIT) {
        if (selectedCard.value === '|1⟩') {
          showTemporaryMessage(`初期量子ビットカード ${selectedCard.value} を配置しました。あなたからゲームがスタートします！`);
        } else {
          showTemporaryMessage(`初期量子ビットカード ${selectedCard.value} を配置しました。`);
        }
        return;
      }

      // Check if GATE was placed on TARGET card (using the existingCard from before state update)
      const existingCardBeforePlacement = gameState?.board.lane[laneIndex]?.[position] || null;
      const placedOnTarget = playedCardType === CardType.GATE && 
                           existingCardBeforePlacement?.type === CardType.TARGET;

      if (playedCardType === CardType.UNITARY) {
        showTemporaryMessage('ユニタリカードの効果で、もう一度あなたのターンです。プレイ順が逆転しました。');
      } else if (playedCardType === CardType.GATE && placedOnTarget) {
        showTemporaryMessage('ゲートカードをターゲットカードに配置しました。ターン順は変わりません。');
        advanceTurn();
      } else if (playedCardType === CardType.MEASUREMENT) {
        const measurementScore = (selectedCard as Card & { measurementScore?: number }).measurementScore || 1;
        const quantumUsed = (selectedCard as Card & { quantumComputationUsed?: boolean }).quantumComputationUsed || false;
        const compatibilityMessage = measurementScore === 5 ? ' (測定結果1!)' : ' (測定結果0)';
        const computationMessage = quantumUsed ? ' 🔬' : '';
        showTemporaryMessage(`測定しました。+${measurementScore}点を獲得${compatibilityMessage}${computationMessage}`);
        advanceTurn();
      } else {
        advanceTurn();
      }
      return;
    }

    if (!selectedCard && !gameState?.controlTargetPlacement?.waitingForTarget) {
      showTemporaryMessage('先に手札からカードを選択してください。');
    }
  };

  const handlePass = () => {
    // Disable pass when game is ended
    if (gameState?.gamePhase === 'game_ended') {
      showTemporaryMessage('ゲームは終了しています。パスすることはできません。');
      return;
    }
    
    setGameState(prevGameState => {
      if (!prevGameState) return null;

      const currentPlayer = prevGameState.players.find(p => p.id === prevGameState.currentPlayerId);
      if (!currentPlayer) return prevGameState;

      // Update pass count for current player
      const updatedPlayers = prevGameState.players.map(player => {
        if (player.id === prevGameState.currentPlayerId) {
          const newPasses = player.passes + 1;
          return { ...player, passes: newPasses };
        }
        return player;
      });

      let newGameState = {
        ...prevGameState,
        players: updatedPlayers,
      };

      // Check if current player should be eliminated (4 passes)
      const updatedCurrentPlayer = updatedPlayers.find(p => p.id === prevGameState.currentPlayerId);
      if (updatedCurrentPlayer && shouldEliminatePlayer(updatedCurrentPlayer)) {
        newGameState = eliminatePlayer(newGameState, prevGameState.currentPlayerId);
        showTemporaryMessage(`${updatedCurrentPlayer.name} が4回パスして脱落しました。`);
      } else {
        showTemporaryMessage('パスしました。');
      }

      // Check if game should end
      const shouldEndGame = checkGameEndConditions(newGameState);
      const newGamePhase = shouldEndGame ? 'game_ended' : newGameState.gamePhase;

      // Get next active player
      const nextPlayerId = getNextActivePlayer(newGameState, prevGameState.currentPlayerId);
      
      return {
        ...newGameState,
        gamePhase: newGamePhase,
        currentPlayerId: nextPlayerId || prevGameState.currentPlayerId,
      };
    });
    
    advanceTurn();
  };

  const handleCancelAction = () => {
    setSelectedCard(null);
    if (gameState?.controlTargetPlacement?.waitingForTarget) {
      setGameState(cancelControlTargetPlacement(gameState));
    }
    setHighlightedSlots([]);
    setMessage(null);
  };

  const handlePlayerClick = (playerId: string) => {
    // Only allow player selection when game is in ended phase
    if (gameState?.gamePhase === 'game_ended') {
      setSelectedPlayerForHandView(playerId);
    }
  };

  // Set default selected player when game ends and clear selected card
  React.useEffect(() => {
    if (gameState?.gamePhase === 'game_ended') {
      // Clear any selected card when game ends
      setSelectedCard(null);
      setHighlightedSlots([]);
      setMessage(null);
      
      // Set default selected player for hand viewing
      if (!selectedPlayerForHandView) {
        setSelectedPlayerForHandView(gameState.currentPlayerId);
      }
    }
  }, [gameState?.gamePhase, selectedPlayerForHandView, gameState?.currentPlayerId]);

  const handleNewGame = () => {
    if (isGameInProgress()) {
      showConfirmationPopup(
        'ゲームを終了しますか？',
        '現在のゲームを終了して新しいゲームを開始します。進行中のゲームは失われます。',
        () => {
          startNewGame();
          closeConfirmationPopup();
        }
      );
    } else {
      startNewGame();
    }
  };

  const startNewGame = () => {
    try {
      const playerCount = settings.playerCount || 4;
      const playerNames = [];
      for (let i = 0; i < playerCount; i++) {
        playerNames.push(`プレイヤー${String.fromCharCode(65 + i)}`); // A, B, C, D, E, F
      }
      
      const initialGameState = initializeGame(playerNames);
      setGameState(initialGameState);
      setSelectedCard(null);
      setHighlightedSlots([]);
      setMessage(null);
      setShowMenu(false);
      setSelectedPlayerForHandView(null); // Reset selected player for hand view
      showTemporaryMessage(`${playerCount}人で新しいゲームを開始しました。`);
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setError(err instanceof Error ? err.message : 'ゲームの初期化に失敗しました。');
    }
  };

  const handleBackToMenu = () => {
    if (isGameInProgress()) {
      showConfirmationPopup(
        'メインメニューに戻りますか？',
        '現在のゲームを終了してメインメニューに戻ります。進行中のゲームは失われます。',
        () => {
          if (onBackToMenu) {
            onBackToMenu();
          }
          closeConfirmationPopup();
        }
      );
    } else {
      if (onBackToMenu) {
        onBackToMenu();
      }
    }
  };


  useEffect(() => {
    try {
      const playerCount = settings.playerCount || 4;
      const playerNames = [];
      for (let i = 0; i < playerCount; i++) {
        playerNames.push(`プレイヤー${String.fromCharCode(65 + i)}`); // A, B, C, D, E, F
      }
      
      const initialGameState = initializeGame(playerNames);
      setGameState(initialGameState);
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setError(err instanceof Error ? err.message : 'ゲームの初期化に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [settings.playerCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-2xl">ゲームをロード中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-800 to-red-900 text-white">
        <div className="text-center bg-black bg-opacity-50 p-8 rounded-lg">
          <p className="text-2xl mb-4">エラー: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <p className="text-2xl">ゲーム状態が利用できません。</p>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(player => player.id === gameState.currentPlayerId);

  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-800 to-red-900 text-white">
        <p className="text-2xl">現在のプレイヤーが見つかりません。</p>
      </div>
    );
  }


  // Check if we're in initial selection phase for UI adjustments
  const isInitialPhase = gameState.gamePhase === 'initial_selection';
  const isEndPhase = gameState.gamePhase === 'game_ended';
  const currentPlayerIndex = isInitialPhase ? (gameState.initialSelection?.currentPlayerIndex || 0) : 0;
  const activeInitialPlayer = isInitialPhase ? gameState.players[currentPlayerIndex] : null;
  const hasInitialCards = activeInitialPlayer ? hasInitialQubitCards(activeInitialPlayer) : false;
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white relative">
      {/* Header with game controls */}
      <header className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-gray-600 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              量子ゲート並べ
            </h1>
            <div className="flex items-center gap-2 text-sm">
              {isInitialPhase ? (
                <>
                  <span className="bg-green-600 px-2 py-1 rounded">初期配置</span>
                  <span className="bg-blue-600 px-2 py-1 rounded">
                    {currentPlayerIndex + 1}/{gameState.players.length}
                  </span>
                </>
              ) : isEndPhase ? (
                <>
                  <span className="bg-red-600 px-2 py-1 rounded">ゲーム終了</span>
                </>
              ) : (
                <>
                  <span className="bg-blue-600 px-2 py-1 rounded">ターン {gameState.turn}</span>
                  <span className="bg-purple-600 px-2 py-1 rounded">測定 {gameState.measurementCount}/11</span>
                  {gameState.turnDirection === 'backward' && (
                    <span className="bg-orange-600 px-2 py-1 rounded">逆順</span>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {(selectedCard || gameState?.controlTargetPlacement?.waitingForTarget) && !isInitialPhase && (
              <button
                onClick={handleCancelAction}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300"
              >
                キャンセル
              </button>
            )}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-300"
            >
              メニュー
            </button>
          </div>
        </div>
      </header>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="absolute top-16 right-4 bg-black bg-opacity-90 border border-gray-600 rounded-lg p-4 z-50">
          <div className="flex flex-col gap-2">
            <button
              onClick={handleNewGame}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300 text-left"
            >
              新しいゲーム
            </button>
            {onBackToMenu && (
              <button
                onClick={handleBackToMenu}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-300 text-left"
              >
                メインメニューに戻る
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left sidebar: All players */}
        <aside className="lg:w-64 bg-black bg-opacity-20 p-4">
          <h2 className="text-lg font-semibold mb-4">プレイヤー状況</h2>
          {gameState.gamePhase === 'game_ended' && (
            <p className="text-xs text-gray-400 mb-3">
              💡クリックで手札を確認できます (ゲーム終了済み)
            </p>
          )}
          {gameState.gamePhase !== 'game_ended' && (
            <p className="text-xs text-red-400 mb-3">
              🔒 ゲーム中 (クリック無効)
            </p>
          )}
          <div className="space-y-4">
            {gameState.players.map((player) => (
              <div 
                key={player.id} 
                onClick={() => handlePlayerClick(player.id)}
                style={{ 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
                className={`rounded-lg p-3 border transition-all duration-300 cursor-pointer hover:bg-gray-700 hover:border-gray-500 ${
                  player.eliminated
                    ? 'bg-red-900 bg-opacity-30 border-red-600 opacity-60'
                    : player.id === gameState.currentPlayerId 
                      ? 'bg-blue-700 bg-opacity-60 border-blue-400 shadow-lg' 
                      : 'bg-gray-800 bg-opacity-50 border-gray-600'
                } ${
                  gameState.gamePhase === 'game_ended' && selectedPlayerForHandView === player.id
                    ? 'ring-2 ring-yellow-400 bg-yellow-900 bg-opacity-30'
                    : ''
                }`}
              >
                <p className="font-semibold text-lg flex items-center gap-2">
                  {player.name}
                  {player.eliminated && (
                    <span className="text-xs bg-red-600 px-2 py-1 rounded">脱落</span>
                  )}
                  {!player.eliminated && player.id === gameState.currentPlayerId && (
                    <span className="text-xs bg-blue-500 px-2 py-1 rounded">現在のターン</span>
                  )}
                </p>
                <div className="text-sm space-y-1">
                  <p>手札: <span className="font-mono">{player.hand.length}枚</span></p>
                  <p>パス: <span className="font-mono">{player.passes}/4回</span></p>
                  <p>得点: <span className="font-mono text-green-400">{player.score}点</span></p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main game area */}
        <main className="flex-1 flex flex-col">
          {/* Game board */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
              <GameBoard 
                board={gameState.board} 
                onCardSlotClick={handleCardSlotClick}
                highlightedSlots={highlightedSlots}
                animatingCard={animatingCard}
                playerCount={gameState.players.length}
                gameEnded={gameState.gamePhase === 'game_ended'}
              />
            </div>
          </div>

          {/* Bottom section: Current player */}
          <section className="bg-black bg-opacity-30 border-t border-gray-600 p-4">
            {/* Game status messages */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-4 mb-2">
                {isInitialPhase ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xl font-bold">
                      現在のプレイヤー: <span className="text-green-400">{activeInitialPlayer?.name}</span>
                    </p>
                    <div className="flex items-center gap-4">
                      {hasInitialCards ? (
                        <span className="text-lg text-green-300">
                          初期量子ビットカードを配置してください
                        </span>
                      ) : (
                        <span className="text-lg text-yellow-300">
                          初期量子ビットカードがありません - スキップ
                        </span>
                      )}
                    </div>
                    {/* Initial phase progress indicator */}
                    {gameState.initialSelection && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">進行状況:</span>
                        {gameState.players.map((player, index) => (
                          <div
                            key={player.id}
                            className={`w-3 h-3 rounded-full ${
                              gameState.initialSelection?.playersCompleted[index]
                                ? 'bg-green-500'
                                : index === currentPlayerIndex
                                ? 'bg-blue-500'
                                : 'bg-gray-500'
                            }`}
                            title={player.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-xl font-bold">
                      現在のプレイヤー: <span className="text-blue-400">{currentPlayer.name}</span>
                    </p>
                    {gameState.gamePhase === 'game_ended' && (
                      <div className="flex flex-col items-center gap-2">
                        <span className="bg-red-600 px-4 py-2 rounded-lg text-xl font-bold animate-pulse">
                          ゲーム終了！
                        </span>
                        {(() => {
                          const { winner, finalScores } = determineWinner(gameState);
                          const endReason = getGameEndReason(gameState);
                          
                          const getEndReasonMessage = (reason: string): string => {
                            switch (reason) {
                              case 'measurement_limit':
                                return '測定回数上限に達しました（11回）';
                              case 'insufficient_players':
                                return 'アクティブなプレイヤーが1人以下になりました';
                              case 'all_active_players_pass':
                                return '全アクティブプレイヤーが3回以上パスしました';
                              case 'empty_hand':
                                return 'プレイヤーの手札が空になりました';
                              default:
                                return 'ゲーム終了';
                            }
                          };
                          
                          return (
                            <div className="bg-black bg-opacity-80 rounded-lg p-4 text-center">
                              <div className="text-sm text-gray-400 mb-2">
                                {getEndReasonMessage(endReason)}
                              </div>
                              <div className="text-2xl font-bold text-yellow-400 mb-2">
                                🏆 勝者: {winner.name}
                              </div>
                              <div className="text-lg mb-2">
                                最終スコア: {finalScores.find(s => s.player.id === winner.id)?.finalScore}点
                              </div>
                              <div className="text-sm text-gray-300">
                                <div className="grid grid-cols-1 gap-1">
                                  {finalScores.map(({ player, finalScore }) => {
                                    const penalty = calculateHandPenalty(player.hand);
                                    return (
                                      <div key={player.id} className={`flex justify-between ${player.id === winner.id ? 'text-yellow-400 font-bold' : ''}`}>
                                        <span>{player.name}:</span>
                                        <span>{player.score}点 - {penalty}点 = {finalScore}点</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {message && (
                <div className={`p-3 rounded-lg text-center transition-all duration-300 ${
                  message.includes('エラー') || message.includes('できません') 
                    ? 'bg-red-600 bg-opacity-80' 
                    : message.includes('獲得') || message.includes('配置しました')
                    ? 'bg-green-600 bg-opacity-80'
                    : 'bg-blue-600 bg-opacity-80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span>{message}</span>
                    {gameState?.controlTargetPlacement?.waitingForTarget && (
                      <button
                        onClick={() => {
                          if (gameState) {
                            setGameState(cancelControlTargetPlacement(gameState));
                            setHighlightedSlots([]);
                            setMessage(null);
                          }
                        }}
                        className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                      >
                        キャンセル
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Player hand and controls / Initial placement controls */}
            <div className="flex flex-col items-center gap-4">
              {isInitialPhase ? (
                <div className="flex flex-col items-center gap-4">
                  {/* Show current player's hand with initial cards */}
                  {activeInitialPlayer && (
                    <PlayerHand
                      hand={activeInitialPlayer.hand}
                      playerName={activeInitialPlayer.name}
                      isCurrentPlayer={true}
                      onCardClick={handleCardSelect}
                      selectedCard={selectedCard}
                    />
                  )}
                  
                  {/* Initial placement instructions and skip button */}
                  <div className="flex flex-col items-center gap-4">
                    {!hasInitialCards && (
                      <div className="flex gap-4">
                        <button
                          onClick={handleSkipInitialPlayer}
                          className="px-8 py-4 text-xl font-bold rounded-lg shadow-lg transition duration-300 bg-gray-600 hover:bg-gray-700 text-white"
                        >
                          スキップ
                        </button>
                      </div>
                    )}
                    
                    {/* Show instruction */}
                    <div className="text-sm text-gray-400 text-center max-w-md">
                      {hasInitialCards 
                        ? '初期量子ビットカードを手札から選択して、空のレーンの左端（位置0）に配置してください'
                        : 'このプレイヤーは初期量子ビットカードを持っていません'
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {(() => {
                    // Determine which player's hand to show
                    let playerToShow = currentPlayer;
                    let isShowingCurrentPlayer = true;
                    
                    if (gameState.gamePhase === 'game_ended') {
                      if (selectedPlayerForHandView) {
                        const selectedPlayer = gameState.players.find(p => p.id === selectedPlayerForHandView);
                        if (selectedPlayer) {
                          playerToShow = selectedPlayer;
                          isShowingCurrentPlayer = false; // Always false during game end
                        }
                      } else {
                        // If no player selected yet, show current player
                        playerToShow = currentPlayer;
                        isShowingCurrentPlayer = false; // Always false during game end
                      }
                    }
                    
                    return (
                      <div>
                        <PlayerHand
                          hand={playerToShow.hand}
                          playerName={playerToShow.name}
                          isCurrentPlayer={gameState.gamePhase !== 'game_ended' && isShowingCurrentPlayer}
                          onCardClick={gameState.gamePhase === 'game_ended' ? () => {} : handleCardSelect}
                          selectedCard={gameState.gamePhase === 'game_ended' ? null : selectedCard}
                        />
                      </div>
                    );
                  })()}
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handlePass}
                      disabled={gameState.gamePhase === 'game_ended'}
                      className={`px-6 py-3 text-lg rounded-lg shadow-lg transition duration-300 ${
                        gameState.gamePhase === 'game_ended' 
                          ? 'bg-gray-500 cursor-not-allowed' 
                          : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      }`}
                    >
                      パス ({currentPlayer.passes}/4)
                    </button>
                    
                    {settings.showHints && (
                      <div className="text-sm text-gray-400 flex items-center">
                        💡 ヒント: {selectedCard ? '配置可能な場所が光っています' : 'カードを選択してください'}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={confirmationPopup.isOpen}
        title={confirmationPopup.title}
        message={confirmationPopup.message}
        confirmText="はい"
        cancelText="いいえ"
        onConfirm={confirmationPopup.action}
        onCancel={closeConfirmationPopup}
        confirmButtonColor="red"
      />
    </div>
  );
};

export default GameScreen;