// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { useTranslation } from '@/i18n';
import { GameState, CardType } from '../game/types';
import { CardComponent } from './cards';

interface GameBoardProps {
  board: GameState['board'];
  onCardSlotClick: (laneIndex: number, position: number) => void;
  highlightedSlots?: {laneIndex: number; position: number}[];
  animatingCard?: string | null;
  playerCount: number;
  gameEnded?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  board, 
  onCardSlotClick, 
  highlightedSlots = [], 
  animatingCard,
  playerCount,
  gameEnded = false
}) => {
  const { t } = useTranslation();
  const totalCards = 60; // Total cards in deck (including INITIAL_QUBIT cards)
  const calculatedSlots = Math.floor(totalCards / (playerCount * 2));
  const maxLength = Math.max(...board.lane.map(l => l.length), calculatedSlots);
  const displayLength = maxLength + 1;

  const isSlotHighlighted = (laneIndex: number, position: number) => {
    return highlightedSlots.some(slot => slot.laneIndex === laneIndex && slot.position === position);
  };


  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-6xl mx-auto border border-gray-600" data-testid="quantum-circuit-board">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white" data-testid="board-title">{t('board.quantumCircuit')}</h3>
        <div className="flex gap-2 text-xs">
          <span className="bg-green-600 px-2 py-1 rounded text-white">{t('board.qubit')}</span>
          <span className="bg-blue-600 px-2 py-1 rounded text-white">{t('board.gate')}</span>
          <span className="bg-purple-600 px-2 py-1 rounded text-white">{t('board.unitary')}</span>
          <span className="bg-red-600 px-2 py-1 rounded text-white">{t('board.measurement')}</span>
          <span className="bg-yellow-600 px-2 py-1 rounded text-white">{t('board.control')}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex flex-col gap-3 min-w-max">
          {board.lane.map((lane, laneIndex) => (
            <div key={laneIndex} className="flex items-center relative" data-testid={`board-lane-${laneIndex}`}>
              <div className="flex flex-nowrap gap-2">
              {Array.from({ length: displayLength }).map((_, cardIndex) => {
                const card = lane[cardIndex] || null;
                const isControlCard = card?.type === CardType.CONTROL && card.controlLink;
                const targetLaneIndex = card?.controlLink?.targetLaneIndex;
                const isHighlighted = isSlotHighlighted(laneIndex, cardIndex);
                const isAnimating = !!(card && animatingCard === card.id);

                let lineElement = null;
                if (isControlCard && typeof targetLaneIndex === 'number') {
                  const laneHeightWithGap = 12 * 4 + 12; // h-12 + gap-3
                  const verticalDistance = (targetLaneIndex - laneIndex) * laneHeightWithGap;
                  
                  const lineStyle: React.CSSProperties = {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '3px',
                    height: `${Math.abs(verticalDistance)}px`,
                    backgroundColor: '#06b6d4', // cyan-500
                    transform: verticalDistance > 0 ? 'translateY(0)' : 'translateY(-100%)',
                    transformOrigin: 'top',
                    zIndex: 5,
                    borderRadius: '2px',
                    boxShadow: '0 0 8px rgba(6, 182, 212, 0.5)',
                  };
                  lineElement = <div style={lineStyle}></div>;
                }

                return (
                  <div key={card ? card.id : `empty-${laneIndex}-${cardIndex}`} className="relative">
                    <CardComponent
                      card={card}
                      position={cardIndex}
                      laneIndex={laneIndex}
                      onClick={gameEnded ? undefined : () => onCardSlotClick?.(laneIndex, cardIndex)}
                      isHighlighted={isHighlighted}
                      isAnimating={isAnimating}
                      isClickable={!gameEnded}
                    />
                    {lineElement}
                  </div>
                );
              })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
