import React from 'react';
import { Card } from '../game/types';

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
        {playerName}の手札 {isCurrentPlayer && '(あなた)'}
      </h3>
      <div className="flex flex-wrap gap-3 justify-center">
        {hand.length === 0 ? (
          <p className="text-gray-400">手札がありません</p>
        ) : (
          hand.map((card) => (
            <div
              key={card.id}
              className={`w-20 h-28 bg-white text-gray-900 rounded-lg shadow-md flex flex-col items-center justify-center text-2xl font-bold cursor-pointer hover:scale-105 transition-transform duration-200
                ${selectedCard && selectedCard.id === card.id ? 'border-4 border-green-500' : ''}
              `}
              onClick={() => onCardClick(card)}
            >
              <span className="text-sm text-gray-500">{card.type.replace('_', ' ')}</span>
              {card.value}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerHand;
