'use client';

import React, { useState, useEffect } from 'react';
import { initializeGame, isValidPlay, isValidControlCardPlay } from '../game/gameLogic';
import { Card, CardType, GameState } from '../game/types';
import GameBoard from './GameBoard';
import PlayerHand from './PlayerHand';

const GameScreen: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [controlCardPlacementState, setControlCardPlacementState] = useState<{ card: Card; controlLaneIndex: number; position: number; } | null>(null); // For Control card placement
  const [message, setMessage] = useState<string | null>(null); // For user feedback

  const advanceTurn = () => {
    setGameState(prevGameState => {
      if (!prevGameState) return null;

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

      return {
        ...prevGameState,
        currentPlayerId: nextPlayerId,
        turn: prevGameState.turn + 1,
      };
    });
  };

  const handleCardSelect = (card: Card) => {
    if (controlCardPlacementState) {
      // If in the middle of placing a control card, don't allow selecting another card.
      setMessage('制御カードの配置を完了するか、キャンセルしてください。');
      return;
    }
    setSelectedCard(card);
    setMessage(null);
  };

  const handleCardSlotClick = (laneIndex: number, position: number) => {
    // If we are in the middle of placing a control card, this click is for the TARGET.
    if (controlCardPlacementState) {
      const { card: controlCard, controlLaneIndex, position: controlPosition } = controlCardPlacementState;

      // The target click must be on a different lane but the same column index.
      if (laneIndex === controlLaneIndex || position !== controlPosition) {
        setMessage('ターゲットは制御カードと同じ列の隣接レーンにある必要があります。');
        setControlCardPlacementState(null); // Cancel the placement
        return;
      }

      if (!gameState) {
        setControlCardPlacementState(null);
        return;
      }

      // Validate and place the control card
      if (isValidControlCardPlay(controlLaneIndex, laneIndex, controlPosition, gameState.board)) {
        const linkedControlCard: Card = { ...controlCard, controlLink: { targetLaneIndex: laneIndex } };
        setGameState(prev => {
          if (!prev) return null;
          const newPlayers = prev.players.map(p =>
            p.id === prev.currentPlayerId ? { ...p, hand: p.hand.filter(c => c.id !== controlCard.id) } : p
          );
          const newBoard = { ...prev.board };
          const newLane = [...newBoard.lane[controlLaneIndex]];
          // Ensure lane is long enough before placing
          while (newLane.length <= controlPosition) {
            newLane.push(null);
          }
          newLane[controlPosition] = linkedControlCard;
          newBoard.lane[controlLaneIndex] = newLane;
          return { ...prev, players: newPlayers, board: newBoard };
        });
        setMessage('制御カードを配置しました。');
        advanceTurn();
      } else {
        setMessage('そのターゲットレーンには配置できません。');
      }
      setControlCardPlacementState(null); // Always reset state after the attempt
      return;
    }

    // If no control card is being placed, this click is for a card selected from the hand.
    if (selectedCard) {
      // If the selected card is a control card, this is the FIRST step: picking an empty slot.
      if (selectedCard.type === CardType.CONTROL) {
        if (gameState?.board.lane[laneIndex]?.[position]) {
          setMessage('制御カードは空のスロットに配置してください。');
          return;
        }
        setControlCardPlacementState({ card: selectedCard, controlLaneIndex: laneIndex, position });
        setSelectedCard(null);
        setMessage(`制御スロットを選択しました。隣接するレーンの同じ列にあるターゲットカードを選択してください。`);
        return;
      }

      // Otherwise, it's a normal card placement.
      if (!gameState || !isValidPlay(selectedCard, laneIndex, position, gameState.board)) {
        setMessage('そのカードはそのレーンに配置できません。');
        return;
      }

      const playedCardType = selectedCard.type;
      const currentPlayerId = gameState.currentPlayerId;

      setGameState(prev => {
        if (!prev) return null;
        const newPlayers = prev.players.map(p =>
          p.id === currentPlayerId ? { ...p, hand: p.hand.filter(c => c.id !== selectedCard.id) } : p
        );
        const newBoard = { ...prev.board };
        const newLane = [...newBoard.lane[laneIndex]];

        // Ensure the lane is long enough, filling with nulls if necessary.
        while (newLane.length < position) {
          newLane.push(null);
        }
        // Place card by replacing (if card exists) or setting the specific index.
        newLane[position] = selectedCard;
        newBoard.lane[laneIndex] = newLane;

        let newTurnDirection = prev.turnDirection;
        let newMeasurementCount = prev.measurementCount;
        let gameEnded = prev.gameEnded;
        let playersWithUpdatedScore = newPlayers;

        if (playedCardType === CardType.UNITARY) {
          newTurnDirection = prev.turnDirection === 'forward' ? 'backward' : 'forward';
        } else if (playedCardType === CardType.MEASUREMENT) {
          newMeasurementCount++;
          const scoreGained = 1;
          playersWithUpdatedScore = newPlayers.map(p =>
            p.id === currentPlayerId ? { ...p, score: p.score + scoreGained } : p
          );
          if (newMeasurementCount >= 10) gameEnded = true;
        }
        return { ...prev, players: playersWithUpdatedScore, board: newBoard, turnDirection: newTurnDirection, measurementCount: newMeasurementCount, gameEnded };
      });

      setSelectedCard(null);

      if (playedCardType === CardType.UNITARY) {
        setMessage('ユニタリカードの効果で、もう一度あなたのターンです。プレイ順が逆転しました。');
      } else if (playedCardType === CardType.MEASUREMENT) {
        setMessage(`測定しました。+1点を獲得。`);
        advanceTurn();
      } else {
        setMessage(null);
        advanceTurn();
      }
      return;
    }

    // If nothing is selected, show a message.
    if (!selectedCard && !controlCardPlacementState) {
      setMessage('先に手札からカードを選択してください。');
    }
  };

  const handlePass = () => {
    setGameState(prevGameState => {
      if (!prevGameState) return null;

      const updatedPlayers = prevGameState.players.map(player => {
        if (player.id === prevGameState.currentPlayerId) {
          const newPasses = player.passes + 1;
          // Check for game over condition due to passes
          if (newPasses >= 4) {
            // This player is out of the game, calculate their score
            // For now, just mark game as ended for simplicity
            return { ...player, passes: newPasses };
          }
          return { ...player, passes: newPasses };
        }
        return player;
      });

      // Check if all players have passed or if game should end
      const allPlayersPassed = updatedPlayers.every(p => p.passes >= 3); // Assuming 3 passes max before game over
      const gameEnded = updatedPlayers.some(p => p.passes >= 4) || allPlayersPassed;

      return {
        ...prevGameState,
        players: updatedPlayers,
        gameEnded: gameEnded,
      };
    });
    advanceTurn(); // Advance turn after passing
  };

  useEffect(() => {
    try {
      // Placeholder player names for now
      const initialPlayerNames = ['プレイヤーA', 'プレイヤーB', 'プレイヤーC'];
      const initialGameState = initializeGame(initialPlayerNames);
      setGameState(initialGameState);
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setError(err instanceof Error ? err.message : 'ゲームの初期化に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-700 text-white">
        <p className="text-2xl">ゲームをロード中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-700 text-white">
        <p className="text-2xl">エラー: {error}</p>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-700 text-white">
        <p className="text-2xl">ゲーム状態が利用できません。</p>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(
    (player) => player.id === gameState.currentPlayerId
  );

  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-700 text-white">
        <p className="text-2xl">現在のプレイヤーが見つかりません。</p>
      </div>
    );
  }

  const otherPlayers = gameState.players.filter(
    (player) => player.id !== gameState.currentPlayerId
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-700 text-white p-4">
      {/* Top section: Other players' info */}
      <div className="flex justify-around mb-4">
        {otherPlayers.map((player) => (
          <div key={player.id} className="text-center">
            <p className="text-lg font-semibold">{player.name}</p>
            <p>手札: {player.hand.length}枚</p>
            <p>パス: {player.passes}回</p>
            <p>得点: {player.score}</p>
          </div>
        ))}
      </div>

      {/* Middle section: Game Board */}
      <div className="flex-grow flex items-center justify-center mb-4">
        <GameBoard board={gameState.board} onCardSlotClick={handleCardSlotClick} />
      </div>

      {/* Bottom section: Current player's hand and game info */}
      <div className="flex flex-col items-center">
        <div className="mb-4 text-center">
          <p className="text-2xl font-bold">現在のターン: {gameState.turn}</p>
          <p className="text-xl">測定回数: {gameState.measurementCount}/10</p>
          <p className="text-xl">現在のプレイヤー: {currentPlayer.name}</p>
          {gameState.gameEnded && <p className="text-red-500 text-3xl font-bold mt-4">��ーム終了！</p>}
          {message && <p className="text-red-400 text-lg mt-2">{message}</p>} {/* Display message */}
        </div>
        <PlayerHand
          hand={currentPlayer.hand}
          playerName={currentPlayer.name}
          isCurrentPlayer={true}
          onCardClick={handleCardSelect}
          selectedCard={selectedCard}
        />
        <button
          className="mt-4 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white text-xl rounded-lg shadow-lg transition duration-300"
          onClick={handlePass}
          disabled={gameState.gameEnded} // Disable pass button if game ended
        >
          パス ({currentPlayer.passes}/3)
        </button>
      </div>
    </div>
  );
};

export default GameScreen;