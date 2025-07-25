// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';

interface EmptySlotProps {
  position: number;
  laneIndex?: number;
  onClick?: () => void;
  isHighlighted?: boolean;
  isClickable?: boolean;
}

const EmptySlot: React.FC<EmptySlotProps> = ({
  position,
  laneIndex,
  onClick,
  isHighlighted = false,
  isClickable = true
}) => {
  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ') && onClick) {
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={isClickable ? 0 : -1}
      className={`
        relative w-24 h-32 flex-shrink-0 flex flex-col items-center justify-center 
        rounded-lg border-2 transition-all duration-300 font-semibold text-sm
        bg-gray-700 text-gray-400 border-dashed border-gray-500
        ${isClickable ? 'cursor-pointer hover:bg-gray-600' : 'cursor-default'}
        ${isHighlighted ? 'ring-4 ring-cyan-400 ring-opacity-75 animate-pulse shadow-lg shadow-cyan-400/50' : ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="text-center">
        <div className="text-xs">
          {laneIndex !== undefined ? (
            <div>{laneIndex + 1}-{position}</div>
          ) : (
            <div>{position}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptySlot;