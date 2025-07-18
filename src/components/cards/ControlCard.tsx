// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import BaseCard, { BaseCardProps } from './BaseCard';

interface ControlCardProps extends Omit<BaseCardProps, 'children'> {
  targetLaneIndex?: number;
}

const ControlCard: React.FC<ControlCardProps> = ({ targetLaneIndex, ...props }) => {
  return (
    <BaseCard 
      {...props} 
      backgroundColor="bg-yellow-600"
    >
      {targetLaneIndex !== undefined && (
        <div className="text-xs text-cyan-200 mt-1">
          →{targetLaneIndex + 1}
        </div>
      )}
    </BaseCard>
  );
};

export default ControlCard;