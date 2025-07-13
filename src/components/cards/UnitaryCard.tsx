import React from 'react';
import BaseCard, { BaseCardProps } from './BaseCard';

type UnitaryCardProps = Omit<BaseCardProps, 'children'>

const UnitaryCard: React.FC<UnitaryCardProps> = (props) => {
  return (
    <BaseCard 
      {...props} 
      backgroundColor="bg-purple-600"
    />
  );
};

export default UnitaryCard;