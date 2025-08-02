// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { useTranslation } from '@/i18n';
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
  const { t } = useTranslation();

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full" data-testid="player-hand">
      <h3 className="text-xl font-semibold mb-4 text-white" data-testid="player-hand-title">
        {t('player.playerHand', { name: playerName })} {isCurrentPlayer && t('player.currentPlayer')}
      </h3>
      <div className="flex flex-wrap gap-3 justify-center" data-testid="hand-cards-container">
        {hand.length === 0 ? (
          <p className="text-gray-400" data-testid="empty-hand-message">{t('player.noCards')}</p>
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
