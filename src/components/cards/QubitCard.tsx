// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import BaseCard, { BaseCardProps } from './BaseCard';
import { CardType } from '../../game/types';

interface QubitCardProps extends Omit<BaseCardProps, 'children'> {
  cardType: CardType.QUBIT | CardType.INITIAL_QUBIT;
}

const QubitCard: React.FC<QubitCardProps> = ({ cardType, ...props }) => {
  const backgroundColor = cardType === CardType.INITIAL_QUBIT ? 'bg-green-800' : 'bg-green-600';
  
  return (
    <BaseCard 
      {...props} 
      backgroundColor={backgroundColor}
    />
  );
};

export default QubitCard;