import React from 'react';
import { Card, GameState } from '../game/types';

interface GameBoardProps {
  board: GameState['board'];
  onCardSlotClick: (laneIndex: number, position: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onCardSlotClick }) => {
  const maxLength = Math.max(...board.lane.map(l => l.length), 10);
  const displayLength = maxLength + 1;

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-5xl mx-auto overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4 text-white">ゲームボード</h3>
      <div className="flex flex-col gap-2">
        {board.lane.map((lane, laneIndex) => (
          <div key={laneIndex} className="flex items-center relative"> {/* Each lane is a positioning context */}
            <span className="text-gray-400 mr-4 w-20 text-right">レーン {laneIndex + 1}:</span>
            <div className="flex flex-nowrap gap-2">
              {Array.from({ length: displayLength }).map((_, cardIndex) => {
                const card = lane[cardIndex] || null;
                const isControlCard = card?.type === 'CONTROL' && card.controlLink;
                const targetLaneIndex = card?.controlLink?.targetLaneIndex;

                let lineElement = null;
                if (isControlCard && typeof targetLaneIndex === 'number') {
                  const laneHeightWithGap = 7 * 16 + 8; // h-28 is 7rem (112px), gap-2 is 0.5rem (8px)
                  const verticalDistance = (targetLaneIndex - laneIndex) * laneHeightWithGap;
                  
                  const lineStyle: React.CSSProperties = {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '2px',
                    height: `${Math.abs(verticalDistance)}px`,
                    backgroundColor: 'cyan',
                    transform: verticalDistance > 0 ? 'translateY(0)' : 'translateY(-100%)',
                    transformOrigin: 'top',
                    zIndex: 5, // Ensure line is behind cards but visible
                  };
                  lineElement = <div style={lineStyle}></div>;
                }

                return (
                  <div
                    key={card ? card.id : `empty-${laneIndex}-${cardIndex}`}
                    className={`relative w-20 h-28 flex-shrink-0 flex items-center justify-center rounded-md z-10
                      ${card ? (isControlCard ? 'bg-purple-600' : 'bg-blue-500') : 'bg-gray-700 text-gray-500 border border-dashed border-gray-600'}
                      cursor-pointer hover:bg-gray-600 transition-colors duration-200
                    `}
                    onClick={() => onCardSlotClick(laneIndex, cardIndex)}
                  >
                    {card ? card.value : '空'}
                    {lineElement}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
