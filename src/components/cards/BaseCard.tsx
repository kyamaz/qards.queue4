import React from 'react';

export interface BaseCardProps {
  value: string;
  onClick?: () => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isAnimating?: boolean;
  isClickable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const BaseCard: React.FC<BaseCardProps & { backgroundColor: string }> = ({
  value,
  onClick,
  isSelected = false,
  isHighlighted = false,
  isAnimating = false,
  isClickable = true,
  className = '',
  backgroundColor,
  children
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
        rounded-lg border-2 transition-all duration-300 font-semibold text-sm text-white
        ${backgroundColor}
        ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
        ${isSelected ? 'ring-4 ring-cyan-400 ring-opacity-75 shadow-lg shadow-cyan-400/50 scale-105' : ''}
        ${isHighlighted ? 'ring-4 ring-cyan-400 ring-opacity-75 animate-pulse shadow-lg shadow-cyan-400/50' : ''}
        ${isAnimating ? 'animate-bounce scale-110' : ''}
        border-opacity-50 shadow-lg
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="text-center">
        <div className="text-lg font-bold">{value}</div>
        {children}
      </div>
    </div>
  );
};

export default BaseCard;