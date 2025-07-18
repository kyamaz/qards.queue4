// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
'use client';

import React from 'react';
import { Card } from '@/game/types';
import BaseCard from './BaseCard';

interface TargetCardProps {
  card: Card;
  onClick?: () => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isAnimating?: boolean;
  isClickable?: boolean;
  className?: string;
}

export const TargetCard: React.FC<TargetCardProps> = ({ 
  onClick, 
  isSelected = false,
  isHighlighted = false,
  isAnimating = false,
  isClickable = true,
  className = '' 
}) => {
  return (
    <BaseCard
      value="T"
      onClick={onClick}
      isSelected={isSelected}
      isHighlighted={isHighlighted}
      isAnimating={isAnimating}
      isClickable={isClickable}
      className={className}
      backgroundColor="bg-gray-300"
    >
      <div className="border-2 border-dashed border-gray-500 w-full h-full rounded flex items-center justify-center">
        <span className="text-gray-600 font-bold">T</span>
      </div>
    </BaseCard>
  );
};