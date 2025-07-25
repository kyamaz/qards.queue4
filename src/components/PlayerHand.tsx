// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { Card } from '../game/types';
import { CardComponent } from './cards';

interface PlayerHandProps {
  hand: Card[];
  playerName: string;
  isCurrentPlayer: boolean;
  onCardClick: (card: Card) => void;
  selectedCard?: Card | null;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ hand, playerName, isCurrentPlayer, onCardClick, selectedCard }) => {

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full">
      <h3 className="text-xl font-semibold mb-4 text-white">
        {playerName}の手札 {isCurrentPlayer && '(現在のプレイヤー)'}
      </h3>
      <div className="flex flex-wrap gap-3 justify-center">
        {hand.length === 0 ? (
          <p className="text-gray-400">手札がありません</p>
        ) : (
          hand.map((card, index) => (
            <CardComponent
              key={card.id}
              card={card}
              position={index}
              onClick={() => isCurrentPlayer && onCardClick?.(card)}
              isSelected={selectedCard?.id === card.id}
              isClickable={isCurrentPlayer}
              className={!isCurrentPlayer ? 'opacity-75' : ''}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerHand;
